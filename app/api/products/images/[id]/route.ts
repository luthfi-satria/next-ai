import { dateNowIsoFormat } from "@/helpers/dateHelpers"
import { catchError } from "@/helpers/responseHelper"
import {
  bulkUploadImage,
  bulkUploadUnlinkImage,
} from "@/library/BulkUploadImage"
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
    const imageList = doUpload.map((items) => items.filename)

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

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params
    const { images } = await req.json()
    const docCollection = await getMongoCollection<Products>(COLLECTION_NAME)
    const productInfo = await docCollection.findOne({ _id: new ObjectId(id) })
    if (!productInfo) {
      return NextResponse.json(
        {
          success: false,
          message: "product is not found",
        },
        { status: 401 },
      )
    }
    if (!images) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select the image(s) to be deleted.",
        },
        { status: 401 },
      )
    }
    const productImages = productInfo.images.filter(
      (items) => !images.includes(items),
    )
    const dateNow = dateNowIsoFormat()

    await docCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          updatedAt: dateNow,
          images: productImages,
        },
      },
    )

    productInfo.images = productImages

    delete productInfo._id

    await elasticsearch.indexDocument({
      index: INDEX_NAME,
      id: id,
      document: productInfo,
    })

    const unlinkImage = await bulkUploadUnlinkImage(images)
    if (!unlinkImage) {
      throw new Error(`There is something wrong with deletion image process`)
    }
    return NextResponse.json({
      success: true,
      message: "Product image has been deleted",
    })
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    return NextResponse.json({
      success: false,
      message: errorMsg,
    })
  }
}
