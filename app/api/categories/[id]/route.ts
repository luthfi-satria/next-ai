// pages/api/categories/[id]/route.ts
import elasticsearch from '@/library/elasticsearch'
import { getMongoCollection } from '@/library/mongodb'
import { Category } from '@/models/interfaces/category.interfaces'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: {
    id: string
  }
}

const CATEGORY_INDEX = 'categories_index'
const COLLECTION_NAME = 'categories'

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params

        const esCollection = await getMongoCollection<Category>(COLLECTION_NAME)
        const searchData = await esCollection.findOne({ _id: new ObjectId(id) })

        if(!searchData){
            return NextResponse.json( { success: false, message: 'Category not found'})
        }

        return NextResponse.json({ success: true, data: searchData }, { status: 200 })
    } catch (error: any) {
        console.error('Error in GET /api/categories/[id]:', error)
        return NextResponse.json({ success: false, message: 'Failed to fetch category', error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    const { id } = await context.params

    if(!ObjectId.isValid(id)){
        return NextResponse.json({ success: false, message: `Invalid Category ID format` })
    }

    const esCollection = await getMongoCollection<Category>(COLLECTION_NAME)
    const objectId = new ObjectId(id)
    const result = await esCollection.deleteOne({ _id: objectId })
    
    if(result.deletedCount === 0){
      return NextResponse.json({ success: false, message: `Category not found or already deleted.` }, { status: 404 })
    }

    if(result.deletedCount > 0){
      await elasticsearch.deleteDocument({
        index: CATEGORY_INDEX,
        id: id
      })
    }

    return NextResponse.json({ success: true, message: `Delete success`}, { status: 200 })
}