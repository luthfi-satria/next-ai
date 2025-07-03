// lib/mongodb.ts
import { MONGODB_QUERY } from '@/constants/databaseConstant'
import { MongoClient, Db, Collection, Document as MongoDocument } from 'mongodb'

declare global {
  var _mongoClientInstance: MongoClient | null
  var _mongoClientPromise: Promise<MongoClient> | null
}

class MongoDBClient {
  private static instance: MongoDBClient
  private client: MongoClient | null = null
  private clientPromise: Promise<MongoClient> | null = null
  private uri: string
  private options: object
  private dbName: string

  private constructor() {
    this.uri = MONGODB_QUERY as string
    if (!this.uri) {
      throw new Error('Please add your Mongo URI to .env.local or define MONGODB_QUERY')
    }
    console.log("MongoDB URI being used by Next.js:", this.uri)
    this.options = {} 

    const url = new URL(this.uri)
    this.dbName = url.pathname.substring(1)
    if (!this.dbName) {
        throw new Error('MongoDB URI must include a database name.')
    }

    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        this.client = new MongoClient(this.uri, this.options)
        global._mongoClientPromise = this.client.connect()
      }
      this.clientPromise = global._mongoClientPromise
    } else {
      this.client = new MongoClient(this.uri, this.options)
      this.clientPromise = this.client.connect()
    }
  }

  public static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient()
    }
    return MongoDBClient.instance
  }

  public async getClient(): Promise<MongoClient> {
    if (!this.clientPromise) {
      throw new Error("MongoDB client promise not initialized. Call getInstance() first.")
    }
    return this.clientPromise
  }

  public async getDb(): Promise<Db> {
    const client = await this.getClient()
    return client.db(this.dbName)
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.clientPromise = null
      if (process.env.NODE_ENV === 'development') {
        global._mongoClientInstance = null 
        global._mongoClientPromise = null
      }
      console.log('MongoDB client disconnected.')
    }
  }

  public async getCollection<T extends MongoDocument = MongoDocument>(collectionName: string): Promise<Collection<T>> { // <-- Gunakan MongoDocument
    if (!collectionName) {
      throw new Error('Collection name is required.')
    }
    const db = await this.getDb()
    return db.collection<T>(collectionName)
  }
}

const mongoClientInstance = MongoDBClient.getInstance()

export const getMongoClient = () => mongoClientInstance.getClient()
export const disconnectMongoClient = () => mongoClientInstance.disconnect()

export const getMongoCollection = async <T extends MongoDocument = MongoDocument>(collectionName: string): Promise<Collection<T>> => { // <-- Gunakan MongoDocument
    return mongoClientInstance.getCollection<T>(collectionName)
}