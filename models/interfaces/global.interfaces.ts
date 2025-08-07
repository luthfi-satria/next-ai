export type APIResponse<T> = {
  success: boolean
  results?: {
    data: T
  }
  data?: T
  message: string
}

export type MapLocation = {
  type: string
  coordinates: number[]
}

export interface SelectOption {
  value: string
  label: string
}

export enum PublishStatus {
  PUBLISHED = "PUBLISHED",
  UNPUBLISHED = "UNPUBLISHED",
}

export enum Currency {
  DOLLAR = "$",
  RUPIAH = "IDR",
}
