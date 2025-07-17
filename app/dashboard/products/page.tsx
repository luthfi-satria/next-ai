'use client'

import { AdminContentWrapperComponent, ContentProps, translateName } from '@/components/AdminContentWrapper'
import TableContentComponent from '@/components/table/TableContents'
import { FilterConfig, FilterValues } from '@/components/table/TableFilters'
import TablePagination from '@/components/table/TablePagination'
import { PopulateTable } from '@/helpers/apiRequest'
import { enumToSelectOptions } from '@/helpers/objectHelpers'
import { APIResponse, PublishStatus, SelectOption } from '@/models/interfaces/global.interfaces'
import { Products } from '@/models/interfaces/products.interfaces'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function HomePage() {
    const [Products, setProducts] = useState<Products[]>([])
    const [TotalProducts, setTotalProducts] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isSearch, setIsSearch] = useState<boolean>(true)
    const [SelectedProduct, setSelectedProduct] = useState<ObjectId>()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const publishStatus: SelectOption[] = enumToSelectOptions(PublishStatus)

    const formConfig: FilterConfig[] = [
        { id: 'search', label: 'Find product name', type: 'text', placeholder: 'Type product name...' },
        { id: 'publish', label: 'Publish Status', type: 'select', options: publishStatus },
    ]

    const initialFilterState = useMemo(() => {
        const initialState: FilterValues = {}
        formConfig.forEach(filter => {
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
        if (!Products || isSearch) {
            fetchProducs()
        }
    }, [Products, isSearch])

    const fetchProducs = async () => {
        setLoading(true)
        setError(null)
        try {
            const { response, ApiResponse } = await PopulateTable('/api/products', currentFilters, currentPage, limit)
            if (response.ok && ApiResponse.success) {
                const data = ApiResponse.results.data

                setProducts(data as Products[])
                setTotalProducts(ApiResponse.results.total)
            } else {
                setError(ApiResponse.message || 'Failed to fetch products')
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
            <p className="text-xl font-semibold text-gray-700">Loading products...</p>
        </div>
    )
    if (error) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
    )

    const handleDelete = async () => {
        if (SelectedProduct) {
            try {
                const response = await fetch(`/api/products/${SelectedProduct}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                const data: APIResponse = await response.json()

                if (response.ok && data.success) {
                    fetchProducs()
                }
            } catch (error: any) {
                setError(error.message)
            } finally {
                setIsModalOpen(false)
                setSelectedProduct(null)
            }
        }
        return true
    }

    const handleConfirmDelete = (categoryId: ObjectId) => {
        setIsModalOpen(true)
        setSelectedProduct(categoryId)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedProduct(null)
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
                    href={`/dashboard/products/${value}`}
                    replace={true}
                >Edit
                </Link>
                <button className="text-red-600 hover:text-red-900" onClick={() => handleConfirmDelete(value)}>Delete</button>
            </>
        )
    }

    const pageProps: ContentProps = {
        title: 'Products Management',
        addButton: {
            href: '/dashboard/products/add',
            label: 'Add new products'
        },
        addFilter: {
            config: formConfig,
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
            title: 'Remove store'
        },
    }

    const TableColumn = [
        { name: 'Name', columnKey: 'name', translater: translateName },
        { name: 'SKU', columnKey: 'sku' },
        { name: 'Category', columnKey: 'category' },
        { name: 'Price', columnKey: 'price' },
        { name: 'Availability', columnKey: 'availability' },
        { name: 'Status', columnKey: 'status' },
        { name: 'Action', columnKey: '_id', translater: translateAction },
    ]
    return (
        <AdminContentWrapperComponent props={pageProps}>
            {/* Tabel products List */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">Registered Products</h2>
            {Products && Products.length === 0 ? (
                <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
                    <p>No products found. Click "Add New Products" to get started!</p>
                </div>
            ) : (
                <div className='shadow-md rounded-t-md border border-gray-200'>
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={TotalProducts}
                        itemsPerPage={limit}
                        onPageChange={handlePageChange}
                    />
                    <TableContentComponent column={TableColumn} data={Products} />
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={TotalProducts}
                        itemsPerPage={limit}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </AdminContentWrapperComponent>
    )
}