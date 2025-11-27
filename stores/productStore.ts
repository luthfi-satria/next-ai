// store/productStore.ts

import { create } from "zustand"
import { PopulateTable, PUSHAPI } from "@/helpers/apiRequest"
import { catchError } from "@/helpers/responseHelper"
import { FilterValues } from "@/components/table/TableFilters"
import {
  initProduct,
  initVariant,
  initVariantAttributes,
  ProductInfo,
  Products,
  ProductVariants,
} from "@/models/interfaces/products.interfaces"
import { ObjectId } from "mongodb"
import { Dispatch, SetStateAction } from "react"

// action type
interface ProductActionState {
  setSelectedProduct: (productId: ObjectId) => void
  setProductFilter: (filter: FilterValues) => void
  setIsLoading: (status: boolean) => void
  setCurrentPage: (page: number) => void
  setLimit: (page: number) => void
  setIsSearching: (status: boolean) => void
  setError: (error: string) => void
  setResponseMessage: (message: string) => void
  fetchProducts: () => void
  deleteProduct: () => void
  setNewProduct: (product: ProductInfo) => void
  setNewVariantField: (name: string, value: string | number | boolean) => void
  addNewAttribute: () => void
  removeNewAttribute: (keyToRemove: number) => void
  setNewAttributeField: (
    keyToUpdate: number,
    name: string,
    value: string,
  ) => void
  saveNewVariantToProduct: (
    product: ProductInfo,
    setProduct: Dispatch<SetStateAction<ProductInfo>>,
  ) => void
}

interface AddNewProductState {
  newProduct: ProductInfo
  newVariants: ProductVariants
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
  ResponseMessage: string | null
  Actions: ProductActionState
  AddNewProduct: AddNewProductState
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

  const setNewProduct = async () => {}
  const setNewVariantField = (
    name: string,
    value: string | number | boolean,
  ) => {
    set((state) => ({
      AddNewProduct: {
        ...state.AddNewProduct,
        newVariants: {
          ...state.AddNewProduct.newVariants,
          [name]: value,
        },
      },
    }))
  }
  const addNewAttribute = () => {
    set((state) => {
      const currentAttributes = state.AddNewProduct.newVariants.attributes || []
      const newAttributes = [...currentAttributes, initVariantAttributes]
      return {
        AddNewProduct: {
          ...state.AddNewProduct,
          newVariants: {
            ...state.AddNewProduct.newVariants,
            attributes: newAttributes,
          },
        },
      }
    })
  }
  const removeNewAttribute = (keyToRemove: number) => {
    set((state) => {
      const updatedAttributes =
        state.AddNewProduct.newVariants.attributes.filter(
          (_, index) => index !== keyToRemove,
        )
      return {
        AddNewProduct: {
          ...state.AddNewProduct,
          newVariants: {
            ...state.AddNewProduct.newVariants,
            attributes: updatedAttributes,
          },
        },
      }
    })
  }
  const setNewAttributeField = (
    keyToUpdate: number,
    name: string,
    value: string,
  ) => {
    set((state) => {
      const updatedAttributes = state.AddNewProduct.newVariants.attributes.map(
        (attribute, index) => {
          if (index === keyToUpdate) {
            return {
              ...attribute,
              [name]: value,
            }
          }
          return attribute
        },
      )
      return {
        AddNewProduct: {
          ...state.AddNewProduct,
          newVariants: {
            ...state.AddNewProduct.newVariants,
            attributes: updatedAttributes,
          },
        },
      }
    })
  }
  const saveNewVariantToProduct = (
    product: ProductInfo,
    setProduct: Dispatch<SetStateAction<ProductInfo>>,
  ) => {
    const newVariant = get().AddNewProduct.newVariants

    setProduct((prevProduct) => {
      const updatedProductVariants = [...prevProduct.variants, newVariant]
      console.log("Product Updated via Zustand Action:", updatedProductVariants)
      return {
        ...prevProduct,
        variants: updatedProductVariants,
      }
    })

    // Reset state sementara di Zustand
    set((state) => ({
      AddNewProduct: {
        ...state.AddNewProduct,
        newVariants: initVariant, // Reset ke varian kosong awal
      },
    }))
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
    ResponseMessage: null,
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
      setError: (error: string) => {
        set({ Error: error })
      },
      setResponseMessage: (msg: string) => {
        set({ ResponseMessage: msg })
      },
      fetchProducts: fetchProducts,
      deleteProduct: deleteProduct,
      setNewProduct: setNewProduct,
      setNewVariantField: setNewVariantField,
      addNewAttribute: addNewAttribute,
      removeNewAttribute: removeNewAttribute,
      setNewAttributeField: setNewAttributeField,
      saveNewVariantToProduct: saveNewVariantToProduct,
    },
    AddNewProduct: {
      newProduct: initProduct,
      newVariants: initVariant,
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
const useNewVariants = () =>
  useProductStore((state) => state.AddNewProduct.newVariants)

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
  useNewVariants,
}
