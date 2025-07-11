// pages/api/products/route.ts
import elasticsearch from '@/library/elasticsearch'
import { getMongoCollection } from '@/library/mongodb'
import { Product } from '@/models/interfaces/products.interfaces'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

const PRODUCT_INDEX = 'products_index'
const COLLECTION_NAME = 'products'

export async function GET(req: NextRequest) {
    try {
        const { search, category, page, limit } = Object.fromEntries(req.nextUrl.searchParams.entries())

        const currPage = parseInt(page || '1', 10)
        const sizeParam = parseInt(limit || '10', 10)
        const from = (currPage - 1) * sizeParam

        let esQuery: any = { 
            bool: {
                must: [],
                filter: []
            }
        }
        if (search){
            esQuery.bool.must.push({
                multi_match: {
                    query: search,
                    fields: [
                        'name.autocomplete', 
                    ],
                    type: "best_fields",
                }
            })
        }

        if (category){
            esQuery.bool.filter.push({
                term: { category: category }
            })
        }

        if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
            esQuery = { match_all: {} }
        }

        const esResult = await elasticsearch.search({
            index: PRODUCT_INDEX,
            body: { query: esQuery },
            size: sizeParam,
            from: from
        })

        const esIds = esResult.hits.hits.map((hit: any) => hit._id)

        const esObjectIds = esIds.map((idString: string) => new ObjectId(idString))

        const productCollection = await getMongoCollection<Product>(COLLECTION_NAME)

        const products = await productCollection.find({ _id: {$in: esObjectIds} }).toArray() // Fetch all products
        const data = {
            page: page,
            per_page: limit,
            total: esResult.hits.total.value,
            data: products
        }

        return NextResponse.json({ success: true, results: data }, { status: 200 })
    } catch (error: any) {
        console.error('Error in GET /api/products:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch products', error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const newProduct: Product = await req.json()
        
        if (!newProduct.name) { 
            return NextResponse.json({ success: false, message: 'Product name are required' }, { status: 400 })
        }

        const productCollection = await getMongoCollection<Product>(COLLECTION_NAME)

        const result = await productCollection.insertOne(newProduct)
        const insertProduct = { 
            id: result.insertedId.toHexString(),
            name: newProduct.name,
            description: newProduct.description,
            category: newProduct.category,
            price: newProduct.price
        }

        // integrate with elasticsearch
        await elasticsearch.indexDocument({
            index: PRODUCT_INDEX,
            id: insertProduct.id,
            document: insertProduct,
        })

        return NextResponse.json({ success: true, data: result.insertedId, message: 'Product created successfully' }, { status: 201 })
    } catch (error: any) {
        console.error('Error in POST /api/products:', error)
        return NextResponse.json({ success: false, message: 'Failed to create product', error: error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest){
    const body = await req.json()

    const id = body._id as ObjectId

    if(!ObjectId.isValid(id)){
        return NextResponse.json( {success: false, message: `Invalid product ID format`})
    }

    delete body._id
    
    const productCollection = await getMongoCollection<Product>(COLLECTION_NAME)
    const result = await productCollection.findOneAndUpdate({_id: new ObjectId(id)}, { $set: body }, { returnDocument: 'after'})

    const esDocument = { 
        name: result.name,
        description: result.description,
        category: result.category,
        price: result.price
    }


    await elasticsearch.upsertDocument({
        index: PRODUCT_INDEX,
        id: result._id.toHexString(),
        document: esDocument,
    })

    return NextResponse.json( { success: true, message: `Update success`, data: result }, { status: 200 })
}