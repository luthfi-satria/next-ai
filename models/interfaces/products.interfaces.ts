import { Document as MongoDocument, ObjectId } from "mongodb"

export interface Product extends MongoDocument {
  _id?: ObjectId
  name: string
  description: string
  category: string
  image?: string
  price: number
  createdAt?: Date
  updatedAt?: Date
}

export type NewProduct = {
  name: string,
  description: string,
  category: string,
  price: number
}