import {
  ACCESS_TOKEN_SECRET,
  REFRESH_INTERVAL,
  REFRESH_TOKEN_SECRET,
} from "@/constants/commonConstant"
import jwt from "jsonwebtoken"
interface JwtPayload {
  userId: string
}

export function generateAccessToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = { expiresIn: 7200 }
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options)
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_INTERVAL,
  })
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload
  } catch (error: unknown) {
    console.log(`error verify token`, error)
    return null
  }
}

export function refreshAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload
  } catch (error: unknown) {
    console.log(`error refresh access token`, error)
    return null
  }
}
