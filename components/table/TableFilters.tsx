import { SelectOption } from '@/models/interfaces/global.interfaces'
import React, { useCallback, useEffect, useState } from 'react'
import DateInput from '../form/inputDate'
import SelectInput from '../form/inputSelect'
import TextInput from '../form/inputText'

export type FilterType = 'text' | 'select' | 'date' | 'radio' | 'checkbox' | 'textarea' | 'daterange'

export interface FilterConfig {
  id: string // unique ID for filter (e.g., 'search', 'status', 'role')
  label: string // Showing label (e.g., 'Find', 'Status', 'Role', 'etc')
  type: FilterType // Filter type (text or select)
  placeholder?: string // Placeholder for input text
  options?: SelectOption[] // filter select options
}

export interface FilterValues {
  [key: string]: string
}

// --- Komponen TableFilters ---

interface TableFiltersProps {
  filtersConfig: FilterConfig[]
  onFilterChange: (filters: FilterValues) => void
  debounceTime?: number
  initialFilterValues: FilterValues
}

const baseInputClasses = "block w-full p-2.5 text-sm rounded-lg border focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease focus:outline-none focus:shadow-md appearance-none cursor-pointer " +
  "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 " +
  "hover:border-gray-400";

const TableFilters: React.FC<TableFiltersProps> = ({
  filtersConfig,
  onFilterChange,
  debounceTime = 300,
  initialFilterValues
}) => {
  const [filterValues, setFilterValues] = useState<FilterValues>(initialFilterValues)

  useEffect(() => {
    if (JSON.stringify(filterValues) !== JSON.stringify(initialFilterValues)) {
      setFilterValues(initialFilterValues);
    }
  }, [initialFilterValues]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filterValues)
    }, debounceTime)

    return () => {
      clearTimeout(handler)
    }
  }, [filterValues, onFilterChange, debounceTime]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilterValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }))
  }, [])

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
      {filtersConfig.map(filter => (
        <div key={filter.id} className="flex flex-col">
          {filter.type === 'text' && (
            <TextInput
              type="text"
              label={filter.label}
              id={filter.id}
              name={filter.id}
              value={filterValues[filter.id] || ''}
              onChange={(e) => handleInputChange}
              placeholder={filter.placeholder || `${filter.label.toLowerCase()}...`}
              className={baseInputClasses}
            />
          )}
          {filter.type === 'select' && (
            <SelectInput
              label={filter.label}
              id={filter.id}
              selectedValue={filterValues[filter.id] || ''}
              onChange={(e) => handleInputChange}
              options={filter.options}
            />
          )}
          {filter.type === 'date' && (
            <DateInput
              label={filter.label}
              id={filter.id}
              name={filter.id}
              value={filterValues[filter.id] || ''}
              onChange={(e) => handleInputChange}
              className={baseInputClasses}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default TableFilters