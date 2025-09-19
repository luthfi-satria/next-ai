// store/productStore.ts

import { create } from "zustand"
import { PopulateTable } from "@/helpers/apiRequest"
import { convertObjectToSelectOptions } from "@/helpers/objectHelpers"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import { Category } from "@/models/interfaces/category.interfaces"
import { catchError } from "@/helpers/responseHelper"
import { FilterConfig, FilterValues } from "@/components/table/TableFilters"
import { Products } from "@/models/interfaces/products.interfaces"
import { productFilter } from "@/models/dashboard/product.model"

// define state store
interface ProductStoreState {
  products: Products[]
  productFilter: FilterValues
  totalProducts: number
  isLoading: boolean
  isSearching: boolean
  formConfig: FilterConfig[]
  currentPage: number
  limit: number
  error: string | null
}

// action type
interface ProductActionState {
  setProduct: (category: string) => void
  setProductFilter: (filter: FilterValues) => void
  setIsLoading: (status: boolean) => void
}

// combine the state
type CombinedState = ProductStoreState & ProductActionState

export const useProductStore = create<CombinedState>((set, get) => {
  const fetchProducts = async () => {
    set({ isLoading: true, error: null })
    try {
      const { response, ApiResponse } = await PopulateTable(
        "/api/products",
        get().productFilter,
        get().currentPage,
        get().limit,
      )
      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data
        set({
          products: data as Products[],
          totalProducts: ApiResponse.results.total,
        })
      } else {
        set({
          products: [],
          totalProducts: 0,
          error: ApiResponse.message || "Failed to fetch products",
        })
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      set({ products: [], totalProducts: 0, error: errMsg })
    } finally {
      set({ isLoading: true, isSearching: false })
    }
  }

  return {
    // Initial state
    products: [],
    productFilter: [],
    totalProducts: 0,
    isLoading: true,
    isSearching: true,
    formConfig: [],
    currentPage: 1,
    limit: 10,
    error: null,

    // Action to changed the state
  }
})
