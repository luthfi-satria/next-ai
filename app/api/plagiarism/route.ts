import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_TEXT_LENGTH, PLAGIARISM_PROMPT } from "@/constants/uploadConstant"
import { streamToBuffer } from "@/helpers/fileHelpers"
import { extractTextFromFile } from "@/library/documentExtractor"
import { geminiContentGenerator } from "@/library/gemini"
import MultipleUploadLibrary, { FormidableFile } from "@/library/MultipleUploadLibrary"
import { IncomingMessage } from "http"
import { NextRequest, NextResponse } from "next/server"
import { Readable } from "stream"

export const config = {
  api: {
    bodyParser: false,
  },
}
interface FormidableRequest extends Readable {
    headers?: IncomingMessage['headers']
}

export async function GET(req: NextRequest){
  return NextResponse.json({ message: 'This is the plagiarism tools API endpoint. Please use GET.' }, {status: 200})

}

export async function POST(req: NextRequest, res: NextResponse){
    try {
        const bodyBuffer = await streamToBuffer(req.body as ReadableStream<Uint8Array>)
        const mockReq: FormidableRequest = new Readable({
            read() {
                this.push(bodyBuffer)
                this.push(null)
            }
        })
        mockReq.headers = {
            'content-type': req.headers.get('content-type') || 'application/octet-stream',
            'content-length': bodyBuffer.length.toString(),
        }

        const uploader = new MultipleUploadLibrary({
            uploadPath: 'plagiarism-uploads',
            maxFileSize: MAX_FILE_SIZE,
            mimeTypes: ALLOWED_MIME_TYPES,
            maxNumberOfFiles: 10,
        })

        const {fields, files} = await uploader.parse(mockReq as any)

        let uploadedFormidableFiles: FormidableFile[] = files.files || []

        if(!uploadedFormidableFiles || uploadedFormidableFiles.length === 0) 
            return NextResponse.json({ error: 'no valid files uploaded'}, {status: 400})

        await uploader.processUploadedFiles(uploadedFormidableFiles, false)
        
        const plagiarismResults: any[] = []

        for (const file of uploadedFormidableFiles) {
            const filePath = file.filepath
            const mimeType = file.mimetype || 'application/octet-stream'
            let fileResult: any = { fileName: file.originalFilename }

            try {
                const extractedText = await extractTextFromFile(filePath, mimeType)
                const textToSend = extractedText.length > MAX_TEXT_LENGTH ? `${extractedText.substring(0, MAX_TEXT_LENGTH)}\n...(text truncated due to length limit)` : extractedText

                const prompt = `${PLAGIARISM_PROMPT}${textToSend}`
                const result = await geminiContentGenerator(prompt)
                const responseText = result.text()

                fileResult = {...fileResult, 
                    status: 'Success',
                    analysis: responseText,
                    filePath: filePath,
                }

            }catch(error: any){
                fileResult = {...fileResult,
                    status: 'Error',
                    message: `Failed to processing text ${error.message}}`,
                    fileName: file.originalFilename,
                }                
            }finally{
                await uploader.unlinkFile(file.filepath)
            }
            plagiarismResults.push(fileResult)
        }

        const response = {
            success: true,
            message: 'Files processed for plagiarism check!',
            data: plagiarismResults
        }

        return NextResponse.json(response, {status: 200})
    } catch (error: any) {
        console.error('Error calling Gemini API:', error)
        return NextResponse.json({ success: false, error: 'Internal error occur'}, { status: 500 })
    }
}