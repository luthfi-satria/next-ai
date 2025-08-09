// pages/api/stores/route.ts
import { catchError } from "@/helpers/responseHelper"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { ElasticsearchQuery } from "@/models/interfaces/elasticsearch.interfaces"
import { Stores } from "@/models/interfaces/stores.interfaces"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"
import { v4 } from "uuid"

const INDEX_NAME = "stores_index"
const COLLECTION_NAME = "stores"

export async function GET(req: NextRequest) {
  try {
    const { search, publish, page, limit } = Object.fromEntries(
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
          fields: [
            "name.autocomplete",
            "address.autocomplete",
            "city.autocomplete",
            "province.autocomplete",
          ],
          type: "best_fields",
        },
      })
    }

    if (publish) {
      esQuery.bool.filter.push({
        term: { publish: publish },
      })
    }

    if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
      esQuery = { match_all: {} }
    }

    const esResult = await elasticsearch.search({
      index: INDEX_NAME,
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
    const esIds = esResult.hits.hits.map((hit) => hit._id)
    const docCollection = await getMongoCollection<Stores>(COLLECTION_NAME)

    const collectionData = await docCollection
      .find({ uuid_id: { $in: esIds } })
      .toArray()
    // const collectionData = await docCollection.find({ name: ($in: ['Buana Sakti'])}).toArray()
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
    const newCollection: Stores = await req.json()

    if (!newCollection.name) {
      return NextResponse.json(
        { success: false, message: "Store name are required" },
        { status: 400 },
      )
    }

    const docCollection = await getMongoCollection<Stores>(COLLECTION_NAME)
    newCollection.uuid_id = v4()
    const result = await docCollection.insertOne(newCollection)

    const insertDoc = {
      // id: result.insertedId.toHexString(),
      id: newCollection.uuid_id,
      uuid_id: newCollection.uuid_id,
      name: newCollection.name,
      address: newCollection.address,
      city: newCollection.city,
      province: newCollection.province,
      postalCode: newCollection.postalCode,
      location: {
        lat: newCollection.location.coordinates[0],
        lon: newCollection.location.coordinates[1],
      },
      publish: newCollection.publish,
    }

    // integrate with elasticsearch
    await elasticsearch.indexDocument({
      index: INDEX_NAME,
      id: insertDoc.id,
      document: insertDoc,
    })

    return NextResponse.json(
      {
        success: true,
        data: result.insertedId,
        message: "Stores created successfully",
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

  delete body._id

  const docCollection = await getMongoCollection<Stores>(COLLECTION_NAME)
  const result = await docCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: body },
    { returnDocument: "after" },
  )

  const esDocument = {
    name: result.name,
    address: result.address,
    city: result.city,
    province: result.province,
    postalCode: result.postalCode,
    location: {
      lat: result.location.coordinates[0],
      lon: result.location.coordinates[1],
    },
    publish: result.publish,
  }

  await elasticsearch.upsertDocument({
    index: INDEX_NAME,
    id: result._id.toHexString(),
    document: esDocument,
  })

  return NextResponse.json(
    { success: true, message: `Update success`, data: result },
    { status: 200 },
  )
}
