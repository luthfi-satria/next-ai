export type ElasticsearchQuery =
  | {
      bool: {
        must?: QueryPart[]
        filter?: QueryPart[]
        should?: QueryPart[]
        must_not?: QueryPart[]
      }
    }
  | {
      match_all: object
    }

type QueryPart =
  | MatchQuery
  | TermQuery
  | RangeQuery
  | ExistsQuery
  | WildcardQuery
  | NestedQuery
  | MultiMatchQuery

interface MatchQuery {
  match: {
    [key: string]: string | number
  }
}

interface TermQuery {
  term: {
    [key: string]: string | number
  }
}

interface RangeQuery {
  range: {
    [key: string]: {
      gte?: number | string
      lte?: number | string
      gt?: number | string
      lt?: number | string
    }
  }
}

interface ExistsQuery {
  exists: {
    field: string
  }
}

interface WildcardQuery {
  wildcard: {
    [key: string]: string
  }
}

interface NestedQuery {
  nested: {
    path: string
    query: ElasticsearchQuery
  }
}

interface MultiMatchQuery {
  multi_match: {
    query: string
    fields: string[]
    type:
      | "best_fields"
      | "most_fields"
      | "cross_fields"
      | "phrase"
      | "phrase_prefix"
  }
}

export interface ElasticsearchResponse<T> {
  took: number
  timed_out: boolean
  _shards: {
    total: number
    successful: number
    skipped: number
    failed: number
  }
  hits: {
    total: {
      value: number
      relation: string
    }
    max_score: number | null
    hits: Array<{
      _index: string
      _id: string
      _score: number | null
      _source: T
    }>
  }
}

export interface ErrorResponse {
  error: boolean
  message: string
}
