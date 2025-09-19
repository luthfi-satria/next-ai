// store/categoryStore.ts

import { create } from "zustand"
import { PopulateTable } from "@/helpers/apiRequest"
import { convertObjectToSelectOptions } from "@/helpers/objectHelpers"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import { Category } from "@/models/interfaces/category.interfaces"
import { catchError } from "@/helpers/responseHelper"

function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

// define state store
interface CategoryStoreState {
  category: string
  categoryOptions: SelectOption[]
  categoryList: Category[]
  getCategoryLoading: boolean
  selectedCategory: Category | null
  error: string | null
}

// action type
interface CategoryStoreActions {
  setCategory: (category: string) => void
}

// combine the state
type CombinedCategoryStore = CategoryStoreState & CategoryStoreActions

export const useCategoryStore = create<CombinedCategoryStore>((set) => {
  const fetchCategories = async (query: string) => {
    if (query.length < 3) {
      set({ categoryOptions: [], selectedCategory: null })
      return
    }

    set({ getCategoryLoading: true })

    try {
      const { ApiResponse } = await PopulateTable(
        "/api/categories",
        {
          search: query,
        },
        1,
        10,
      )

      if (ApiResponse.success) {
        const data = ApiResponse.results.data
        const categoryOptions = convertObjectToSelectOptions(data, {
          labelKey: "name",
          valueKey: "_id",
        })
        set({ categoryOptions, error: null })
      } else {
        set({
          error: ApiResponse.message || "Failed to fetch categories",
          categoryOptions: [],
        })
      }
    } catch (error: unknown) {
      const errMsg = catchError(error)
      set({ categoryOptions: [], error: errMsg })
    } finally {
      set({ getCategoryLoading: false })
    }
  }

  const debouncedFetchCategories = debounce(fetchCategories, 1000)

  return {
    // Initial state
    category: "",
    categoryList: [],
    categoryOptions: [],
    getCategoryLoading: false,
    selectedCategory: null,
    error: null,

    // Action to changed the state and trigger searching
    setCategory: (value: string) => {
      set({ category: value })
      debouncedFetchCategories(value)
    },
    fetchCategories: debouncedFetchCategories,
  }
})
