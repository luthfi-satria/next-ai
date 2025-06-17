import MultipleUploadLibrary from "@/library/MultipleUploadLibrary";
import { NextRequest, NextResponse } from "next/server"

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME_TYPES = [
'application/pdf', // PDF
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/plain', 
  'text/csv'
];


export async function GET(){
  return NextResponse.json({ message: 'This is the plagiarism tools API endpoint. Please use POST.' });

}

export async function POST(req: Request){
    try {
        const formData = await req.formData()
        const files = formData.getAll('files')
        const actualFiles = files.filter(item => item instanceof File) as File[]

        const uploader = new MultipleUploadLibrary({})
        const uploadFile = await uploader.uploadFiles(actualFiles)

        const successfullUploads = uploadFile.filter(r => 'fileName' in r)
        const failedUploads = uploadFile.filter(r => 'error' in r)

        return NextResponse.json({
            success: successfullUploads.length > 0 ? true: false,
            message: 'Upload results',
            data: {
                uploadedFiles: successfullUploads,
                errors: failedUploads
            }
        })
    } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        return NextResponse.json({ success: false, error: 'Internal error occur'})
    }
}