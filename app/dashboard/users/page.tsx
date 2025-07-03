// app/page.tsx
'use client' // Pastikan ini ada jika menggunakan React hooks dan interaktivitas

import { useState, useEffect, useCallback, useMemo } from 'react'
import { User, UserRoles } from '@/models/interfaces/users.interfaces' // Sesuaikan path jika berbeda
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { APIResponse, SelectOption } from '@/models/interfaces/global.interfaces'
import TableFilters, { FilterConfig, FilterValues } from '@/components/table/TableFilters'
import { enumToSelectOptions, sanitizeParams } from '@/helpers/objectHelpers'

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSearch, setIsSearch] = useState<boolean>(true)
  const [selectedUser, setSelectedUser] = useState<ObjectId>()
  const userRoleOptions: SelectOption[] = enumToSelectOptions(UserRoles)

  const userFiltersConfig: FilterConfig[] = [
    { id: 'search', label: 'Find Name/Email', type: 'text', placeholder: 'Type nama or email...' },
    { id: 'role', label: 'Role', type: 'select', options: userRoleOptions },
  ]

  const initialFilterState = useMemo(() => {
    const initialState: FilterValues = {}
    userFiltersConfig.forEach(filter => {
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
    if(!users || isSearch){
      fetchUsers()
    }
  }, [users, isSearch])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const queryString = new URLSearchParams(sanitizeParams(currentFilters)).toString()
      const response = await fetch(`/api/users?${queryString}`)
      const data = await response.json()
      if (response.ok && data.success) {
        setUsers(data.data as User[])
      } else {
        setError(data.message || 'Failed to fetch users')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsSearch(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p className="text-xl font-semibold text-gray-700">Loading users...</p>
    </div>
  )
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p className="text-xl font-semibold text-red-600">Error: {error}</p>
    </div>
  )

  const handleDelete = async() => {
    if(selectedUser){
      try{
        const response = await fetch(`/api/users/${selectedUser}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data: APIResponse = await response.json()

        console.log(`delete`, response)
        if (response.ok && data.success) {
          fetchUsers()
        }
      }catch(error: any){
        setError(error.message)
      }finally{
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">User Management Dashboard</h1>
        {/* Tombol Tambah User */}
        <div className='flex flex-col mb-6'>
          <div className="mb-6">
            <Link
              href="/dashboard/users/add"
              className="py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
            >
              ✨ Add New User
            </Link>
          </div>
          <div className='w-full flex flex-col'>
            <TableFilters
              filtersConfig={userFiltersConfig}
              onFilterChange={handleFilterChange}
              // debounceTime={500} // Anda bisa customize debounce time jika diperlukan
            />
            <div className='flex w-full gap-4 justify-end'>
              <button
                onClick={() => setIsSearch(true)}
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

        {/* Tabel User List */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">Registered Users</h2>
        {users && users.length === 0 ? (
          <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
            <p>No users found. Click "Add New User" to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  {/* Tambahkan kolom lain jika diperlukan, misal: <th ...>Actions</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users && users.map((user, key) => (
                  <tr key={`user_${key}`} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <Link 
                        className="text-indigo-600 hover:text-indigo-900 mr-4" 
                        href={`/dashboard/users/details/${user._id}`}
                        replace={true}
                      >Edit</Link>
                      <button className="text-red-600 hover:text-red-900" onClick={ () => handleConfirmDelete(user._id)}>Delete</button>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title='Remove user'
        confirmText='Yes, Remove!'
        cancelText='No'
      />
    </div>
  )
}