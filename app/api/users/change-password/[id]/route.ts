// pages/api/users/[id]/route.ts
import { SALT_LENGTH } from "@/constants/commonConstant"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { changePassword, User } from "@/models/interfaces/users.interfaces"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

interface RouteContext {
  params: {
    id: string
  }
}

const INDEX_NAME = "users_index"
const COLLECTION_NAME = "users"

export async function PUT(req: NextRequest, context: RouteContext) {
  const body = await req.json()

  const { id } = await context.params

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      message: `Invalid UserId`,
    })
  }

  if (!body.oldPassword || !body.newPassword || !body.renewPassword) {
    return NextResponse.json(
      {
        success: false,
        message: `Form is not complete, please fill in required fields!`,
      },
      { status: 400 },
    )
  }

  const checkCredential = await validateUser(id, body)
  if (checkCredential != "") {
    return NextResponse.json(
      {
        success: false,
        message: checkCredential,
      },
      { status: 400 },
    )
  }

  const newPass = await bcrypt.hash(body.newPassword, SALT_LENGTH)
  const updatePassword = { password: newPass }

  const usersCollection = await getMongoCollection<User>(COLLECTION_NAME)
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePassword },
    { returnDocument: "after" },
  )

  const esDocument: User = {
    name: result.name,
    username: result.username,
    email: result.email,
    roles: result.roles,
    password: result.password,
    status: result.status,
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

async function validateUser(id: string, body: changePassword): Promise<string> {
  if (body.newPassword == body.oldPassword) {
    return "New password cannot be the same as your old password."
  }

  if (body.newPassword !== body.renewPassword) {
    return "newpassword and renewpassword is incorrect"
  }

  const usersCollection = await getMongoCollection<User>(COLLECTION_NAME)
  const user = await usersCollection.findOne({ _id: new ObjectId(id) })

  if (!user) {
    return "User not found"
  }

  const isOldPasswordCorrect = await bcrypt.compare(
    body.oldPassword,
    user.password,
  )

  if (!isOldPasswordCorrect) {
    return "The old password you entered is incorrect."
  }

  return ""
}
