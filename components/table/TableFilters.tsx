import { SelectOption } from "@/models/interfaces/global.interfaces"
import React, { useCallback, useEffect, useState } from "react"
import InputGenerator, { ChangeEventOrValues } from "../form/inputGenerator"
import {
  BUTTON_GRADIENT_GRAY,
  BUTTON_GRADIENT_GREEN,
} from "@/constants/formStyleConstant"

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

interface TableFiltersProps {
  filtersConfig: FilterConfig[]
  onFilterChange: (filters: FilterValues) => void
  debounceTime?: number
  initialFilterValues: FilterValues
  onSearch: () => void
  onReset: () => void
}

const TableFilters: React.FC<TableFiltersProps> = ({
  filtersConfig,
  onFilterChange,
  debounceTime = 300,
  initialFilterValues,
  onSearch,
  onReset,
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

  const handleInputChange = useCallback(
    (e: ChangeEventOrValues) => {
      let name: string
      let inputValue: string | number | boolean

      if ("target" in e) {
        const { target } = e as {
          target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        }
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
    },
    [setFilterValues],
  )

  const InputGeneratorProp = filtersConfig.map((item) => {
    return {
      ...item,
      name: item.id,
      onChange: handleInputChange,
      value: filterValues[item.id] || "",
    }
  })

  return (
    <div className="flex flex-row flex-wrap gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-xs mb-6">
      <h2 className="font-bold text-2xl border-b border-b-gray-200 w-full py-2">
        TABLE FILTERS
      </h2>
      <InputGenerator outterClass="flex-dynamic" props={InputGeneratorProp} />
      <div className="flex w-full gap-4 justify-end">
        <button onClick={onSearch} className={BUTTON_GRADIENT_GREEN}>
          Find
        </button>
        <button onClick={onReset} className={BUTTON_GRADIENT_GRAY}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default TableFilters
