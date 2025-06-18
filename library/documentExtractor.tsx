// library/documentExtractor.tsx
import fs from 'fs/promises'
import path from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    const fileExtension = path.extname(filePath).toLowerCase()

    switch (mimeType) {
        case 'text/plain':
            return fs.readFile(filePath, 'utf-8')
        case 'application/pdf':
            const dataBuffer = await fs.readFile(filePath)
            const data = await pdf(dataBuffer)
            return data.text
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            const docxBuffer = await fs.readFile(filePath)
            
            const arrayBufferForMammoth: ArrayBuffer = new Uint8Array(docxBuffer).buffer

            const result = await mammoth.extractRawText({ arrayBuffer: arrayBufferForMammoth })
            return result.value 
        case 'application/msword':
            return `Cannot extract text from .doc file: ${filePath}. Please upload .docx or .pdf.`
        default:
            throw new Error(`Unsupported file type: ${mimeType}`)
    }
}