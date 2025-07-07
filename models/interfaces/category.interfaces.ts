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

export type NewCategory = {
  name: string,
  description: string,
  publish: string,
}

export const initCategory: NewCategory = {
    name: '',
    description: '',
    publish: PublishStatus.PUBLISH
}