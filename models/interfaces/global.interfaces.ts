export type APIResponse = {
    success: boolean,
    results?: any, 
    data?: any,
    message: string
}

export type MapLocation = {
    lat: number,
    lon: number,
}

export interface SelectOption {
  value: string;
  label: string;
}

export enum PublishStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED'
}