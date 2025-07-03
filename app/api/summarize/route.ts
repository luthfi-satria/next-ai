// src/pages/api/summarize.tsx

import { geminiContentGenerator } from "@/library/gemini"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: 'This is the summarize API endpoint. Please use POST.' })
}

// Export the default handler function for Next.js API routes
export async function POST(req: Request) {
  try {
    const { textToSummarize } = await req.json()

    if ( !textToSummarize ){
      throw new Error('invalid parameters')
    }

    if (typeof textToSummarize !== 'string' || textToSummarize.trim() === '') {
      return NextResponse.json({ error: 'Text to summarize is empty or invalid.' }, {status: 400})
    }

    const prompt = `please summarize these content: "${textToSummarize}"`
    const result = await geminiContentGenerator(prompt)
    const summary = result.text()

    return NextResponse.json({ summary: summary },{status: 200})

  } catch (error: any) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json({ error: `Failed to summarize text: ${error.message || 'Internal server error'}` }, {status: 500})
  }
}