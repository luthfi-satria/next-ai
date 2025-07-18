// app/page.tsx
'use client' // Pastikan ini ada jika menggunakan React hooks dan interaktivitas

import { AdminContentWrapperComponent, ContentProps, translateName } from '@/components/AdminContentWrapper'
import TableContentComponent from '@/components/table/TableContents'
import { FilterConfig, FilterValues } from '@/components/table/TableFilters'
import TablePagination from '@/components/table/TablePagination'
import { PopulateTable, PUSHAPI } from '@/helpers/apiRequest'
import { enumToSelectOptions } from '@/helpers/objectHelpers'
import { Category } from '@/models/interfaces/category.interfaces'
import { PublishStatus, SelectOption } from '@/models/interfaces/global.interfaces'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function HomePage() {
  const [Categories, setCategories] = useState<Category[]>([])
  const [TotalCategory, setTotalCategory] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSearch, setIsSearch] = useState<boolean>(true)
  const [SelectedCategory, setSelectedCategory] = useState<ObjectId>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const publishStatus: SelectOption[] = enumToSelectOptions(PublishStatus)

  const categoryConfig: FilterConfig[] = [
    { id: 'search', label: 'Find Name', type: 'text', placeholder: 'Type category name...' },
    {
      id: 'level', label: 'Find By Level', type: 'select', options: [
        { label: 'Main Level', value: "0" },
        { label: 'Second Level', value: "1" },
        { label: 'Third Level', value: "2" },
      ]
    },
    { id: 'date', label: 'Search by Date Range', type: 'text', placeholder: 'Type date' },
    { id: 'publish', label: 'Publish Status', type: 'select', options: publishStatus },
  ]

  const initialFilterState = useMemo(() => {
    const initialState: FilterValues = {}
    categoryConfig.forEach(filter => {
      initialState[filter.id] = ''
    })
    return initialState
  }, [])

  const [currentFilters, setCurrentFilters] = useState<FilterValues>(initialFilterState)

  const handleFilterChange = useCallback((filters: FilterValues) => {
    setCurrentFilters(filters)
  }, [])

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(initialFilterState)
    setIsSearch(true)
  }, [initialFilterState])

  useEffect(() => {
    if (!Categories || isSearch) {
      fetchCategories()
    }
  }, [Categories, isSearch])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const { response, ApiResponse } = await PopulateTable(`/api/categories`, currentFilters, currentPage, limit)
      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data

        setCategories(data as Category[])
        setTotalCategory(ApiResponse.results.total)
      } else {
        setError(ApiResponse.message || 'Failed to fetch category')
      }
    } catch (err: any) {
      // setError(err.message)
    } finally {
      setLoading(false)
      setIsSearch(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p className="text-xl font-semibold text-gray-700">Loading categories...</p>
    </div>
  )
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p className="text-xl font-semibold text-red-600">Error: {error}</p>
    </div>
  )

  const handleDelete = async () => {
    if (SelectedCategory) {
      try {
        const { response, data } = await PUSHAPI('DELETE', `/api/categories/${SelectedCategory}`, '')
        if (response.ok && data.success) {
          fetchCategories()
        }
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsModalOpen(false)
        setSelectedCategory(null)
      }
    }
    return true
  }

  const handleConfirmDelete = (categoryId: ObjectId) => {
    setIsModalOpen(true)
    setSelectedCategory(categoryId)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCategory(null)
  }

  const handlePageChange = (page: number) => {
    setIsSearch(true)
    setCurrentPage(page)
  }

  const handleSearch = () => {
    setIsSearch(true)
  }

  const translateAction = (value: ObjectId, rowData: Record<string, any>) => {
    return (
      <>
        <Link
          className="text-indigo-600 hover:text-indigo-900 mr-4"
          href={`/dashboard/categories/details/${value}`}
          replace={true}
        >Edit
        </Link>
        <button className="text-red-600 hover:text-red-900" onClick={() => handleConfirmDelete(value)}>Delete</button>
      </>
    )
  }

  const pageProps: ContentProps = {
    title: 'Category Management',
    addButton: {
      href: '/dashboard/categories/add',
      label: 'Add new category'
    },
    addFilter: {
      config: categoryConfig,
      onFilterChange: handleFilterChange,
      currentFilters: currentFilters,
      onSearch: handleSearch,
      onReset: handleResetFilters,
    },
    modal: {
      confirmText: 'Yes, remove!',
      cancelText: 'No',
      isOpen: isModalOpen,
      onClose: handleCloseModal,
      onConfirm: handleDelete,
      title: 'Remove category'
    },
  }

  const TableColumn = [
    { name: 'Name', columnKey: 'name', translater: translateName },
    { name: 'Level', columnKey: 'level' },
    { name: 'Parent', columnKey: 'parentId' },
    { name: 'Description', columnKey: 'description' },
    { name: 'Status', columnKey: 'publish' },
    { name: 'Created', columnKey: 'created_at' },
    { name: 'Updated', columnKey: 'updated_at' },
    { name: 'Action', columnKey: '_id', translater: translateAction },
  ]

  return (
    <AdminContentWrapperComponent props={pageProps}>
      {/* Tabel Category List */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">Registered Category</h2>
      {Categories && Categories.length === 0 ? (
        <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
          <p>No category found. Click "Add New Category" to get started!</p>
        </div>
      ) : (
        <div className='shadow-md rounded-t-md border border-gray-200'>
          <TablePagination
            currentPage={currentPage}
            totalItems={TotalCategory}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
          <TableContentComponent column={TableColumn} data={Categories} />
          <TablePagination
            currentPage={currentPage}
            totalItems={TotalCategory}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </AdminContentWrapperComponent>
  )
}