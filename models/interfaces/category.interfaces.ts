import { Document as MongoDocument, ObjectId } from "mongodb"
import { PublishStatus } from "./global.interfaces"

export interface Category extends MongoDocument {
  _id?: ObjectId
  name: string
  description: string
  publish: string
  createdAt?: Date
  updatedAt?: Date
}

export type CategoryType = {
  name: string,
  description: string,
  publish: string,
}

export const initCategory: CategoryType = {
    name: '',
    description: '',
    publish: PublishStatus.PUBLISHED
}