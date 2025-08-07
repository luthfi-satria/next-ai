import { getMongoCollection } from "@/library/mongodb"
import { LoginInfo } from "@/models/interfaces/authentication.interfaces"
import { User } from "@/models/interfaces/users.interfaces"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

const COLLECTION_NAME = "users"

export async function POST(req: NextRequest) {
  try {
    const postdata: LoginInfo = await req.json()
    const validateForm = await loginValidation(postdata)

    if (validateForm != "") {
      return NextResponse.json(
        {
          success: false,
          message: validateForm,
        },
        {
          status: 404,
        },
      )
    }

    // checking user
    const usersCollection = await getMongoCollection<User>(COLLECTION_NAME)
    const users = await usersCollection.findOne({
      email: postdata.email,
    })

    if (!users) {
      throw new Error(`invalid user credential`)
    }

    const passwordMatch = await bcrypt.compare(
      postdata.password,
      users.password,
    )

    if (!passwordMatch) {
      throw new Error(`invalid user credential`)
    }

    return NextResponse.json({
      success: true,
      message: `Welcome back user, {username}`,
      data: users,
    })
  } catch (error: unknown) {
    console.log(`Error on Auth Login: => `, error)
    return NextResponse.json({
      success: false,
      message: `Unauthorized, perhaps you need check your credentials`,
    })
  }
}

async function loginValidation(body: LoginInfo): Promise<string> {
  if (!body.email) {
    return `Email is required`
  }

  if (!body.password) {
    return `Password is required`
  }

  return ""
}
