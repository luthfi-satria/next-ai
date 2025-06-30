import { Document as MongoDocument, ObjectId } from "mongodb";

export interface Product extends MongoDocument {
  _id?: ObjectId;
  name: string;
  description: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewProduct = {
  name: string,
  description: string
}