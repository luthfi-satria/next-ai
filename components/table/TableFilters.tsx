import { SelectOption } from "@/models/interfaces/global.interfaces"
import React, { useCallback, useEffect, useState } from "react"
import InputGenerator from "../form/inputGenerator"

export type FilterType =
  | "text"
  | "select"
  | "date"
  | "radio"
  | "checkbox"
  | "textarea"
  | "daterange"
  | "autocomplete"

export interface FilterConfig {
  id: string // unique ID for filter (e.g., 'search', 'status', 'role')
  label: string // Showing label (e.g., 'Find', 'Status', 'Role', 'etc')
  type: FilterType // Filter type (text or select)
  placeholder?: string // Placeholder for input text
  options?: SelectOption[] // filter select options
}

export interface FilterValues {
  [key: string]: string | number | boolean
}

type ChangeEventOrValues =
  | React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  | { name: string; value: string | number | boolean }

// --- Komponen TableFilters ---

interface TableFiltersProps {
  filtersConfig: FilterConfig[]
  onFilterChange: (filters: FilterValues) => void
  debounceTime?: number
  initialFilterValues: FilterValues
}

const TableFilters: React.FC<TableFiltersProps> = ({
  filtersConfig,
  onFilterChange,
  debounceTime = 300,
  initialFilterValues,
}) => {
  const [filterValues, setFilterValues] =
    useState<FilterValues>(initialFilterValues)

  useEffect(() => {
    setFilterValues(initialFilterValues)
  }, [initialFilterValues])

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filterValues)
    }, debounceTime)

    return () => {
      clearTimeout(handler)
    }
  }, [filterValues, onFilterChange, debounceTime])

  const handleInputChange = useCallback((e: ChangeEventOrValues) => {
    let name: string
    let inputValue: string | number | boolean

    if ("target" in e) {
      const { target } = e
      name = target.name

      if (target.type === "checkbox") {
        inputValue = (target as HTMLInputElement).checked
      } else {
        inputValue = target.value
      }
    } else {
      name = e.name
      inputValue = e.value
    }
    setFilterValues((prevValues) => ({
      ...prevValues,
      [name]: inputValue,
    }))
  }, [])
  const InputGeneratorProp = filtersConfig.map((items) => {
    return {
      ...items,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => handleInputChange(e),
      value: filterValues[items.id],
    }
  })

  return (
    <div className="flex flex-row flex-wrap gap-4 p-4 bg-white border border-slate-300 rounded-lg shadow-xs mb-6">
      <InputGenerator outterClass="flex-dynamic" props={InputGeneratorProp} />
    </div>
  )
}

export default TableFilters
