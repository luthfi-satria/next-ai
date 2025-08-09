import { getMongoCollection } from "@/library/mongodb"
import { ObjectId, WithId } from "mongodb"
import { Stores } from "../interfaces/stores.interfaces"

const COLLECTION_NAME = "stores"
const collection = await getMongoCollection<Stores>(COLLECTION_NAME)

export async function getStoreById(id: string): Promise<WithId<Stores>> {
  const store = await collection.findOne(new ObjectId(id))
  return store
}
