import { NextRequest, NextResponse } from "next/server"

const allowedOrigin = [
  "http://localhost:3000",
  "http://localhost:19006",
  "exp://192.168.1.2:8081",
  "http://localhost:8081",
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const origin = request.headers.get("origin") ?? ""

  if (allowedOrigin.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else {
    response.headers.set("Access-Control-Allow-origin", "*")
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  )
  response.headers.set("Access-Control-Max-Age", "86400")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}
