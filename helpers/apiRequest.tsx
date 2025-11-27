import { FilterValues } from "@/components/table/TableFilters"
import { APIResponse } from "@/models/interfaces/global.interfaces"
import { sanitizeParams } from "./objectHelpers"

type APICallResult<T> = {
  response: Response
  ApiResponse: APIResponse<T>
}

export const GETAPICALL = async <T,>(
  url: string,
): Promise<APICallResult<T>> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const ApiResponse: APIResponse<T> = await response.json()
  return { response, ApiResponse }
}

export const PopulateTable = async <T,>(
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

  return await GETAPICALL<T>(`${url}?${queryString}`)
}

type PUSHAPIResult<T> = {
  response: Response
  data: APIResponse<T>
}

export const PUSHAPI = async <T,>(
  method: string,
  url: string,
  body: string | FormData,
): Promise<PUSHAPIResult<T>> => {
  const headers: HeadersInit = {}

  if (typeof body === "string") {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    method: method,

    headers: headers,
    body: body,
  })

  const data: APIResponse<T> = await response.json()
  return { response, data }
}
