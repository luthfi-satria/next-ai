// pages/api/products/route.ts
import { dateNowIsoFormat } from "@/helpers/dateHelpers"
import { catchError } from "@/helpers/responseHelper"
import { customSlugify } from "@/helpers/slugify"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { getCategoryById } from "@/models/Query/category.query"
import { getStoreById } from "@/models/Query/store.query"
import { ElasticsearchQuery } from "@/models/interfaces/elasticsearch.interfaces"
import { Currency } from "@/models/interfaces/global.interfaces"
import {
  Availability,
  ProductInfo,
  Products,
  searchProduct,
} from "@/models/interfaces/products.interfaces"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"
import { v4 } from "uuid"

const INDEX_NAME = "products_index"
const COLLECTION_NAME = "products"

export async function GET(req: NextRequest) {
  try {
    const { esResult, page, limit } = await buildElasticQuery(req)
    const response = {
      page: page,
      per_page: limit,
      total: 0,
      data: [],
    }

    if ("error" in esResult) {
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      )
    }
    const esIds = esResult.hits.hits.map((hit) => new ObjectId(hit._id))
    const docCollection = await getMongoCollection<Products>(COLLECTION_NAME)
    console.log(`esIds`, esIds)
    const collectionData = await docCollection
      .find({ _id: { $in: esIds } })
      .toArray()
    response.total = esResult.hits.total.value
    response.data = collectionData

    return NextResponse.json(
      { success: true, results: response },
      { status: 200 },
    )
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error(`Error in GET /api/${COLLECTION_NAME}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch ${COLLECTION_NAME}`,
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const newCollection: ProductInfo = await req.json()

    const validMsg = await dataValidation(newCollection)
    if (validMsg != "") {
      return NextResponse.json(
        {
          success: false,
          message: validMsg,
        },
        { status: 401 },
      )
    }

    const isVerified = await dataVerification(newCollection)
    if (isVerified != "") {
      return NextResponse.json(
        {
          success: false,
          message: isVerified,
        },
        { status: 401 },
      )
    }

    const docCollection = await getMongoCollection<Products>(COLLECTION_NAME)
    const dateNow = dateNowIsoFormat()
    const insertDoc: Products = {
      ...newCollection,
      uuid: v4(),
      availability: newCollection.availability ?? Availability.INSTOCK,
      minOrder: newCollection.minOrder ?? 1,
      currency: newCollection.currency ?? Currency.RUPIAH,
      averageRating: 0,
      images: [],
      options: newCollection.options,
      slug: await customSlugify(newCollection.name),
      discount: newCollection.discount,
      variants: newCollection.variants,
      createdAt: dateNow,
      updatedAt: dateNow,
    }
    const result = await docCollection.insertOne(insertDoc)

    delete insertDoc._id
    // integrate with elasticsearch
    await elasticsearch.indexDocument({
      index: INDEX_NAME,
      id: result.insertedId.toHexString(),
      document: insertDoc,
    })

    return NextResponse.json(
      {
        success: true,
        data: result.insertedId,
        message: "Product created successfully",
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error(`Error in POST /api/${COLLECTION_NAME}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to create ${COLLECTION_NAME}`,
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json()

  const id = body._id as ObjectId

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      message: `Invalid ${COLLECTION_NAME} ID format`,
    })
  }

  const validMsg = await dataValidation(body)
  if (validMsg != "") {
    return NextResponse.json(
      {
        success: false,
        message: validMsg,
      },
      { status: 401 },
    )
  }

  const isVerified = await dataVerification(body)
  if (isVerified != "") {
    return NextResponse.json(
      {
        success: false,
        message: isVerified,
      },
      { status: 401 },
    )
  }

  delete body._id

  const docCollection = await getMongoCollection<Products>(COLLECTION_NAME)
  const dateNow = dateNowIsoFormat()
  const updateDoc: Products = {
    ...body,
    availability: body.availability ?? Availability.INSTOCK,
    minOrder: body.minOrder ?? 1,
    currency: body.currency ?? Currency.RUPIAH,
    options: body.options,
    slug: await customSlugify(body.name),
    discount: body.discount,
    variants: body.variants,
    createdAt: dateNow,
    updatedAt: dateNow,
  }

  const result = await docCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: body },
    { returnDocument: "after" },
  )

  await elasticsearch.upsertDocument({
    index: INDEX_NAME,
    id: result._id.toHexString(),
    document: updateDoc,
  })

  return NextResponse.json(
    { success: true, message: `Update success`, data: result },
    { status: 200 },
  )
}

async function buildElasticQuery(req) {
  const {
    name,
    brand,
    category,
    is_discount,
    sku,
    status,
    price_min,
    price_max,
    store_id,
    page,
    limit,
  }: searchProduct = Object.fromEntries(req.nextUrl.searchParams.entries())

  const currPage = parseInt(page || "1", 10)
  const sizeParam = parseInt(limit || "10", 10)
  const from = (currPage - 1) * sizeParam

  let esQuery: ElasticsearchQuery = {
    bool: {
      must: [],
      filter: [],
    },
  }
  if (name) {
    esQuery.bool.must.push({
      multi_match: {
        query: name,
        fields: ["name.autocomplete"],
        type: "best_fields",
      },
    })
  }

  if (sku) {
    esQuery.bool.filter.push({
      term: { sku: sku },
    })
  }

  if (brand) {
    esQuery.bool.filter.push({
      term: { "brand.name.keyword": brand },
    })
  }

  if (category) {
    esQuery.bool.filter.push({
      term: { "category.keyword": category },
    })
  }

  if (is_discount) {
    esQuery.bool.filter.push({
      range: {
        "discount.value": {
          gt: 0,
        },
      },
    })
  }

  if (status) {
    esQuery.bool.filter.push({
      term: { status: status },
    })
  }

  if (store_id) {
    esQuery.bool.filter.push({
      term: { storeUUId: store_id },
    })
  }

  const priceMin = price_min ?? "0"
  const priceMax = price_max ?? "99999999"
  esQuery.bool.filter.push({
    range: {
      price: {
        gt: parseFloat(priceMin),
        lte: parseFloat(priceMax),
      },
    },
  })

  if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
    esQuery = { match_all: {} }
  }

  const esResult = await elasticsearch.search({
    index: INDEX_NAME,
    query: esQuery,
    size: sizeParam,
    from: from,
  })

  return { esResult, page, limit }
}

async function dataValidation(data: ProductInfo): Promise<string> {
  if (!data.name) {
    return "Name is required"
  }

  if (!data.category) {
    return "Category is required"
  }

  if (!data.description) {
    return "Description is required"
  }

  if (!data.minOrder) {
    return "Minimum order is required"
  }

  if (!data.price) {
    return "Price is required"
  }

  if (!data.sku) {
    return "Product SKU is required"
  }

  if (!data.storeUUId) {
    return "Store is required"
  }

  if (!data.availability) {
    return "Availablity type is required"
  }

  const allowedBrandProp: string[] = ["name", "logoUrl"]
  if (
    data.brand &&
    !Object.keys(data.brand).every((prop) => allowedBrandProp.includes(prop))
  ) {
    return "Allowed props for brand is name and logoUrl only"
  }

  const allowedDiscountProp: string[] = ["type", "value", "start", "end"]
  if (
    data.discount &&
    !Object.keys(data.discount).every((prop) =>
      allowedDiscountProp.includes(prop),
    )
  ) {
    return `Allowed props for discount is ${allowedDiscountProp.join("|")}`
  }

  const allowedVariantProp: string[] = [
    "sku",
    "attributes",
    "price",
    "stockQty",
    "images",
  ]
  if (
    data.variants &&
    !Object.keys(data.variants).every((prop) =>
      allowedVariantProp.includes(prop),
    )
  ) {
    return `Allowed props for variants is ${allowedVariantProp.join("|")}`
  }
  return ""
}

async function dataVerification(data: ProductInfo): Promise<string> {
  // Checking category
  const category = await getCategoryById(data.category)
  if (!category) {
    return "Category is not found"
  }

  const store = await getStoreById(data.storeUUId)
  if (!store) {
    return "Store is not found"
  }
  return ""
}
