// pages/api/seo-category-suggestions.ts
import { geminiContentGenerator } from '@/library/gemini'
import { CategoryType, SeoScores, SeoSuggestions } from '@/models/interfaces/category.interfaces'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, description, meta_title, meta_description, meta_keywords }: CategoryType = await req.json()

  const suggestions: SeoSuggestions = {
    categoryName: [],
    categoryDescription: [],
    metaTitle: [],
    metaDescription: [],
  }

  const scores: SeoScores = {
      metaTitleLengthStatus: 'ideal',
      metaTitleKeywordPresent: false,
      metaDescriptionLengthStatus: 'ideal',
      metaDescriptionKeywordPresent: false,
      descriptionWordCountStatus: 'ideal',
      descriptionKeywordDensity: 0,
      descriptionKeywordPresence: false,
  }

  const countWords = (text: string) => text.split(/\s+/).filter(word => word.length > 0).length
  const countChars = (text: string) => text.length

  const metaTitleChars = countChars(meta_title)
  if (metaTitleChars < 30) { scores.metaTitleLengthStatus = 'short' }
  else if (metaTitleChars > 60) { scores.metaTitleLengthStatus = 'long' }
  if (meta_keywords && meta_title.toLowerCase().includes(meta_keywords.toLowerCase())) { scores.metaTitleKeywordPresent = true }

  const metaDescriptionChars = countChars(meta_description)
  if (metaDescriptionChars < 80) { scores.metaDescriptionLengthStatus = 'short' }
  else if (metaDescriptionChars > 160) { scores.metaDescriptionLengthStatus = 'long' }
  if (meta_keywords && meta_description.toLowerCase().includes(meta_keywords.toLowerCase())) { scores.metaDescriptionKeywordPresent = true }

  const descriptionWordCount = countWords(description)
  if (descriptionWordCount < 100) { scores.descriptionWordCountStatus = 'short' }
  else if (descriptionWordCount > 500) { scores.descriptionWordCountStatus = 'long' }
  if (meta_keywords) {
    const keywordRegex = new RegExp(`\\b${meta_keywords}\\b`, 'gi')
    const keywordMatches = (description.match(keywordRegex) || []).length
    scores.descriptionKeywordPresence = keywordMatches > 0
    scores.descriptionKeywordDensity = descriptionWordCount > 0 ? (keywordMatches / descriptionWordCount * 100) : 0
    scores.descriptionKeywordDensity.toFixed(2)
  }
  
  try {
    const prompt = `Anda adalah ahli SEO yang ringkas dan langsung. Berikan satu saran SEO terbaik untuk setiap elemen berdasarkan input yang diberikan. Jangan berikan alternatif, penjelasan, atau detail lainnya. Fokus pada satu string jawaban paling optimal untuk setiap kategori.

    Input Data:
    Nama Kategori (H1): "${name}"
    Deskripsi Kategori (Konten Utama): "${description}"
    Meta Title Saat Ini: "${meta_title}"
    Meta Deskripsi Saat Ini: "${meta_description}"
    Kata Kunci Target Utama: "${meta_keywords}"

    Instruksi Output (JSON):
    {
      "categoryNameSuggestions": ["Saran 1", "Saran 2"],
      "descriptionSuggestions": ["Saran 1", "Saran 2"],
      "metaTitleSuggestions": ["Saran 1", "Saran 2"],
      "metaDescriptionSuggestions": ["Saran 1", "Saran 2"],
    }
    Pastikan output adalah JSON yang valid dan hanya berisi properti yang diminta
    `

    const result = await geminiContentGenerator(prompt)
    const text = result.text()

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    let geminiRawSuggestions: any = {}
    if (jsonMatch && jsonMatch[1]) {
        try {
            geminiRawSuggestions = JSON.parse(jsonMatch[1])
        } catch (parseError) {
            console.error("Error parsing Gemini JSON response:", parseError)
            suggestions.categoryDescription.push("Saran AI: " + text.replace(/`/g, ''))
        }
    } else {
        suggestions.categoryDescription.push("Saran AI: " + text.replace(/`/g, ''))
    }
    
    if (geminiRawSuggestions.categoryNameSuggestions) {
        suggestions.categoryName.push(...geminiRawSuggestions.categoryNameSuggestions)
    }
    if (geminiRawSuggestions.descriptionSuggestions) {
        suggestions.categoryDescription.push(...geminiRawSuggestions.descriptionSuggestions)
    }
    if (geminiRawSuggestions.metaTitleSuggestions) {
        suggestions.metaTitle.push(...geminiRawSuggestions.metaTitleSuggestions)
    }
    if (geminiRawSuggestions.metaDescriptionSuggestions) {
        suggestions.metaDescription.push(...geminiRawSuggestions.metaDescriptionSuggestions)
    }
    return NextResponse.json({ success: true, data: {suggestions, scores}, message: 'new suggestions' }, { status: 201 })

  } catch (error) {
    console.error("Error calling Gemini API:", error)
    suggestions.metaTitle.push("Gagal mendapatkan saran dari AI. Pastikan API Key valid dan model tersedia.")
    suggestions.metaDescription.push("Gagal mendapatkan saran dari AI. Pastikan API Key valid dan model tersedia.")
    suggestions.categoryDescription.push("Gagal mendapatkan saran dari AI. Pastikan API Key valid dan model tersedia.")
    return NextResponse.json({ success: false, message: 'Failed to get suggestions', error: error.message }, { status: 500 })
}
}