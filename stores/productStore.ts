// store/productStore.ts

import { create } from "zustand"
import { PopulateTable, PUSHAPI } from "@/helpers/apiRequest"
import { catchError } from "@/helpers/responseHelper"
import { FilterValues } from "@/components/table/TableFilters"
import { Products } from "@/models/interfaces/products.interfaces"
import { ObjectId } from "mongodb"

// action type
interface ProductActionState {
  setSelectedProduct: (productId: ObjectId) => void
  setProductFilter: (filter: FilterValues) => void
  setIsLoading: (status: boolean) => void
  setCurrentPage: (page: number) => void
  setLimit: (page: number) => void
  setIsSearching: (status: boolean) => void
  fetchProducts: () => void
  deleteProduct: () => void
}

// define state store
interface ProductStoreState {
  SelectedProduct: ObjectId
  Products: Products[]
  ProductFilter: FilterValues
  TotalProducts: number
  IsLoading: boolean
  IsSearching: boolean
  CurrentPage: number
  Limit: number
  Error: string | null
  Actions: ProductActionState
}

const useProductStore = create<ProductStoreState>((set, get) => {
  const fetchProducts = async () => {
    const { ProductFilter, CurrentPage, Limit } = get()
    set({ IsLoading: true, Error: null })
    try {
      const { response, ApiResponse } = await PopulateTable(
        "/api/products",
        ProductFilter,
        CurrentPage,
        Limit,
      )

      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data
        set({
          Products: data as Products[],
          TotalProducts: ApiResponse.results.total,
        })
      } else {
        set({
          Products: [],
          TotalProducts: 0,
          Error: ApiResponse.message || "Failed to fetch products",
        })
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      set({ Products: [], TotalProducts: 0, Error: errMsg })
    } finally {
      set({ IsLoading: false, IsSearching: false })
    }
  }

  const deleteProduct = async () => {
    try {
      const { SelectedProduct } = get()
      set({ IsLoading: true, Error: null })
      if (SelectedProduct) {
        const { response, data } = await PUSHAPI(
          "DELETE",
          `/api/products/${SelectedProduct}`,
          "",
        )

        if (response.ok && data.success) {
          fetchProducts()
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error: `, error.message)
        set({ Error: error.message })
      }
    } finally {
      // setIsModalOpen(false)
      set({ IsLoading: false, Error: null, SelectedProduct: null })
    }
  }

  return {
    // Initial state
    SelectedProduct: null,
    Products: [],
    ProductFilter: null,
    TotalProducts: 0,
    IsLoading: false,
    IsSearching: false,
    CurrentPage: 1,
    Limit: 10,
    Error: null,
    Actions: {
      // Action to changed the state
      setSelectedProduct: (productId: ObjectId) =>
        set({ SelectedProduct: productId }),
      setProductFilter: (filter: FilterValues) => {
        set({ ProductFilter: filter })
      },
      setIsLoading: (status: boolean) => {
        set({ IsLoading: status })
      },
      setIsSearching: (status: boolean) => {
        set({ IsSearching: status })
      },
      setCurrentPage: (page: number) => {
        set({ CurrentPage: page })
      },
      setLimit: (limit: number) => {
        set({ Limit: limit })
      },
      fetchProducts: fetchProducts,
      deleteProduct: deleteProduct,
    },
  }
})

const useSelectedProduct = () =>
  useProductStore((state) => state.SelectedProduct)
const useProductsIsSearch = () => useProductStore((state) => state.IsSearching)
const useProducts = () => useProductStore((state) => state.Products)
const useProductsFilter = () => useProductStore((state) => state.ProductFilter)
const useProductsPage = () => useProductStore((state) => state.CurrentPage)
const useProductsLimit = () => useProductStore((state) => state.Limit)
const useTotalProducts = () => useProductStore((state) => state.TotalProducts)
const useProductsError = () => useProductStore((state) => state.Error)
const useProductsAction = () => useProductStore((state) => state.Actions)
const useProductsLoading = () => useProductStore((state) => state.IsLoading)

export {
  useSelectedProduct,
  useProducts,
  useTotalProducts,
  useProductsError,
  useProductsAction,
  useProductsIsSearch,
  useProductsFilter,
  useProductsPage,
  useProductsLimit,
  useProductsLoading,
}
