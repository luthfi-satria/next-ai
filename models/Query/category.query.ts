import { getMongoCollection } from "@/library/mongodb"
import { ObjectId, WithId } from "mongodb"
import { Category } from "../interfaces/category.interfaces"
const COLLECTION_NAME = "categories"
const collection = await getMongoCollection<Category>(COLLECTION_NAME)

export async function getCategoryById(id: string): Promise<WithId<Category>> {
  const getCategory = await collection.findOne({ _id: new ObjectId(id) })
  return getCategory
}
