import { Document as MongoDocument, ObjectId } from "mongodb"
import { PublishStatus } from "./global.interfaces"

export interface Category extends MongoDocument {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  level: number
  parentId: ObjectId
  ancestors: ObjectId[]
  path: string
  imageUrl: string
  publish: string
  createdAt?: string
  updatedAt?: string
}

export type CategoryType = {
  name: string,
  parentId: string,
  description: string,
  publish: string,
}

export const initCategory: CategoryType = {
    name: '',
    parentId: '',
    description: '',
    publish: PublishStatus.PUBLISHED
}