import { GET, POST } from "@/app/api/categories/route"
import { NextRequest } from "next/server"
import path from "path"

describe("categories feature", () => {
  const BASEURL = process.env.BASEURL ?? "http://localhost:3000"
  const USER_URL = path.join(BASEURL, "api/categories")
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test("should have GET METHOD", async () => {
    const MockRequest = new NextRequest(USER_URL, {
      method: "GET",
    })

    const response = await GET(MockRequest)
    const jsonResponse = await response.json()
    expect(response.status).toBe(200)
    expect(response.ok).toBe(true)
    expect(jsonResponse.message).toBe("GET method exists")
  })

  test("shoudl have POST METHOD", async () => {
    const MockRequest = new NextRequest(USER_URL, {
      method: "POST",
      body: JSON.stringify({
        userid: 1,
      }),
    })

    const response = await POST(MockRequest)
    const jsonResponse = await response.json()
    expect(response.status).toBe(200)
    expect(response.ok).toBe(true)
    expect(jsonResponse.message).toBe("POST method exists")
  })
})
