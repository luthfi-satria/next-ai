// store/categoryStore.ts

import { create } from "zustand"
import { PopulateTable, PUSHAPI } from "@/helpers/apiRequest"
import { convertObjectToSelectOptions } from "@/helpers/objectHelpers"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import { Category } from "@/models/interfaces/category.interfaces"
import { catchError } from "@/helpers/responseHelper"
import { useDebounce } from "@/hooks/useDebounce"
import { FilterValues } from "@/components/table/TableFilters"
import { ObjectId } from "mongodb"

// define state store
interface CategoryStoreState {
  SelectedCategory: ObjectId
  CategoryFilter: FilterValues
  Categories: Category[]
  CategoryOption: SelectOption[]
  TotalCategory: number
  CategoryIsLoading: boolean
  CategoryIsSearching: boolean
  CategoryCurrentPage: number
  CategoryLimit: number
  CategoryError: string | null
}

// action type
interface CategoryStoreActions {
  setSelectedCategory: (category: ObjectId) => void
  setCategoryFilter: (filter: FilterValues) => void
  setCategoryIsLoading: (status: boolean) => void
  setCategoryCurrentPage: (number: number) => void
  setCategoryLimit: (number: number) => void
  setCategoryIsSearching: (status: boolean) => void
  fetchCategories: () => void
  deleteCategory: () => void
}

// combine the state
type CombinedCategoryStore = CategoryStoreState & CategoryStoreActions

export const useCategoryStore = create<CombinedCategoryStore>((set, get) => {
  const fetchCategories = async () => {
    const { CategoryFilter, CategoryCurrentPage, CategoryLimit } = get()
    set({ CategoryIsLoading: true, CategoryError: null })
    try {
      const { response, ApiResponse } = await PopulateTable(
        "/api/categories",
        CategoryFilter,
        CategoryCurrentPage,
        CategoryLimit,
      )

      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data
        const storeOption = convertObjectToSelectOptions(data, {
          valueKey: "_id",
          labelKey: "name",
          defaultValue: "",
        })
        set({
          Categories: data as Category[],
          CategoryOption: storeOption as SelectOption[],
          TotalCategory: ApiResponse.results.total,
        })
      } else {
        set({
          Categories: [],
          TotalCategory: 0,
          CategoryError: ApiResponse.message || "Failed to fetch category",
        })
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      set({ Categories: [], TotalCategory: 0, CategoryError: errMsg })
    } finally {
      set({ CategoryIsLoading: false, CategoryIsSearching: false })
    }
  }

  const debouncedFetch = useDebounce(fetchCategories, 1000)

  const deleteCategory = async () => {
    try {
      const { SelectedCategory } = get()
      set({ CategoryIsLoading: true, CategoryError: null })
      if (SelectedCategory) {
        const { response, data } = await PUSHAPI(
          "DELETE",
          `/api/categories/${SelectedCategory}`,
          "",
        )

        if (response.ok && data.success) {
          debouncedFetch()
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error: `, error.message)
        set({ CategoryError: error.message })
      }
    } finally {
      // setIsModalOpen(false)
      set({
        CategoryIsLoading: false,
        CategoryError: null,
        SelectedCategory: null,
      })
    }
  }

  return {
    // Initial state
    SelectedCategory: null,
    CategoryFilter: null,
    Categories: [],
    CategoryOption: [],
    TotalCategory: 0,
    CategoryIsLoading: false,
    CategoryIsSearching: false,
    CategoryCurrentPage: 1,
    CategoryLimit: 10,
    CategoryError: null,

    // Action to changed the state and trigger searching
    setSelectedCategory: (categoryId: ObjectId) =>
      set({ SelectedCategory: categoryId }),
    setCategoryFilter: (filter: FilterValues) =>
      set({ CategoryFilter: filter }),
    setCategoryIsLoading: (status: boolean) =>
      set({ CategoryIsLoading: status }),
    setCategoryCurrentPage: (page: number) =>
      set({ CategoryCurrentPage: page }),
    setCategoryLimit: (limit: number) => set({ CategoryLimit: limit }),
    setCategoryIsSearching: (isSearch: boolean) =>
      set({ CategoryIsSearching: isSearch }),
    fetchCategories: debouncedFetch,
    deleteCategory: deleteCategory,
  }
})
