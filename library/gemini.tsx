import { GoogleGenerativeAI } from "@google/generative-ai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Check for API key at the module level
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set.")
}

export const geminiContentGenerator = async(prompt: string) => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: process.env.AI_MODEL })
  const result = await model.generateContent(prompt)
  return result.response
}