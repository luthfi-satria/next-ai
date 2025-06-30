import { Document as MongoDocument, ObjectId } from "mongodb";

export interface User extends MongoDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewUser = {
  name: string,
  email: string,
}