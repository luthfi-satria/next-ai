// pages/api/categories/route.ts
import { dateNowIsoFormat } from "@/helpers/dateHelpers"
import { catchError } from "@/helpers/responseHelper"
import { customSlugify } from "@/helpers/slugify"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import {
  AggregateCond,
  Category,
} from "@/models/interfaces/category.interfaces"
import { ElasticsearchQuery } from "@/models/interfaces/elasticsearch.interfaces"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const CATEGORY_INDEX = "categories_index"
const COLLECTION_NAME = "categories"

export async function GET(req: NextRequest) {
  try {
    const { search, publish, parent, level, page, limit } = Object.fromEntries(
      req.nextUrl.searchParams.entries(),
    )

    const currPage = parseInt(page || "1", 10)
    const sizeParam = parseInt(limit || "10", 10)
    const from = (currPage - 1) * sizeParam

    let esQuery: ElasticsearchQuery = {
      bool: {
        must: [],
        filter: [],
      },
    }
    if (search) {
      esQuery.bool.must.push({
        multi_match: {
          query: search,
          fields: ["name.autocomplete"],
          type: "best_fields",
        },
      })
    }

    if (publish) {
      esQuery.bool.filter.push({
        term: { "publish.keyword": publish },
      })
    }

    if (parent) {
      esQuery.bool.filter.push({
        term: { "parentId.keyword": parent },
      })
    }

    if (level) {
      esQuery.bool.filter.push({
        term: { level: level },
      })
    }

    if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
      esQuery = { match_all: {} }
    }

    const esResult = await elasticsearch.search({
      index: CATEGORY_INDEX,
      query: esQuery,
      size: sizeParam,
      from: from,
    })

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

    const docCollection = await getMongoCollection<Category>(COLLECTION_NAME)

    // const category = await docCollection.find({ _id: {$in: esObjectIds} }).toArray() // Fetch all category
    const category = await docCollection
      .aggregate<Category>(AggregateCond(esIds, COLLECTION_NAME))
      .toArray()
    response.total = esResult.hits.total.value
    response.data = category

    return NextResponse.json(
      { success: true, results: response },
      { status: 200 },
    )
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in GET /api/categories:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch category",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const newCollection: Category = await req.json()
    if (!newCollection.name) {
      return NextResponse.json(
        { success: false, message: "Category name are required" },
        { status: 400 },
      )
    }
    const dateNow = dateNowIsoFormat()

    newCollection.slug = await customSlugify(newCollection.name)
    newCollection.level = 0
    if (newCollection.parentId) {
      newCollection.parentId = new ObjectId(newCollection.parentId)
    }
    newCollection.ancestors = []
    newCollection.createdAt = dateNow
    newCollection.updatedAt = dateNow
    const collectionPath: string[] = [newCollection.name]
    const docCollection = await getMongoCollection<Category>(COLLECTION_NAME)

    if (newCollection.parentId) {
      const categoryParent = await docCollection.findOne({
        _id: newCollection.parentId,
      })
      if (categoryParent) {
        newCollection.level = categoryParent.level + 1
        newCollection.ancestors = [
          ...categoryParent.ancestors,
          categoryParent._id,
        ]
        collectionPath.unshift(categoryParent.path)
        newCollection.path = collectionPath.join(">")
      }
    }

    const result = await docCollection.insertOne(newCollection)

    const insertDoc = {
      id: result.insertedId.toHexString(),
      slug: newCollection.slug,
      name: newCollection.name,
      description: newCollection.description,
      level: newCollection.level,
      parentId: newCollection.parentId,
      ancestors: newCollection.ancestors,
      imageUrl: newCollection.imageUrl,
      meta_title: newCollection.meta_title,
      meta_description: newCollection.meta_description,
      meta_keywords: newCollection.meta_keywords,
      path: newCollection.path,
      publish: newCollection.publish,
      created_at: dateNow,
      updated_at: dateNow,
    }

    // integrate with elasticsearch
    await elasticsearch.indexDocument({
      index: CATEGORY_INDEX,
      id: insertDoc.id,
      document: insertDoc,
    })

    return NextResponse.json(
      {
        success: true,
        data: result.insertedId,
        message: "Category created successfully",
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in POST /api/categories:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  const body: Category = await req.json()
  const dateNow = dateNowIsoFormat()

  body.slug = await customSlugify(body.name)
  body.level = 0
  body.ancestors = []
  body.updatedAt = dateNow
  if (body.parentId) {
    body.parentId = new ObjectId(body.parentId)
  }
  const collectionPath: string[] = [body.name]
  const docCollection = await getMongoCollection<Category>(COLLECTION_NAME)

  if (body.parentId) {
    const categoryParent = await docCollection.findOne({ _id: body.parentId })

    if (categoryParent) {
      body.level = categoryParent.level + 1
      body.ancestors = [...categoryParent.ancestors, categoryParent._id]
      collectionPath.unshift(categoryParent.path)
      body.path = collectionPath.join(">")
    }
  }

  const id = body._id as ObjectId

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      message: `Invalid category ID format`,
    })
  }

  delete body._id

  const result = await docCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: body },
    { returnDocument: "after" },
  )

  const esDocument = {
    slug: result.slug,
    name: result.name,
    description: result.description,
    level: result.level,
    parentId: result.parentId,
    ancestors: result.ancestors,
    imageUrl: result.imageUrl,
    meta_title: result.meta_title,
    meta_description: result.meta_description,
    meta_keywords: result.meta_keywords,
    path: result.path,
    publish: result.publish,
    updated_at: dateNow,
  }

  await elasticsearch.upsertDocument({
    index: CATEGORY_INDEX,
    id: result._id.toHexString(),
    document: esDocument,
  })

  return NextResponse.json(
    { success: true, message: `Update success`, data: result },
    { status: 200 },
  )
}
