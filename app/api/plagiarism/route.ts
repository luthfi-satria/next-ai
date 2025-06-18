import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/constants/uploadConstant";
import { streamToBuffer } from "@/helpers/fileHelpers";
import MultipleUploadLibrary from "@/library/MultipleUploadLibrary";
import { IncomingMessage } from "http";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
}
interface FormidableRequest extends Readable {
    headers?: IncomingMessage['headers'];
}

export async function GET(req: NextRequest){
  return NextResponse.json({ message: 'This is the plagiarism tools API endpoint. Please use GET.' }, {status: 200});

}

export async function POST(req: NextRequest, res: NextResponse){
    try {        
        const bodyBuffer = await streamToBuffer(req.body as ReadableStream<Uint8Array>);
        const mockReq: FormidableRequest = new Readable({
            read() {
                this.push(bodyBuffer);
                this.push(null); // Menandakan akhir stream
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

        const uploadedFilesArray = files.files || []

        if(!uploadedFilesArray || uploadedFilesArray.length === 0) 
            return NextResponse.json({ error: 'no valid files uploaded'}, {status: 400})

        const runUploader = await uploader.processUploadedFiles(uploadedFilesArray)

        const response = {
            success: true,
            message: 'Files uploaded successfully',
            data: uploadedFilesArray
        }

        return NextResponse.json(response, {status: 200})
    } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        return NextResponse.json({ success: false, error: 'Internal error occur'}, { status: 500 })
    }
}