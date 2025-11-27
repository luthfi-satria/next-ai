"use client"

import {
  AdminContentWrapperComponent,
  ContentProps,
  translateName,
} from "@/components/AdminContentWrapper"
import TableContentComponent from "@/components/table/TableContents"
import { FilterConfig, FilterValues } from "@/components/table/TableFilters"
import TablePagination from "@/components/table/TablePagination"
import { formatCurrency } from "@/helpers/currency"
import { enumToSelectOptions } from "@/helpers/objectHelpers"
import { productFilter } from "@/models/dashboard/product.model"
import {
  PublishStatus,
  SelectOption,
} from "@/models/interfaces/global.interfaces"
import { useCategoryStore } from "@/stores/categoryStore"
import {
  useProducts,
  useProductsAction,
  useProductsError,
  useProductsFilter,
  useProductsIsSearch,
  useProductsLimit,
  useProductsLoading,
  useProductsPage,
  useTotalProducts,
} from "@/stores/productStore"
import { ObjectId } from "mongodb"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

export default function HomePage() {
  const Products = useProducts()
  const TotalProducts = useTotalProducts()
  const ErrorResponse = useProductsError()
  const IsSearch = useProductsIsSearch()
  const ProductFilter = useProductsFilter()
  const CurrentPage = useProductsPage()
  const Limit = useProductsLimit()
  const Loading = useProductsLoading()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const publishStatus: SelectOption[] = enumToSelectOptions(PublishStatus)
  const {
    fetchProducts,
    setProductFilter,
    setIsSearching,
    setSelectedProduct,
    setCurrentPage,
    deleteProduct,
  } = useProductsAction()

  const {
    CategoryOption,
    CategoryIsLoading,
    fetchCategories,
    setCategoryFilter,
    CategoryFilter,
  } = useCategoryStore()

  const searchCategory = useCallback(
    (value: string) => {
      setCategoryFilter({ ...CategoryFilter, search: value })
      fetchCategories()
    },
    [setCategoryFilter, fetchCategories, CategoryFilter],
  )

  const formConfig: FilterConfig[] = useMemo(() => {
    return productFilter({
      publishStatus,
      category: CategoryOption,
      categoryOnChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        searchCategory(e.target.value),
      categoryLoading: CategoryIsLoading,
    })
  }, [publishStatus, CategoryOption, CategoryIsLoading, searchCategory])

  const initialFilterState: FilterValues = useMemo(() => {
    const initialState: FilterValues = {}
    formConfig.forEach((filter) => {
      initialState[filter.id] = ""
    })
    // setProductFilter(initialState)
    return initialState
  }, [formConfig])

  useEffect(() => {
    if (!ProductFilter) {
      setProductFilter(initialFilterState)
      setIsSearching(true)
    }
  }, [ProductFilter, setProductFilter, initialFilterState, setIsSearching])

  useEffect(() => {
    if (IsSearch) {
      fetchProducts()
    }
  }, [fetchProducts, IsSearch])

  const handleFilterChange = useCallback(
    (filters: FilterValues) => {
      setProductFilter(filters)
    },
    [setProductFilter],
  )

  const handleResetFilters = useCallback(() => {
    setProductFilter(initialFilterState)
    setIsSearching(true)
  }, [initialFilterState, setProductFilter, setIsSearching])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleConfirmDelete = (categoryId: ObjectId) => {
    setIsModalOpen(true)
    setSelectedProduct(categoryId)
  }

  const handlePageChange = (page: number) => {
    setIsSearching(true)
    setCurrentPage(page)
  }

  const translateAction = (
    value: ObjectId,
    _rowData: Record<string, unknown>,
  ) => {
    return (
      <>
        <Link
          className="text-indigo-600 hover:text-indigo-900 mr-4"
          href={`/dashboard/products/${value}`}
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
    title: "Products Management",
    addButton: {
      href: "/dashboard/products/add",
      label: "Add new products",
    },
    addFilter: {
      config: formConfig,
      onFilterChange: handleFilterChange,
      currentFilters: ProductFilter,
      onSearch: () => {
        setIsSearching(true)
      },
      onReset: handleResetFilters,
    },
    modal: {
      confirmText: "Yes, remove!",
      cancelText: "No",
      isOpen: isModalOpen,
      onClose: handleCloseModal,
      onConfirm: () => {
        deleteProduct()
        setIsModalOpen(false)
      },
      title: "Remove store",
    },
  }

  const TableColumn = [
    { name: "Name", columnKey: "name", translater: translateName },
    { name: "SKU", columnKey: "sku" },
    { name: "Category", columnKey: "categoryName" },
    { name: "Price", columnKey: "price", translater: (value: string, _: Record<string, unknown>) => formatCurrency(parseFloat(value))},
    { name: "Availability", columnKey: "availability" },
    { name: "Status", columnKey: "status" },
    { name: "Action", columnKey: "_id", translater: translateAction },
  ]

  return (
    <AdminContentWrapperComponent props={pageProps}>
      {Loading && (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-xl font-semibold text-gray-700">
            Loading products...
          </p>
        </div>
      )}

      {ErrorResponse && (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-xl font-semibold text-red-600">
            Error: {ErrorResponse}
          </p>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">
        Registered Products
      </h2>
      {Products && Products.length === 0 ? (
        <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
          <p>{`No products found. Click "Add New Products" to get started!`}</p>
        </div>
      ) : (
        <div className="shadow-md rounded-t-md border border-gray-200">
          <TablePagination
            currentPage={CurrentPage}
            totalItems={TotalProducts}
            itemsPerPage={Limit}
            onPageChange={handlePageChange}
          />
          <TableContentComponent column={TableColumn} data={Products} />
          <TablePagination
            currentPage={CurrentPage}
            totalItems={TotalProducts}
            itemsPerPage={Limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </AdminContentWrapperComponent>
  )
}
