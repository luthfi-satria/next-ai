import React, { useCallback, useEffect, useState } from "react"
import InputGenerator, {
  ChangeEventOrValues,
  InputGeneratorType,
} from "../form/inputGenerator"
import {
  BUTTON_GRADIENT_GRAY,
  BUTTON_GRADIENT_GREEN,
} from "@/constants/formStyleConstant"
import { formEventHandler } from "@/helpers/formHandler"

export type FilterType =
  | "text"
  | "select"
  | "date"
  | "radio"
  | "checkbox"
  | "textarea"
  | "daterange"
  | "autocomplete"
  | "price_range"

export interface FilterConfig extends InputGeneratorType {
  isLoading?: boolean
  callback?: (e: React.ChangeEvent) => void
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
      const { name, value } = formEventHandler(e)
      setFilterValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))
    },
    [setFilterValues],
  )

  const InputGeneratorProp = filtersConfig.map((item) => {
    return {
      ...item,
      name: item.id,
      onChange: handleInputChange,
      value: filterValues && filterValues[item.id] ? filterValues[item.id] : "",
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
