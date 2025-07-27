// pages/api/users/route.ts
import { SALT_LENGTH } from "@/constants/commonConstant";
import { dateNowIsoFormat } from "@/helpers/dateHelpers";
import elasticsearch from "@/library/elasticsearch";
import { getMongoCollection } from "@/library/mongodb";
import { User } from "@/models/interfaces/users.interfaces";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

const INDEX_NAME = "users_index";
const COLLECTION_NAME = "users";

export async function GET(req: NextRequest) {
  try {
    const { search, role, page, limit, status } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    const currPage = parseInt(page || "1", 10);
    const sizeParam = parseInt(limit || "10", 10);
    const from = (currPage - 1) * sizeParam;

    let esQuery: any = {
      bool: {
        must: [],
        filter: [],
      },
    };
    if (search) {
      esQuery.bool.must.push({
        multi_match: {
          query: search,
          fields: ["name.autocomplete", "email.autocomplete"],
          type: "best_fields",
        },
      });
    }

    if (role) {
      esQuery.bool.filter.push({
        term: { "roles.keyword": role },
      });
    }

    if (status) {
      esQuery.bool.filter.push({
        term: { status: status },
      });
    }

    if (esQuery.bool.must.length === 0 && esQuery.bool.filter.length === 0) {
      esQuery = { match_all: {} };
    }

    const esResult = await elasticsearch.search({
      index: INDEX_NAME,
      body: { query: esQuery },
      size: sizeParam,
      from: from,
    });

    const data = {
      page: page,
      per_page: limit,
      total: 0,
      data: [],
    };

    if (!esResult.error) {
      const esUserIds = esResult.hits.hits.map((hit: any) => hit._id);

      const esUserObjectIds = esUserIds.map(
        (idString: string) => new ObjectId(idString)
      );

      const usersCollection = await getMongoCollection<User>(COLLECTION_NAME);

      const users = await usersCollection
        .find({ _id: { $in: esUserObjectIds } })
        .toArray(); // Fetch all users
      data.total = esResult.hits.total.value;
      data.data = users;
    }

    return NextResponse.json({ success: true, results: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const newCollection: User = await req.json();

    if (!newCollection.name || !newCollection.email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!newCollection.roles) {
      return NextResponse.json(
        { success: false, message: "User role is required" },
        { status: 400 }
      );
    }

    if (!newCollection.password || !newCollection.repassword) {
      return NextResponse.json(
        {
          success: false,
          message: `password and re password are required or not matched!`,
        },
        { status: 400 }
      );
    }

    const usersCollection = await getMongoCollection<User>(COLLECTION_NAME);
    newCollection.password = await bcrypt.hash(
      newCollection.password,
      SALT_LENGTH
    );
    const dateNow = dateNowIsoFormat();
    newCollection.createdAt = dateNow;
    newCollection.updatedAt = dateNow;

    delete newCollection.repassword;

    const result = await usersCollection.insertOne(newCollection);
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
    };

    // integrate with elasticsearch
    await elasticsearch.indexDocument({
      index: INDEX_NAME,
      id: insertedUser.id,
      document: insertedUser,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.insertedId,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const id = body._id as ObjectId;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      message: `Invalid UserId format`,
    });
  }

  delete body._id;

  const usersCollection = await getMongoCollection<User>(COLLECTION_NAME);
  const dateNow = dateNowIsoFormat();
  body.updatedAt = dateNow;

  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: body },
    { returnDocument: "after" }
  );

  const esDocument: User = {
    name: result.name,
    username: result.username,
    email: result.email,
    roles: result.roles,
    password: result.password,
    status: result.status,
    updatedAt: result.updated_at,
  };

  await elasticsearch.upsertDocument({
    index: INDEX_NAME,
    id: result._id.toHexString(),
    document: esDocument,
  });

  return NextResponse.json(
    { success: true, message: `Update success`, data: result },
    { status: 200 }
  );
}
