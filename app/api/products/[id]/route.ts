import { catchError } from "@/helpers/responseHelper"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { Category } from "@/models/interfaces/category.interfaces"
import { Products } from "@/models/interfaces/products.interfaces"
import { Stores } from "@/models/interfaces/stores.interfaces"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"
interface RouteContext {
  params: {
    id: string
  }
}

const MONGO_INDEX = "products_index"
const COLLECTION_NAME = "products"

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const esCollection = await getMongoCollection<Products>(COLLECTION_NAME)
    const searchData = await esCollection.findOne({ _id: new ObjectId(id) })

    if (!searchData) {
      return NextResponse.json({
        success: false,
        message: "Product not found",
      })
    }

    const StoreCollection = await getMongoCollection<Stores>("stores")
    const storeData = await StoreCollection.findOne({
      _id: new ObjectId(searchData.storeUUId),
    })

    if (!storeData) {
      return NextResponse.json({
        success: false,
        message: `Store not found ${searchData.storeUUId}`,
      })
    }

    const CategoryCollection = await getMongoCollection<Category>("categories")
    const categoryData = await CategoryCollection.findOne({
      _id: new ObjectId(searchData.category),
    })

    if (!categoryData) {
      return NextResponse.json({
        success: false,
        message: `Category not found ${searchData.storeUUId}`,
      })
    }

    searchData.StoreName = storeData.name
    searchData.CategoryName = categoryData.name

    if (searchData.brand && searchData.brand.logoUrl) {
      searchData.brand.logoUrl = `/${searchData.brand.logoUrl}`
    }

    return NextResponse.json(
      { success: true, data: searchData },
      { status: 200 },
    )
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in GET /api/products/[id]", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      message: `Invalid Product ID format`,
    })
  }
  const esCollection = await getMongoCollection<Products>(COLLECTION_NAME)
  const objectId = new ObjectId(id)
  const result = await esCollection.deleteOne({ _id: objectId })

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { success: false, message: `Product not found or already deleted.` },
      { status: 404 },
    )
  }

  if (result.deletedCount > 0) {
    await elasticsearch.deleteDocument({
      index: MONGO_INDEX,
      id: id,
    })
  }

  return NextResponse.json(
    { success: true, message: `Delete success` },
    { status: 200 },
  )
}
