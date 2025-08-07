import { SelectOption } from "@/models/interfaces/global.interfaces"

interface SelectOptionProps {
  value: string
  label: string
  disabled?: boolean
}

type PartialObject<T> = {
  [P in keyof T]?: T[P]
}
interface ConverterOptions<T> {
  valueKey?: keyof T
  labelKey?: keyof T
  disabledKey?: keyof T
  defaultValue?: string | number | boolean
}

export function convertObjectToSelectOptions<T extends object>(
  dataArray: T[],
  options?: ConverterOptions<T>,
): SelectOptionProps[] {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return []
  }

  const defaultOptions: PartialObject<ConverterOptions<T>> = {
    valueKey: "id" as keyof T,
    labelKey: "name" as keyof T,
    disabledKey: "disabled" as keyof T,
  }

  const finalOptions = { ...defaultOptions, ...options }

  return dataArray.map((item) => {
    const value =
      finalOptions.valueKey && item[finalOptions.valueKey!] !== undefined
        ? String(item[finalOptions.valueKey!])
        : String(finalOptions.defaultValue || "")

    const label =
      finalOptions.labelKey && item[finalOptions.labelKey!] !== undefined
        ? String(item[finalOptions.labelKey!])
        : String(finalOptions.defaultValue || value)

    const disabled =
      finalOptions.disabledKey && item[finalOptions.disabledKey!] !== undefined
        ? Boolean(item[finalOptions.disabledKey!])
        : undefined

    return {
      value,
      label,
      ...(disabled !== undefined && { disabled }), // Tambahkan properti 'disabled' hanya jika ada nilai
    }
  })
}

export function enumToSelectOptions<T extends string>(
  enumObject: { [key: string]: T },
  labelMap?: { [key in T]?: string },
): SelectOption[] {
  return Object.values(enumObject).map((value) => ({
    value: value,
    label:
      labelMap?.[value] ||
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  }))
}

export function sanitizeParams(params: unknown) {
  const cleanedFilters = {}
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== "" && value !== null && value !== undefined) {
      cleanedFilters[key] = value
    }
  })
  return cleanedFilters
}
