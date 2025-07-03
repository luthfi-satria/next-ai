import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { NewProduct, Product } from "@/models/interfaces/products.interfaces"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const productCollection = await getMongoCollection<Product>('product')
        const product = await productCollection.find({}).toArray() // Fetch all product

        return NextResponse.json({ success: true, data: product }, { status: 200 })
    } catch (error: any) {
        console.error('Error in GET /api/products:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch products', error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
        const product: NewProduct = await req.json()
        
        if (!product.name || !product.description) { 
            return NextResponse.json({ success: false, message: 'Name and description are required' }, { status: 400 })
        }

        const usersCollection = await getMongoCollection<Product>('products')

        const result = await usersCollection.insertOne(product)
        const insertedProduct = { ...product, _id: result.insertedId.toHexString() }

        // integrate with elasticsearch
        await elasticsearch.indexDocument({
            index: 'product_index',
            id: insertedProduct._id,
            document: insertedProduct,
        })

        return NextResponse.json({ success: true, data: result.insertedId, message: 'Product created successfully' }, { status: 201 })

}

export async function PUT(req: NextRequest) {

}