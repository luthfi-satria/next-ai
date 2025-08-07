import { FilterValues } from "@/components/table/TableFilters"
import { APIResponse } from "@/models/interfaces/global.interfaces"
import { sanitizeParams } from "./objectHelpers"

export const GETAPICALL = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const ApiResponse: APIResponse = await response.json()
  return { response, ApiResponse }
}

export const PopulateTable = async (
  url: string,
  filter: FilterValues,
  currentPage: number,
  limit: number,
) => {
  const params = {
    ...sanitizeParams(filter),
    page: String(currentPage),
    limit: String(limit),
  }
  const queryString = new URLSearchParams(params).toString()
  return await GETAPICALL(`${url}?${queryString}`)
}

export const PUSHAPI = async (method: string, url: string, body: string) => {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  })
  const data: APIResponse = await response.json()
  return { response, data }
}
