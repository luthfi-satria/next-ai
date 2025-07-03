// library/MultipleUploadLibrary.tsx
import { DEFAULT_UPLOAD_DIR, MAX_FILE_SIZE } from "@/constants/uploadConstant"
import formidable, { File as FormidableFile, Fields, IncomingForm } from "formidable"
import fs from 'fs'
import { IncomingMessage } from "http"
import path from "path"

interface UploadedFileInfo {
    fileName: string,
    originalFilename: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
    message: string,
}

interface UploadError {
    error: string
}

type uploadConfig = {
    uploadPath?: string,
    maxFileSize?: number,
    mimeTypes?: string[],
    keepExtension?: boolean,
    maxNumberOfFiles?: number
}

export type UploadResult = UploadedFileInfo | UploadError

export default class MultipleUploadLibrary {
    private config: uploadConfig
    public resolvedUploadDir: string

    constructor(config: uploadConfig) {
        this.config = config
        this.config.maxFileSize = (this.config?.maxFileSize ?? MAX_FILE_SIZE) * 1024 * 1024
        this.config.keepExtension = this.config?.keepExtension ?? true
        this.config.mimeTypes = this.config.mimeTypes ?? []
        this.config.maxNumberOfFiles = this.config.maxNumberOfFiles ?? 10
        this.resolvedUploadDir = path.join(process.cwd(), DEFAULT_UPLOAD_DIR, this.config?.uploadPath || '')

        if (!fs.existsSync(this.resolvedUploadDir)) {
            fs.mkdirSync(this.resolvedUploadDir, { recursive: true })
        }
    }

    // Tipe `req` tetap `IncomingMessage`
    async parse(req: IncomingMessage): Promise<{ fields: Fields, files: { [key: string]: FormidableFile[] } }> {
        const currentConfig = this.config

        const form = new IncomingForm({
            uploadDir: this.resolvedUploadDir,
            keepExtensions: currentConfig.keepExtension,
            maxFileSize: currentConfig.maxFileSize,
            maxFiles: currentConfig.maxNumberOfFiles,
            filter: ({ name, originalFilename, mimetype }) => {
                const allowed = mimetype && currentConfig.mimeTypes!.includes(mimetype)
                if (!allowed) {
                    console.log(`File ${originalFilename} with type ${mimetype} is not allowed.`)
                }
                return allowed
            }
        })

        return new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    if (err.code === formidable?.errors?.biggerThanMaxFileSize) {
                        return reject(new Error(`File size limit exceeded: ${this.config.maxFileSize / (1024 * 1024)}MB per file`))
                    }

                    if (err.message && err.message.includes('Maximum number of files exceeded')) {
                        return reject(new Error(`Too many files uploaded. Max: ${this.config.maxNumberOfFiles}`))
                    }

                    return reject(err)
                }

                const normalizedFiles: { [key: string]: FormidableFile[] } = {}
                for (const key in files) {
                    if (Object.prototype.hasOwnProperty.call(files, key)) {
                        const fileValue = files[key]
                        if (fileValue) {
                            normalizedFiles[key] = Array.isArray(fileValue) ? fileValue as FormidableFile[] : [fileValue] as FormidableFile[]
                        }
                    }
                }
                resolve({ fields, files: normalizedFiles })
            })
        })
    }

    public async processUploadedFiles(files: FormidableFile[], unlinking: boolean): Promise<UploadedFileInfo[]> {
        const results: UploadedFileInfo[] = []

        for (const file of files) {
            results.push({
                fileName: file.newFilename,
                originalFilename: file.originalFilename || 'unknown',
                filePath: path.join(DEFAULT_UPLOAD_DIR, path.basename(file.filepath)),
                fileSize: file.size,
                mimeType: file.mimetype || 'application/octet-stream',
                message: `File '${file.originalFilename}' proceed and available at ${file.filepath}`
            })

            if(unlinking === true){
                try {
                    await this.unlinkFile(file.filepath)
                } catch (unlinkErr) {
                    console.error(`file temp failed to removed ${file.filepath}:`, unlinkErr)
                }
            }
        }
        return results
    }

    public async unlinkFile(filepath:string){
        try{
            await fs.promises.access(filepath, fs.constants.F_OK)
            return await fs.promises.unlink(filepath)
        }catch(error: any){
            return false
        }
    }
}

export { FormidableFile }