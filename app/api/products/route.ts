// pages/api/products/route.ts
import { dateNowIsoFormat } from "@/helpers/dateHelpers"
import { catchError } from "@/helpers/responseHelper"
import { customSlugify } from "@/helpers/slugify"
import {
  bulkUploadImage,
  singleUploadImage,
  type bulkUploadImage as bulkUploadImageType,
} from "@/library/BulkUploadImage"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { getCategoryById } from "@/models/Query/category.query"
import { Category } from "@/models/interfaces/category.interfaces"
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
    
    // Get all unique category IDs from products
    const categoryIds = [
      ...new Set(
        collectionData
          .map((product) => product.category)
          .filter((catId) => catId && ObjectId.isValid(catId))
          .map((catId) => new ObjectId(catId)),
      ),
    ]

    // Fetch all categories at once
    const categoryMap = new Map<string, string>()
    if (categoryIds.length > 0) {
      const categoryCollection = await getMongoCollection<Category>("categories")
      const categories = await categoryCollection
        .find({ _id: { $in: categoryIds } })
        .toArray()
      
      // Create a map of category ID to category name
      categories.forEach((category) => {
        if (category._id) {
          categoryMap.set(category._id.toHexString(), category.name)
        }
      })
    }

    // Map category names to products
    const productsWithCategoryNames = collectionData.map((product) => {
      let categoryName: string = ""
      if (product.category) {
        // Convert category to string (handles both string and ObjectId from MongoDB)
        const categoryIdStr = String(product.category)
        categoryName = categoryMap.get(categoryIdStr) || categoryIdStr
      }
      
      return {
        ...product,
        categoryName: categoryName,
      }
    })

    response.total = esResult.hits.total.value
    response.data = productsWithCategoryNames

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
    const newCollection = await req.formData()
    const payload = newCollection.get("payload") as string
    const dataPayload = JSON.parse(payload)

    const validMsg = await dataValidation(dataPayload)
    if (validMsg != "") {
      return NextResponse.json(
        {
          success: false,
          message: validMsg,
        },
        { status: 401 },
      )
    }

    const isVerified = await dataVerification(dataPayload)
    if (isVerified != "") {
      return NextResponse.json(
        {
          success: false,
          message: isVerified,
        },
        { status: 401 },
      )
    }
    // UPLOAD IMAGES
    const imageHandler = await handleUploadImages(newCollection)

    // Handle image upload errors (only if there was an actual error, not just empty)
    if (
      typeof imageHandler.uploadBrand === "string" &&
      imageHandler.uploadBrand !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: imageHandler.uploadBrand,
        },
        { status: 400 },
      )
    }
    if (
      typeof imageHandler.uploadImgFiles === "string" &&
      imageHandler.uploadImgFiles !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: imageHandler.uploadImgFiles,
        },
        { status: 400 },
      )
    }
    if (
      typeof imageHandler.uploadVariantImgs === "string" &&
      imageHandler.uploadVariantImgs !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: imageHandler.uploadVariantImgs,
        },
        { status: 400 },
      )
    }

    // Prepare product images
    const productImages =
      Array.isArray(imageHandler.uploadImgFiles) &&
      imageHandler.uploadImgFiles.length > 0
        ? imageHandler.uploadImgFiles.map((img) => img.url)
        : []

    // Update brand logo if uploaded
    const brandData = { ...dataPayload.brand }
    if (
      imageHandler.uploadBrand &&
      typeof imageHandler.uploadBrand !== "string"
    ) {
      brandData.logoUrl = imageHandler.uploadBrand.url
    }

    // Update variant images if uploaded
    const variantsData = dataPayload.variants ? [...dataPayload.variants] : []
    const uploadedVariantImgs = imageHandler.uploadVariantImgs
    if (Array.isArray(uploadedVariantImgs) && uploadedVariantImgs.length > 0) {
      let variantImgIndex = 0
      variantsData.forEach((variant, index) => {
        // Use images array length to determine how many images this variant should have
        // The frontend sends images in order, so we match them sequentially
        const variantImageCount = variant.images?.length || 0
        if (variantImageCount > 0 && variantImgIndex < uploadedVariantImgs.length) {
          const variantImages = uploadedVariantImgs
            .slice(variantImgIndex, variantImgIndex + variantImageCount)
            .map((img) => img.url)
          variantsData[index] = {
            ...variant,
            images: variantImages,
          }
          variantImgIndex += variantImageCount
        }
      })
    }

    const docCollection = await getMongoCollection<Products>(COLLECTION_NAME)
    const dateNow = dateNowIsoFormat()
    const insertDoc: Products = {
      ...dataPayload,
      uuid: v4(),
      name: dataPayload.name,
      description: dataPayload.description,
      sku: dataPayload.sku,
      brand: brandData,
      category: dataPayload.category,
      storeUUId: dataPayload.storeUUId,
      images: productImages,
      tags: dataPayload.tags || "",
      price: dataPayload.price,
      currency: dataPayload.currency ?? Currency.RUPIAH,
      discount: dataPayload.discount || [],
      availability: dataPayload.availability ?? Availability.INSTOCK,
      stockQty: dataPayload.stockQty,
      minOrder: dataPayload.minOrder ?? 1,
      options: dataPayload.options || [],
      status: dataPayload.status,
      weight: dataPayload.weight,
      variants: variantsData,
      averageRating: 0,
      slug: await customSlugify(dataPayload.name),
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
    sku,
    status,
    min_price,
    max_price,
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

  const priceMin = min_price ?? "0"
  const priceMax = max_price ?? "99999999"
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
  if (data.discount && Array.isArray(data.discount)) {
    for (const discount of data.discount) {
      if (
        !Object.keys(discount).every((prop) =>
          allowedDiscountProp.includes(prop),
        )
      ) {
        return `Allowed props for discount is ${allowedDiscountProp.join("|")}`
      }
    }
  } else if (data.discount && !Array.isArray(data.discount)) {
    return "Discount must be an array"
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

async function handleUploadImages(collection: FormData) {
  const brandImgs = collection.get("brandFiles") as File | null
  const variantImgs = collection.getAll("variantImgFiles[]")
  const imgFiles = collection.getAll("imagesFile[]")

  // upload brand images (optional)
  let uploadBrand: string | bulkUploadImageType = ""
  if (brandImgs && brandImgs instanceof File && brandImgs.size > 0) {
    uploadBrand = await singleUploadImage(brandImgs, "brands")
  }

  // upload variant images (optional)
  let uploadVariantImgs: string | bulkUploadImage[] = []
  if (variantImgs && variantImgs.length > 0) {
    uploadVariantImgs = await bulkUploadImage(variantImgs, "variants")
  }

  // upload product images (optional)
  let uploadImgFiles: string | bulkUploadImage[] = []
  if (imgFiles && imgFiles.length > 0) {
    uploadImgFiles = await bulkUploadImage(imgFiles, "products")
  }

  return {
    uploadBrand,
    uploadVariantImgs,
    uploadImgFiles,
  }
}
