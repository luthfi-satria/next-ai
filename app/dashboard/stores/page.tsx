"use client"

import {
  AdminContentWrapperComponent,
  ContentProps,
  translateName,
} from "@/components/AdminContentWrapper"
import TableContentComponent from "@/components/table/TableContents"
import { FilterConfig, FilterValues } from "@/components/table/TableFilters"
import TablePagination from "@/components/table/TablePagination"
import { PopulateTable, PUSHAPI } from "@/helpers/apiRequest"
import { enumToSelectOptions } from "@/helpers/objectHelpers"
import {
  PublishStatus,
  SelectOption,
} from "@/models/interfaces/global.interfaces"
import { Stores } from "@/models/interfaces/stores.interfaces"
import { ObjectId } from "mongodb"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

export default function HomePage() {
  const [Stores, setStores] = useState<Stores[]>([])
  const [TotalStores, setTotalStores] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSearch, setIsSearch] = useState<boolean>(true)
  const [SelectedStore, setSelectedStore] = useState<ObjectId>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const limit = 10
  const publishStatus: SelectOption[] = enumToSelectOptions(PublishStatus)

  const formConfig: FilterConfig[] = useMemo(() => {
    return [
      {
        id: "search",
        label: "Find Name",
        type: "text",
        placeholder: "Type stores name...",
      },
      {
        id: "city",
        label: "Find City",
        type: "text",
        placeholder: "Type city name...",
      },
      {
        id: "province",
        label: "Find Province",
        type: "text",
        placeholder: "Type province name...",
      },
      {
        id: "publish",
        label: "Publish Status",
        type: "select",
        options: publishStatus,
      },
    ]
  }, [publishStatus])

  const initialFilterState = useMemo(() => {
    const initialState: FilterValues = {}
    formConfig.forEach((filter) => {
      initialState[filter.id] = ""
    })
    return initialState
  }, [formConfig])

  const [currentFilters, setCurrentFilters] =
    useState<FilterValues>(initialFilterState)

  const handleFilterChange = useCallback((filters: FilterValues) => {
    setCurrentFilters(filters)
  }, [])

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(initialFilterState)
    setIsSearch(true)
  }, [initialFilterState])

  const fetchStores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { response, ApiResponse } = await PopulateTable(
        "/api/stores",
        currentFilters,
        currentPage,
        limit,
      )
      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data

        setStores(data as Stores[])
        setTotalStores(ApiResponse.results.total)
      } else {
        setError(ApiResponse.message || "Failed to fetch stores")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error: `, err.message)
      }
      // setError(err.message)
    } finally {
      setLoading(false)
      setIsSearch(false)
    }
  }, [currentFilters, currentPage])

  useEffect(() => {
    if (!Stores || isSearch) {
      fetchStores()
    }
  }, [Stores, isSearch, fetchStores])

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-700">Loading Stores...</p>
      </div>
    )
  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
      </div>
    )

  const handleDelete = async () => {
    if (SelectedStore) {
      try {
        const { response, data } = await PUSHAPI(
          "DELETE",
          `/api/stores/${SelectedStore}`,
          "",
        )
        if (response.ok && data.success) {
          fetchStores()
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(`Error: `, error.message)
          setError(error.message)
        }
      } finally {
        setIsModalOpen(false)
        setSelectedStore(null)
      }
    }
    return true
  }

  const handleConfirmDelete = (categoryId: ObjectId) => {
    setIsModalOpen(true)
    setSelectedStore(categoryId)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStore(null)
  }

  const handlePageChange = (page: number) => {
    setIsSearch(true)
    setCurrentPage(page)
  }

  const handleSearch = () => {
    setIsSearch(true)
  }
  const translateAction = (
    value: ObjectId,
    _rowData: Record<string, unknown>,
  ) => {
    return (
      <>
        <Link
          className="text-indigo-600 hover:text-indigo-900 mr-4"
          href={`/dashboard/stores/${value}`}
          replace={true}
        >
          Edit
        </Link>
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => handleConfirmDelete(value)}
        >
          Delete
        </button>
      </>
    )
  }

  const pageProps: ContentProps = {
    title: "Store Management",
    addButton: {
      href: "/dashboard/stores/add",
      label: "Add new stores",
    },
    addFilter: {
      config: formConfig,
      onFilterChange: handleFilterChange,
      currentFilters: currentFilters,
      onSearch: handleSearch,
      onReset: handleResetFilters,
    },
    modal: {
      confirmText: "Yes, remove!",
      cancelText: "No",
      isOpen: isModalOpen,
      onClose: handleCloseModal,
      onConfirm: handleDelete,
      title: "Remove store",
    },
  }

  const TableColumn = [
    { name: "Name", columnKey: "name", translater: translateName },
    { name: "City", columnKey: "city" },
    { name: "Province", columnKey: "province" },
    { name: "Status", columnKey: "publish" },
    { name: "Action", columnKey: "_id", translater: translateAction },
  ]
  return (
    <AdminContentWrapperComponent props={pageProps}>
      {/* Tabel Store List */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">
        Registered Store
      </h2>
      {Stores && Stores.length === 0 ? (
        <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
          <p>{`No stores found. Click "Add New Store" to get started!`}</p>
        </div>
      ) : (
        <div className="shadow-md rounded-t-md border border-gray-200">
          <TablePagination
            currentPage={currentPage}
            totalItems={TotalStores}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
          <TableContentComponent column={TableColumn} data={Stores} />
          <TablePagination
            currentPage={currentPage}
            totalItems={TotalStores}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </AdminContentWrapperComponent>
  )
}
