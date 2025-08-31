// app/page.tsx
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
import { catchError } from "@/helpers/responseHelper"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import {
  EnumUserStatus,
  User,
  UserRoles,
} from "@/models/interfaces/users.interfaces"
import { KeyIcon, PencilIcon, TrashIcon } from "@heroicons/react/outline"
import { ObjectId } from "mongodb"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSearch, setIsSearch] = useState<boolean>(true)
  const [selectedUser, setSelectedUser] = useState<ObjectId>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const limit = 10
  const userRoleOptions: SelectOption[] = enumToSelectOptions(UserRoles)
  const statusOptions: SelectOption[] = enumToSelectOptions(EnumUserStatus)

  const userFiltersConfig: FilterConfig[] = useMemo(() => {
    return [
      {
        id: "search",
        label: "Find",
        type: "text",
        placeholder: "Type nama or email or username...",
      },
      {
        id: "role",
        label: "Role",
        type: "autocomplete",
        placeholder: "Find role...",
        options: userRoleOptions,
      },
      {
        id: "status",
        label: "Status",
        type: "autocomplete",
        placeholder: "Find status",
        options: statusOptions,
      },
    ]
  }, [statusOptions, userRoleOptions])

  const initialFilterState = useMemo(() => {
    const initialState: FilterValues = {}
    userFiltersConfig.forEach((filter) => {
      initialState[filter.id] = ""
    })
    return initialState
  }, [userFiltersConfig])

  const [currentFilters, setCurrentFilters] =
    useState<FilterValues>(initialFilterState)

  const handleFilterChange = useCallback((filters: FilterValues) => {
    setCurrentFilters(filters)
  }, [])

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(initialFilterState)
    setIsSearch(true)
  }, [initialFilterState])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { response, ApiResponse } = await PopulateTable(
        "/api/users",
        currentFilters,
        currentPage,
        limit,
      )
      if (response.ok && ApiResponse.success) {
        const data = ApiResponse.results.data

        setUsers(data as User[])
        setTotalUsers(ApiResponse.results.total)
      } else {
        setError(ApiResponse.message || "Failed to fetch users")
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      console.log(errMsg)
      // setError(err.message)
    } finally {
      setLoading(false)
      setIsSearch(false)
    }
  }, [currentFilters, currentPage])

  useEffect(() => {
    if (!users || isSearch) {
      fetchUsers()
    }
  }, [users, isSearch, fetchUsers])

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-700">Loading users...</p>
      </div>
    )
  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
      </div>
    )

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        const { response, data } = await PUSHAPI(
          "DELETE",
          `/api/users/${selectedUser}`,
          "",
        )
        if (response.ok && data.success) {
          fetchUsers()
        }
      } catch (error: unknown) {
        const errMsg = catchError(error)
        setError(errMsg)
      } finally {
        setIsModalOpen(false)
        setSelectedUser(null)
      }
    }
    return true
  }

  const handleConfirmDelete = (userId: ObjectId) => {
    setIsModalOpen(true)
    setSelectedUser(userId)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handlePageChange = (page: number) => {
    setIsSearch(true)
    setCurrentPage(page)
  }

  const handleSearch = () => {
    setIsSearch(true)
  }

  const pageProps: ContentProps = {
    title: "Users Management",
    addButton: {
      href: "/dashboard/users/add",
      label: "Add new users",
    },
    addFilter: {
      config: userFiltersConfig,
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
      title: "Remove user",
    },
  }

  const translateAction = (
    value: ObjectId,
    rowData: Record<string, unknown>,
  ) => {
    return (
      <div className="flex gap-2">
        <Link
          className="text-gray-600 hover:text-gray-900 text-sm mr-4"
          href={`/dashboard/users/details/${value}`}
          replace={true}
          title="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>

        <Link
          className="text-yellow-600 hover:text-yellow-900 text-sm mr-4"
          href={`/dashboard/users/change-password/${value}?name=${rowData.name}`}
          replace={true}
          title="Change password"
        >
          <KeyIcon className="h-4 w-4" />
        </Link>

        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => handleConfirmDelete(value)}
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const TableColumn = [
    { name: "Name", columnKey: "name", translater: translateName },
    { name: "Email", columnKey: "email" },
    { name: "Role", columnKey: "roles" },
    { name: "Action", columnKey: "_id", translater: translateAction },
  ]

  return (
    <AdminContentWrapperComponent props={pageProps}>
      <div>
        {/* Tabel User List */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">
          Registered Users
        </h2>
        {users && users.length === 0 ? (
          <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
            <p>{`No users found. Click "Add New User" to get started!`}</p>
          </div>
        ) : (
          <div className="shadow-md rounded-t-md border border-gray-200">
            <TablePagination
              currentPage={currentPage}
              totalItems={totalUsers}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
            <TableContentComponent column={TableColumn} data={users} />
            <TablePagination
              currentPage={currentPage}
              totalItems={totalUsers}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AdminContentWrapperComponent>
  )
}
