import IncomingForm from "formidable/Formidable"
import { promises as fs } from 'fs'
import path from "path"

interface UploadedFileInfo{
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
    message: string,
}

interface UploadError{
    error: string
}

type uploadConfig = {
    uploadPath?: string,
    maxFileSize?: number,
    mimeType?: string[],
    keepExtension?: boolean,
}

type UploadResult = UploadedFileInfo | UploadError

// Define max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 // Bytes
const DEFAULT_UPLOAD_DIR = process.env.UPLOAD_DIR

export default class MultipleUploadLibrary{
    private config: uploadConfig
    private uploadDir: string

    constructor(config: uploadConfig){
        this.config = config
        this.config.maxFileSize = (this.config?.maxFileSize ?? MAX_FILE_SIZE) * 1024 * 1024
        this.config.keepExtension = this.config?.keepExtension ?? true
    }

    async makeDir(){
        try{
            this.uploadDir = path.join(process.cwd(), DEFAULT_UPLOAD_DIR, this.config?.uploadPath)
            await fs.mkdir(this.uploadDir, { recursive: true })
    
            const form = new IncomingForm({
                uploadDir: this.uploadDir,
                keepExtensions: this.config.keepExtension,
                maxFileSize: this.config.maxFileSize,
            })

            return true
        }catch(error: any){
            return false
        }
    }

    public async validateFileSize(file: File){
        if(file.size === 0 ){
            return `file ${file.name} is empty`
        }

        if(file.size > this.config.maxFileSize){
            return `file size limit exceeded ${this.config.maxFileSize / (1024 * 1024)}MB`
        }
        return null
    }

    public async uploadFiles(files: File[]): Promise<UploadResult[]>{
        const results: UploadResult[] = []

        if(files.length === 0){
            results.push({ error: 'No files were uploaded' })
            return results
        }

        this.makeDir()

        for (const file of files){
            const validationError = this.validateFileSize(file)
            if(validationError){
                results.push( { error: `File '${file.name}': ${validationError}`})
                continue
            }

            try{
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const uniqueFileName = `${Date.now()}-${file.name}`

                const filePath = path.join(this.uploadDir, uniqueFileName)

                await fs.writeFile(filePath, buffer)
                
                results.push({
                    fileName: file.name,
                    filePath: filePath,
                    fileSize: file.size,
                    mimeType: file.type,
                    message: `File '${file.name}' is uploaded!`
                })
            }catch(err: any){
                console.error(`Error processing file ${file.name}: `,err)
                results.push({ error: `File ${file.name}: ${err.message}`})
            }
        }
        return results
    }
}