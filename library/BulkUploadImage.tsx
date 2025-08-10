import {
  ALLOWED_IMAGES_TYPE,
  DEFAULT_UPLOAD_DIR,
} from "@/constants/uploadConstant"
import { mkdir, stat, writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import mime from "mime"
import fs from "fs"

export interface bulkUploadImage {
  url: string
  filename: string
  name: string
  type: string
}

export async function bulkUploadImage(
  files: unknown,
  uploadDir: string,
): Promise<string | bulkUploadImage[]> {
  const targetDir = join(process.cwd(), DEFAULT_UPLOAD_DIR, uploadDir)
  const uploadedFiles: bulkUploadImage[] = []

  if (!Array.isArray(files)) {
    return "Invalid files provided, expected an array."
  }

  try {
    await stat(targetDir)
  } catch (error: unknown) {
    if ((error as { code: string }).code === "ENOENT") {
      await mkdir(targetDir, { recursive: true })
    } else {
      console.error("Error creating upload directory", error)
      return "Failed to create upload directory"
    }
  }

  for (const file of files) {
    if (!(file instanceof File)) {
      continue
    }

    if (!ALLOWED_IMAGES_TYPE.includes(file.type)) {
      return `File type ${file.type} is not allowed. Only ${ALLOWED_IMAGES_TYPE.join("| ")} are supported.`
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uniqueSuffix = `${uuidv4()}-${file.name.replace(/\.[^/.]+$/, "")}`
    const fileExtension = mime.getExtension(file.type)
    const filename = `${uniqueSuffix}.${fileExtension}`

    const filePath = join(targetDir, filename)

    await writeFile(filePath, buffer)

    uploadedFiles.push({
      url: `/uploads/${uploadDir}/${filename}`,
      filename: filename,
      name: file.name,
      type: file.type,
    })
  }

  return uploadedFiles
}

export async function bulkUploadUnlinkImage(
  images: string[],
): Promise<boolean> {
  try {
    for (const image of images) {
      const imgPath = join(
        process.cwd(),
        DEFAULT_UPLOAD_DIR,
        "products-uploads",
        image,
      )
      await fs.promises.access(imgPath, fs.constants.F_OK)
      fs.promises.unlink(imgPath)
    }
    return true
  } catch (error: unknown) {
    console.log(`error deleting file(s)`, error)
    return false
  }
}
