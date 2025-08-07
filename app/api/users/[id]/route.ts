// pages/api/users/[id]/route.ts
import { catchError } from "@/helpers/responseHelper"
import elasticsearch from "@/library/elasticsearch"
import { getMongoCollection } from "@/library/mongodb"
import { User } from "@/models/interfaces/users.interfaces"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

interface RouteContext {
  params: {
    id: string
  }
}
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const usersCollection = await getMongoCollection<User>("users")
    const user = await usersCollection.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" })
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 })
  } catch (error: unknown) {
    const errorMsg = catchError(error)
    console.error("Error in GET /api/users/[id]:", error)
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

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      message: `Invalid UserId format`,
    })
  }

  const usersCollection = await getMongoCollection<User>("users")
  const objectId = new ObjectId(id)
  const result = await usersCollection.deleteOne({ _id: objectId })

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { success: false, message: `User not found or already deleted.` },
      { status: 404 },
    )
  }

  if (result.deletedCount > 0) {
    await elasticsearch.deleteDocument({
      index: "users_index",
      id: id,
    })
  }

  return NextResponse.json(
    { success: true, message: `Delete success` },
    { status: 200 },
  )
}
