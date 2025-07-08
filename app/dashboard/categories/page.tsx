// app/page.tsx
'use client' // Pastikan ini ada jika menggunakan React hooks dan interaktivitas

import ConfirmModal from '@/components/ConfirmModal'
import TableFilters, { FilterConfig, FilterValues } from '@/components/table/TableFilters'
import TablePagination from '@/components/table/TablePagination'
import { enumToSelectOptions, sanitizeParams } from '@/helpers/objectHelpers'
import { Category } from '@/models/interfaces/category.interfaces'
import { APIResponse, PublishStatus, SelectOption } from '@/models/interfaces/global.interfaces'
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
      const params = { ...sanitizeParams(currentFilters), page: String(currentPage), limit: String(limit) }
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/categories?${queryString}`)
      const ApiResponse: APIResponse = await response.json()

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
        const response = await fetch(`/api/categories/${SelectedCategory}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data: APIResponse = await response.json()

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">Category Management Dashboard</h1>
        <div className='flex flex-col mb-6'>
          <div className="mb-6">
            <Link
              href="/dashboard/categories/add"
              className="py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
            >
              ✨ Add New Category
            </Link>
          </div>
          <div className='w-full flex flex-col'>
            <TableFilters
              filtersConfig={categoryConfig}
              onFilterChange={handleFilterChange}
              initialFilterValues={currentFilters}
            // debounceTime={500} // Anda bisa customize debounce time jika diperlukan
            />
            <div className='flex w-full gap-4 justify-end'>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 self-end" // self-end untuk alignment
              >
                Find
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 self-end" // self-end untuk alignment
              >
                Reset Filter
              </button>
            </div>
          </div>

        </div>

        {/* Tabel Category List */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">Registered Category</h2>
        {Categories && Categories.length === 0 ? (
          <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
            <p>No category found. Click "Add New Category" to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <TablePagination
              currentPage={currentPage}
              totalItems={TotalCategory}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  {/* Tambahkan kolom lain jika diperlukan, misal: <th ...>Actions</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Categories && Categories.map((cat, key) => (
                  <tr key={`cat_${key}`} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-lg">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{cat.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{cat.status}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <Link
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        href={`/dashboard/categories/details/${cat._id}`}
                        replace={true}
                      >Edit</Link>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleConfirmDelete(cat._id)}>Delete</button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              currentPage={currentPage}
              totalItems={TotalCategory}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title='Remove category'
        confirmText='Yes, Remove!'
        cancelText='No'
      />
    </div>
  )
}