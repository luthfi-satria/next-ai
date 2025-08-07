import { SelectOption } from "@/models/interfaces/global.interfaces"
import React, { useCallback, useEffect, useState } from "react"
import CheckboxInput from "../form/inputCheckbox"
import DateInput from "../form/inputDate"
import SelectInput from "../form/inputSelect"
import TextInput from "../form/inputText"
import TextAreaInput from "../form/inputTextarea"
import { InputGeneratorType } from "../form/inputGenerator"

export type FilterType =
  | "text"
  | "select"
  | "date"
  | "radio"
  | "checkbox"
  | "textarea"
  | "daterange"

export interface FilterConfig {
  id: string // unique ID for filter (e.g., 'search', 'status', 'role')
  label: string // Showing label (e.g., 'Find', 'Status', 'Role', 'etc')
  type: FilterType // Filter type (text or select)
  placeholder?: string // Placeholder for input text
  options?: SelectOption[] // filter select options
}

export interface FilterValues {
  [key: string]: string | boolean
}

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

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type, checked } = e.target as HTMLInputElement
      const inputValue = type === "checkbox" ? checked : value
      setFilterValues((prevValues) => ({
        ...prevValues,
        [name]: inputValue,
      }))
    },
    [],
  )

  const generateField = (obj: InputGeneratorType, key: string) => {
    if (obj.type == "text") {
      return (
        <TextInput
          key={key}
          label={obj.label || obj.id}
          name={obj.id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange(e)
          }
          value={(filterValues[obj.id] as string) || ""}
          placeholder={obj.placeholder}
        />
      )
    }

    if (obj.type == "select") {
      return (
        <SelectInput
          key={key}
          label={obj.label || obj.id}
          name={obj.id}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleInputChange(e)
          }
          options={obj.options}
          selectedValue={(filterValues[obj.id] as string) || ""}
        />
      )
    }

    if (obj.type == "textarea") {
      return (
        <TextAreaInput
          key={key}
          label={obj.label || obj.id}
          name={obj.id}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleInputChange(e)
          }
          value={(filterValues[obj.id] as string) || ""}
        />
      )
    }

    if (obj.type == "date") {
      return (
        <DateInput
          key={key}
          label={obj.label || obj.id}
          name={obj.id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange(e)
          }
          value={(filterValues[obj.id] as string) || ""}
        />
      )
    }

    if (obj.type == "checkbox") {
      return (
        <CheckboxInput
          key={key}
          label={obj.label || obj.id}
          name={obj.id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange(e)
          }
          value={obj.id}
          checked={(filterValues[obj.id] as boolean) || false}
        />
      )
    }
    return null
  }

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
      {filtersConfig.map((filter) => (
        <div key={filter.id} className="flex flex-col">
          {generateField(filter, filter.id)}
        </div>
      ))}
    </div>
  )
}

export default TableFilters
