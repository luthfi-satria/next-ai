import { Document as MongoDocument, ObjectId } from "mongodb"
import { MapLocation, PublishStatus } from "./global.interfaces"

export interface Stores extends MongoDocument{
    _id?: ObjectId
    uuid_id: string
    name: string
    address: string
    city: string
    province: string
    postalCode: string
    location: MapLocation
    publish: string,
    logo?: string
    createdAt?: Date
    updatedAt?: Date
}

export type StoreType = {
    name: string,
    address: string,
    city: string
    province: string
    postalCode: string
    location: MapLocation,
    publish: string,
}

export const initStore: StoreType = {
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    location: {
        type: "point",
        coordinates: [-6.5500, 106.8047]
    },
    publish: PublishStatus.PUBLISHED
}