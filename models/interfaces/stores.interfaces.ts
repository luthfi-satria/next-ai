import { Document as MongoDocument, ObjectId } from "mongodb"
import { MapLocation } from "./global.interfaces"

export interface Stores extends MongoDocument{
    _id?: ObjectId
    name: string
    description: string
    address: string
    location: MapLocation
    logo?: string
    createdAt?: Date
    updatedAt?: Date
}