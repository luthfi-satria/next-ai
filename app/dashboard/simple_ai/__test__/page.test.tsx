import { GET, POST } from "@/app/api/summarize/route"
import { NextRequest } from "next/server"
import path from "path"

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: jest.fn(() => ({
            generateContent: jest.fn(() => ({
                response: {
                    text: () => 'Mock Gemini Analysis Result'
                }
            })),
        })),
    })),
}))

describe('summarize feature', () => {
    const BASEURL = process.env.BASEURL ?? 'http://localhost:3000'
    const SUMMARIZE_URL = path.join(BASEURL, 'api/summarize')
    beforeEach(async() => {
        jest.clearAllMocks()
    })

    test('should have GET METHOD', async() => {
        const MockRequest = new NextRequest(SUMMARIZE_URL, {
            method: 'GET',
        })

        const response = await GET()
        const jsonResponse = await response.json()
        expect(response.status).toBe(200)
        expect(response.ok).toBe(true)
        expect(jsonResponse.message).toBe('This is the summarize API endpoint. Please use POST.')
    })

    test('should handle short string', async() => {
        const sampleText = {textToSummarize:' '}
        const MockRequest = new NextRequest(SUMMARIZE_URL, {
            method: "POST",
            body: JSON.stringify(sampleText)
        })
        const response = await POST(MockRequest)
        const jsonResponse = await response.json()
        expect(response.status).toBe(400)
        expect(response.ok).toBe(false)
        expect(jsonResponse.error).toBe('Text to summarize is empty or invalid.')
    })

    test('should summarizing text', async() => {
        const sampleText = {textToSummarize:'Potassium (symbol: K, atomic number: 19) is a soft, silvery-white alkali metal that tarnishes rapidly upon exposure to air. It is highly reactive and never found in its pure elemental form in nature, always occurring in compounds with other elements, such as in minerals (like potash, from which its name is derived) and dissolved in seawater.'}
        const MockRequest = new NextRequest(SUMMARIZE_URL, {
            method: "POST",
            body: JSON.stringify(sampleText)
        })
        const response = await POST(MockRequest)
        const jsonResponse = await response.json()

        expect(response.status).toBe(200)
        expect(response.ok).toBe(true)
        expect(jsonResponse.error).not.toBeDefined()
        expect(jsonResponse.summary).toBeDefined()
    })

    test('should error if has wrong input parameter', async() => {
        const sampleText = {text:' '}
        const MockRequest = new NextRequest(SUMMARIZE_URL, {
            method: "POST",
            body: JSON.stringify(sampleText)
        })
        const response = await POST(MockRequest)
        const jsonResponse = await response.json()
        expect(response.status).toBe(500)
        expect(response.ok).toBe(false)
        expect(jsonResponse.error).toBe('Failed to summarize text: invalid parameters')        
    })
})