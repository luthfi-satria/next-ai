import { dateNowIsoFormat } from "@/helpers/dateHelpers"
import { catchError } from "@/helpers/responseHelper"
import { bulkUploadImage } from "@/library/BulkUploadImage"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { Products } from "@/models/interfaces/products.interfaces"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

interface RouteContext {
  params: {
    id: string
  }
}
const INDEX_NAME = "products_index"
const COLLECTION_NAME = "products"

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const docCollection = await getMongoCollection<Products>(COLLECTION_NAME)
    const getProductInfo = await docCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!getProductInfo) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is not found",
        },
        { status: 401 },
      )
    }

    const formData = await req.formData()
    const files = formData.getAll("images") as unknown[]

    const dateNow = dateNowIsoFormat()
    const doUpload = await bulkUploadImage(files, "products-uploads")
    if (typeof doUpload == "string") {
      return NextResponse.json({
        success: false,
        message: doUpload,
      })
    }
    const imageList = doUpload.map((items) => items.url)

    await docCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          updatedAt: dateNow,
          images: [...getProductInfo.images, ...imageList],
        },
      },
    )

    const updatedProduct = {
      ...getProductInfo,
      updatedAt: dateNow,
      images: [...getProductInfo.images, ...imageList],
    }

    delete updatedProduct._id

    await elasticsearch.indexDocument({
      index: INDEX_NAME,
      id: id,
      document: updatedProduct,
    })

    return NextResponse.json(
      { success: true, results: updatedProduct },
      { status: 200 },
    )
  } catch (error: unknown) {
    const errorMsg = await catchError(error)
    console.error("Error in POST /api/products/[id]", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}
