// pages/api/categories/route.ts
import elasticsearch from '@/library/elasticsearch'
import { getMongoCollection } from '@/library/mongodb'
import { Category } from '@/models/interfaces/category.interfaces'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_INDEX = 'categories_index'
const COLLECTION_NAME = 'categories'

export async function GET(req: NextRequest) {
    try {
        const { search, publish, page, limit } = Object.fromEntries(req.nextUrl.searchParams.entries())

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

        if (publish){
            esQuery.bool.filter.push({
                term: { publish: publish }
            })
        }

        if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
            esQuery = { match_all: {} }
        }

        const esResult = await elasticsearch.search({
            index: CATEGORY_INDEX,
            body: { query: esQuery },
            size: sizeParam,
            from: from
        })

        console.log('esResult => ',esResult)

        if(!esResult){
            return NextResponse.json({success: false, results: []}, {status: 400})
        }
        const esIds = esResult.hits.hits.map((hit: any) => hit._id)

        const esObjectIds = esIds.map((idString: string) => new ObjectId(idString))

        const docCollection = await getMongoCollection<Category>(COLLECTION_NAME)

        const category = await docCollection.find({ _id: {$in: esObjectIds} }).toArray() // Fetch all category
        const data = {
            page: page,
            per_page: limit,
            total: esResult.hits.total.value,
            data: category
        }

        return NextResponse.json({ success: true, results: data }, { status: 200 })
    } catch (error: any) {
        console.error('Error in GET /api/category:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch category', error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const newCollection: Category = await req.json()
        
        if (!newCollection.name) { 
            return NextResponse.json({ success: false, message: 'Category name are required' }, { status: 400 })
        }

        const docCollection = await getMongoCollection<Category>(COLLECTION_NAME)

        const result = await docCollection.insertOne(newCollection)
        const insertDoc = { 
            id: result.insertedId.toHexString(),
            name: newCollection.name,
            description: newCollection.description,
            publish: newCollection.publish,
        }

        // integrate with elasticsearch
        await elasticsearch.indexDocument({
            index: CATEGORY_INDEX,
            id: insertDoc.id,
            document: insertDoc,
        })

        return NextResponse.json({ success: true, data: result.insertedId, message: 'Category created successfully' }, { status: 201 })
    } catch (error: any) {
        console.error('Error in POST /api/category:', error)
        return NextResponse.json({ success: false, message: 'Failed to create category', error: error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest){
    const body = await req.json()

    const id = body._id as ObjectId

    if(!ObjectId.isValid(id)){
        return NextResponse.json( {success: false, message: `Invalid category ID format`})
    }

    delete body._id
    
    const docCollection = await getMongoCollection<Category>(COLLECTION_NAME)
    const result = await docCollection.findOneAndUpdate({_id: new ObjectId(id)}, { $set: body }, { returnDocument: 'after'})

    const esDocument = { 
        name: result.name,
        description: result.description,
        publish: result.publish,
    }


    await elasticsearch.upsertDocument({
        index: CATEGORY_INDEX,
        id: result._id.toHexString(),
        document: esDocument,
    })

    return NextResponse.json( { success: true, message: `Update success`, data: result }, { status: 200 })
}