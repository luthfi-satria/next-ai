// lib/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';

interface SearchOptions {
  index: string;
  query?: object;
  size?: number;
  from?: number;
  body?: object; // Untuk kueri yang lebih kompleks
}

interface IndexOptions {
  index: string;
  id?: string;
  document: object;
}

interface UpdateOptions {
  index: string;
  id: string;
  document: object;
}

interface UpsertOptions {
  index: string;
  id: string;
  document: object;
}

interface DeleteOptions {
  index: string;
  id: string;
}

class ElasticsearchService {
  private client: Client;
  private static instance: ElasticsearchService;

  private constructor() {
    if (!process.env.ELASTICSEARCH_NODE) {
      throw new Error('ELASTICSEARCH_NODE is not defined in environment variables.');
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
    });
  }

  public static getInstance(): ElasticsearchService {
    if (!ElasticsearchService.instance) {
      ElasticsearchService.instance = new ElasticsearchService();
    }
    return ElasticsearchService.instance;
  }

  public async ping(): Promise<boolean> {
    try {
      await this.client.ping({});
      console.log('Connected to Elasticsearch');
      return true;
    } catch (error) {
      console.error('Elasticsearch cluster is down!', error);
      return false;
    }
  }

  public async search(options: SearchOptions): Promise<any> {
    const { index, query, size = 10, from = 0, body } = options;
    try {
      const result = await this.client.search({
        index,
        body: body || { query },
        size,
        from,
      });
      return result.body;
    } catch (error) {
      console.error('Error searching Elasticsearch:', error);
      throw error;
    }
  }

  public async indexDocument(options: IndexOptions): Promise<any> {
    const { index, id, document } = options;
    try {
      const result = await this.client.index({
        index,
        id,
        body: document,
      });
      return result.body;
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  public async updateDocument(options: UpdateOptions): Promise<any> {
    const { index, id, document } = options;
    try {
      const result = await this.client.update({
        index,
        id,
        body: {
          doc: document,
        },
      });
      return result.body;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
  public async upsertDocument(options: UpsertOptions): Promise<any> {
    const { index, id, document } = options;
    try {
      const result = await this.client.update({
        index,
        id,
        body: {
          doc: document,       // Ini adalah dokumen yang akan diupdate jika ada
          doc_as_upsert: true // Ini instruksi upsert: jika tidak ada, gunakan 'doc' sebagai dokumen baru
        },
      });
      return result.body;
    } catch (error) {
      console.error('Error upserting document:', error);
      throw error;
    }
  }

  public async deleteDocument(options: DeleteOptions): Promise<any> {
    const { index, id } = options;
    try {
      const result = await this.client.delete({
        index,
        id,
      });
      return result.body;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

export default ElasticsearchService.getInstance();