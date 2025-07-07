// lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch'

interface SearchOptions {
  index: string
  query?: object
  size?: number
  from?: number
  body?: object // Untuk kueri yang lebih kompleks
}

interface IndexOptions {
  index: string
  id?: string
  document: object
}

interface UpdateOptions {
  index: string
  id: string
  document: object
}

interface UpsertOptions {
  index: string
  id: string
  document: object
}

interface DeleteOptions {
  index: string
  id: string
}

interface FindOneAndDeleteOptions {
  index: string
  query: object
}

class ElasticsearchService {
  private client: Client
  private static instance: ElasticsearchService

  private constructor() {
    if (!process.env.ELASTICSEARCH_NODE) {
      throw new Error('ELASTICSEARCH_NODE is not defined in environment variables.')
    }

    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || '',
        password: process.env.ELASTICSEARCH_PASSWORD || '',
      },
      // Hapus atau sesuaikan jika Anda menggunakan sertifikat SSL kustom
      // tls: {
      //   rejectUnauthorized: false
      // }
    })
  }

  public static getInstance(): ElasticsearchService {
    if (!ElasticsearchService.instance) {
      ElasticsearchService.instance = new ElasticsearchService()
    }
    return ElasticsearchService.instance
  }

  public async ping(): Promise<boolean> {
    try {
      await this.client.ping({})
      console.log('Connected to Elasticsearch')
      return true
    } catch (error) {
      console.error('Elasticsearch cluster is down!', error)
      return false
    }
  }

  public async search(options: SearchOptions): Promise<any> {
    const { index, query, size, from, body } = options

    const sizeParam = size ?? 20
    const startFrom = from ?? 0
    try {
      const result = await this.client.search({
        index,
        body: body || { query },
        size: sizeParam,
        from: startFrom,
      })
      return result.body
    } catch (error) {
      console.error('Error searching Elasticsearch:', error)
      // throw error
      return error
    }
  }

  public async indexDocument(options: IndexOptions): Promise<any> {
    const { index, id, document } = options
    try {
      const result = await this.client.index({
        index,
        id,
        body: document,
      })
      return result.body
    } catch (error) {
      console.error('Error indexing document:', error)
      // throw error
      return error
    }
  }

  public async updateDocument(options: UpdateOptions): Promise<any> {
    const { index, id, document } = options
    try {
      const result = await this.client.update({
        index,
        id,
        body: {
          doc: document,
        },
      })
      return result.body
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }
  public async upsertDocument(options: UpsertOptions): Promise<any> {
    const { index, id, document } = options
    try {
      const result = await this.client.update({
        index,
        id,
        body: {
          doc: document,
          doc_as_upsert: true 
        },
      })
      return result.body
    } catch (error) {
      console.error('Error upserting document:', error)
      throw error
    }
  }

  public async deleteDocument(options: DeleteOptions): Promise<any> {
    const { index, id } = options
    try {
      const result = await this.client.delete({
        index,
        id,
      })

      if (result.body.result === 'not_found') {
        return { success: true, message: 'Document not found, but delete operation processed.' }
      }
      return result.body
    } catch (error) {
      console.error('Error deleting document:', error)
      return error
    }
  }

  public async findOneAndDelete(options: FindOneAndDeleteOptions): Promise<any | null> {
    const { index, query } = options
    try {
      const searchResult = await this.client.search({
        index,
        body: { query },
        size: 1,
      })

      const hits = searchResult.body.hits.hits

      if (hits.length === 0) {
        return null
      }

      const docToDelete = hits[0]
      const docId = docToDelete._id

      const deleteResult = await this.client.delete({
        index,
        id: docId,
      })

      return docToDelete._source
    } catch (error) {
      console.error('Error in findOneAndDelete:', error)
      throw error
    }
  }
}

export default ElasticsearchService.getInstance()