// pages/api/users/route.ts
import { SALT_LENGTH } from "@/constants/commonConstant"
import { dateNowIsoFormat } from "@/helpers/dateHelpers"
import { catchError } from "@/helpers/responseHelper"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { ElasticsearchQuery } from "@/models/interfaces/elasticsearch.interfaces"
import { User, UserRoles } from "@/models/interfaces/users.interfaces"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const INDEX_NAME = "users_index"
const COLLECTION_NAME = "users"

export async function GET(req: NextRequest) {
  try {
    const { search, role, page, limit, status } = Object.fromEntries(
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
          fields: ["name.autocomplete", "email.autocomplete"],
          type: "best_fields",
        },
      })
    }

    if (role) {
      esQuery.bool.filter.push({
        term: { "roles.keyword": role },
      })
    }

    if (status) {
      esQuery.bool.filter.push({
        term: { status: status },
      })
    }

    if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
      esQuery = { match_all: {} }
    }

    const esResult = await elasticsearch.search({
      index: INDEX_NAME,
      body: { query: esQuery },
      size: sizeParam,
      from: from,
    })

    const data = {
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

    const esUserIds = esResult.hits.hits.map((hit) => new ObjectId(hit._id))

    const usersCollection = await getMongoCollection<User>(COLLECTION_NAME)

    const users = await usersCollection
      .find({ _id: { $in: esUserIds } })
      .toArray() // Fetch all users
    data.total = esResult.hits.total.value
    data.data = users

    return NextResponse.json({ success: true, results: data }, { status: 200 })
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in GET /api/users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const newCollection: User = await req.json()

    const validate = await validation(newCollection, true)

    if (validate !== "") {
      return NextResponse.json(
        { success: false, message: validate },
        { status: 400 },
      )
    }

    const usersCollection = await getMongoCollection<User>(COLLECTION_NAME)
    newCollection.password = await bcrypt.hash(
      newCollection.password,
      SALT_LENGTH,
    )
    const dateNow = dateNowIsoFormat()
    newCollection.createdAt = dateNow
    newCollection.updatedAt = dateNow

    delete newCollection.repassword

    const result = await usersCollection.insertOne(newCollection)
    const insertedUser: User = {
      id: result.insertedId.toHexString(),
      name: newCollection.name,
      username: newCollection.username,
      email: newCollection.email,
      roles: newCollection.roles,
      password: newCollection.password,
      status: newCollection.status,
      createdAt: newCollection.createdAt,
      updatedAt: newCollection.updatedAt,
    }

    // integrate with elasticsearch
    await elasticsearch.indexDocument({
      index: INDEX_NAME,
      id: insertedUser.id,
      document: insertedUser,
    })

    return NextResponse.json(
      {
        success: true,
        data: result.insertedId,
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in POST /api/users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    const id = body._id as ObjectId

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: `Invalid UserId format`,
      })
    }

    const validate = await validation(body)

    if (validate !== "") {
      return NextResponse.json(
        { success: false, message: validate },
        { status: 400 },
      )
    }

    delete body._id

    const usersCollection = await getMongoCollection<User>(COLLECTION_NAME)
    const dateNow = dateNowIsoFormat()
    body.updatedAt = dateNow

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body },
      { returnDocument: "after" },
    )

    const esDocument: User = {
      name: result.name,
      username: result.username,
      email: result.email,
      roles: result.roles,
      password: result.password,
      status: result.status,
      updatedAt: result.updated_at,
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
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in PUT /api/users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: errorMsg,
      },
      { status: 500 },
    )
  }
}

async function validation(
  newCollection: User,
  requiredPassword: boolean = false,
): Promise<string> {
  if (!newCollection.name || !newCollection.email) {
    return "Name and email are required"
  }

  if (!newCollection.roles) {
    return "User role is required"
  }

  if (
    requiredPassword &&
    (!newCollection.password || !newCollection.repassword)
  ) {
    return `password and re password are required or not matched!`
  }

  const roles = Object.keys(UserRoles).filter(
    (items) => UserRoles[items] == newCollection.roles,
  )

  if (roles.length == 0) {
    return `roles is not matched, allowed ${Object.keys(UserRoles)
      .map((items) => UserRoles[items])
      .join("|")}`
  }
  return ""
}
