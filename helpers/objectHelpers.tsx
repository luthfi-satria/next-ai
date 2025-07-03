import { SelectOption } from "@/models/interfaces/global.interfaces"

export function enumToSelectOptions<T extends string>(
  enumObject: { [key: string]: T },
  labelMap?: { [key in T]?: string }
): SelectOption[] {
  return Object.values(enumObject).map(value => ({
    value: value,
    label: labelMap?.[value] || value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  }))
}

export function sanitizeParams(params: any){
  const cleanedFilters = {}
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== '' && value !== null && value !== undefined) {
      cleanedFilters[key] = value
    }
  })
  return cleanedFilters
}