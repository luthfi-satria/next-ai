export type APIResponse = {
    success: boolean,
    results?: any, 
    data?: any,
    message: string
}

export type MapLocation = {
    latitude: number,
    longitude: number,
}

export interface SelectOption {
  value: string;
  label: string;
}

export enum PublishStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED'
}