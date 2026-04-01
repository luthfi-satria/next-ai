import { FilterValues } from "@/components/table/TableFilters"
import { GETAPICALL, PopulateTable, PUSHAPI } from "@/helpers/apiRequest"
import { convertObjectToSelectOptions } from "@/helpers/objectHelpers"
import { catchError } from "@/helpers/responseHelper"
import { useDebounce } from "@/hooks/useDebounce"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import { Stores } from "@/models/interfaces/stores.interfaces"
import { create } from "zustand"

interface StoreActionState {
  setSelectedStore: (storeId: string) => void
  setStoreFilter: (filter: FilterValues) => void
  setIsLoading: (status: boolean) => void
  setCurrentPage: (page: number) => void
  setLimit: (limit: number) => void
  setIsSearching: (status: boolean) => void
  fetchStores: () => void
  refetchStoreOptions: () => void
  deleteStores: () => void
}

interface StoreState {
  SelectedStore: string
  StoreFilter: FilterValues
  Stores: Stores[]
  StoresOption: SelectOption[]
  TotalStores: number
  IsLoading: boolean
  IsSearching: boolean
  CurrentPage: number
  Limit: number
  Error: string | null
  Actions: StoreActionState
}

const useStoresStore = create<StoreState>((set, get) => {
  const fetchStores = async () => {
    const { StoreFilter, CurrentPage, Limit } = get()

    set({ IsLoading: true, Error: null })
    try {
      const { response, ApiResponse } = await PopulateTable<Stores[]>(
        "/api/stores",
        StoreFilter,
        CurrentPage,
        Limit,
      )

      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data
        const storeOption = convertObjectToSelectOptions(data, {
          valueKey: "_id",
          labelKey: "name",
          defaultValue: "",
        })
        set({
          Stores: data as Stores[],
          StoresOption: storeOption as SelectOption[],
          TotalStores: ApiResponse.results.total,
        })
      } else {
        set({
          Stores: [],
          TotalStores: 0,
          Error: ApiResponse.message || "Failed to fetch stores",
        })
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      set({ Stores: [], TotalStores: 0, Error: errMsg })
    } finally {
      set({ IsLoading: false, IsSearching: false })
    }
  }

  const debounceFetch = useDebounce(fetchStores, 1000)

  const deleteStores = async () => {
    try {
      const { SelectedStore } = get()
      set({ IsLoading: true, Error: null })
      if (SelectedStore) {
        const { response, data } = await PUSHAPI(
          "DELETE",
          `/api/products/${SelectedStore}`,
          "",
        )

        if (response.ok && data.success) {
          fetchStores()
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error: `, error.message)
        set({ Error: error.message })
      }
    } finally {
      // setIsModalOpen(false)
      set({ IsLoading: false, Error: null, SelectedStore: null })
    }
  }

  const refetchStoreOptions = async () => {
    const { SelectedStore } = get()
    if (SelectedStore) {
      set({ IsLoading: true, Error: null })
      const { response, ApiResponse } = await GETAPICALL<Stores>(
        `/api/stores/${SelectedStore}`,
      )
      if (response.ok && ApiResponse.success) {
        const data: Stores = ApiResponse.data

        const storeOption = convertObjectToSelectOptions([data], {
          valueKey: "_id",
          labelKey: "name",
          defaultValue: "",
        })
        set({
          StoresOption: storeOption,
        })
      } else {
        set({
          StoresOption: null,
          Error: ApiResponse.message || "Failed to get stores",
        })
      }
    }
  }

  return {
    SelectedStore: null,
    StoreFilter: null,
    Stores: [],
    StoresOption: [],
    TotalStores: 0,
    IsLoading: false,
    IsSearching: false,
    CurrentPage: 1,
    Limit: 10,
    Error: null,
    Actions: {
      setSelectedStore: (storeId: string) => set({ SelectedStore: storeId }),
      setStoreFilter: (filter: FilterValues) => set({ StoreFilter: filter }),
      setIsLoading: (status: boolean) => set({ IsLoading: status }),
      setCurrentPage: (page: number) => set({ CurrentPage: page }),
      setLimit: (limit: number) => set({ Limit: limit }),
      setIsSearching: (isSearch: boolean) => set({ IsSearching: isSearch }),
      fetchStores: debounceFetch,
      refetchStoreOptions: refetchStoreOptions,
      deleteStores: deleteStores,
    },
  }
})

const useSelectedStore = () => useStoresStore((state) => state.SelectedStore)
const useStoreFilter = () => useStoresStore((state) => state.StoreFilter)
const useStores = () => useStoresStore((state) => state.Stores)
const useTotalStores = () => useStoresStore((state) => state.TotalStores)
const useStoreIsLoading = () => useStoresStore((state) => state.IsLoading)
const useStoreCurrentPage = () => useStoresStore((state) => state.CurrentPage)
const useStoreLimit = () => useStoresStore((state) => state.Limit)
const useStoreError = () => useStoresStore((state) => state.Error)
const useStoreActions = () => useStoresStore((state) => state.Actions)
const useStoreOptions = () => useStoresStore((state) => state.StoresOption)

export {
  useSelectedStore,
  useStoreFilter,
  useStores,
  useTotalStores,
  useStoreCurrentPage,
  useStoreLimit,
  useStoreIsLoading,
  useStoreActions,
  useStoreError,
  useStoreOptions,
}
