import { SelectOption } from '@/models/interfaces/global.interfaces'
import React, { useState, useEffect, useCallback } from 'react'

export type FilterType = 'text' | 'select'

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
          <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700 mb-1">
            {filter.label}
          </label>
          {filter.type === 'text' && (
            <input
              type="text"
              id={filter.id}
              name={filter.id}
              value={filterValues[filter.id] || ''}
              onChange={handleInputChange}
              placeholder={filter.placeholder || `Cari ${filter.label.toLowerCase()}...`}
              className={baseInputClasses}
            />
          )}
          {filter.type === 'select' && (
            <div className='relative'>
                <select
                id={filter.id}
                name={filter.id}
                value={filterValues[filter.id] || ''}
                onChange={handleInputChange}
                // Tambahkan pr-10 untuk menjaga ruang bagi ikon panah custom atau default
                className={`${baseInputClasses} pr-10`}
                >
                <option value="">-- Pilih {filter.label.toLowerCase()} --</option>
                {filter.options?.map(option => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
                {/* Ikon panah kustom untuk select box */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-gray-700 dark:text-gray-400 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default TableFilters