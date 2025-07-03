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
}

const baseInputClasses = "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"

const TableFilters: React.FC<TableFiltersProps> = ({
  filtersConfig,
  onFilterChange,
  debounceTime = 300,
}) => {
  const [filterValues, setFilterValues] = useState<FilterValues>(() => {
    const initialValues: FilterValues = {}
    filtersConfig.forEach(filter => {
      initialValues[filter.id] = ''
    })
    return initialValues
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filterValues)
    }, debounceTime)

    return () => {
      clearTimeout(handler)
    }
  }, [filterValues, onFilterChange, debounceTime])

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
                className={`${baseInputClasses} pr-10`}
                >
                <option value="">-- Pilih {filter.label.toLowerCase()} --</option>
                {filter.options?.map(option => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            </div>
          )}
        </div>
      ))}
      {/* Tombol reset bisa ditambahkan jika diperlukan */}
      {/* <button
        onClick={() => setFilterValues(initialFilterState)} // Anda perlu menyimpan initialFilterState jika ingin tombol reset
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Reset
      </button> */}
    </div>
  )
}

export default TableFilters