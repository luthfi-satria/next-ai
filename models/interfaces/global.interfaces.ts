export type APIResponse = {
    success: boolean,
    data: any,
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