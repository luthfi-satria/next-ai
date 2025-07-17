export type APIResponse = {
    success: boolean,
    results?: any, 
    data?: any,
    message: string
}

export type MapLocation = {
    type: string,
    coordinates: number[]
}

export interface SelectOption {
  value: string;
  label: string;
}

export enum PublishStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED'
}

export enum Currency {
  DOLLAR = "$",
  RUPIAH = "IDR"
}