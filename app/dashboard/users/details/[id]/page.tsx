'use client'
import NoDataFound from "@/components/DataNotFound"
import { APIResponse } from "@/models/interfaces/global.interfaces"
import { initUser, NewUser, UserRoles } from "@/models/interfaces/users.interfaces"
import { ParamValue } from "next/dist/server/request/params"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditUserPage(){
    const [newUser, setNewUser] = useState<NewUser>(initUser)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [responseMessage, setResponseMessage] = useState<string | null>(null)
    const router = useRouter()

    const { id } = useParams()
    
    useEffect(() => {
        if(id){
            handleGetUser(id)
        }
    }, [id])

    const handleGetUser = async(id: ParamValue) => {
        try{
            setIsLoading(true)
            const response = await fetch(`/api/users/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data: APIResponse = await response.json()
            if(response.ok && data.success){
                setNewUser({...newUser, ...data.data})
            } else{
                setError(data.message || 'Failed to fetch User data')
            }
        }catch(error: any){
            setError(error.message)
        }finally{
            setIsLoading(false)
        }
    }

    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setNewUser((prev) => ({ ...prev, [name]: value }))
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        try {
            const response = await fetch(`/api/users/`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            })
            const data: APIResponse = await response.json()
            if (response.ok && data.success) {
                setNewUser({...newUser, ...initUser}) // Reset form
                setResponseMessage(data.message)
            } else {
                setError(data.message || 'Failed to add user')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setTimeout(() => {
                setIsSubmitting(false)
                setResponseMessage('')
            }, 1000)
        }
    }

    const handleResponse = () => {
        if(error){
            return (
                <div className="flex bg-red-50 mb-3 p-2">
                    <p className="text-red-600">Error: {error}</p>
                </div>            
            )
        }
        
        if(responseMessage){
            return (
                <div className="flex bg-green-50 mb-3 p-2">
                    <p className="text-green-600">Success: {responseMessage}</p>
                </div>            
            )            
        }

        return (<></>)
    }

    return (
        <>
            {/* Form Tambah User */}
            {newUser && !isLoading && (
                <div className="w-1/2 m-2 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {handleResponse()}
                    <div className="flex flex-row gap-2 justify-stretch mb-4">
                        <Link className="w-[100px] p-4 border rounded-md text-center align-middle" href="/dashboard/users">Back</Link>
                        <h2 className="h-full text-xl sm:text-2xl font-bold text-gray-800 p-2 flex-grow">Edit User</h2>
                    </div>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                        </label>
                        <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="e.g., Jane Doe"
                        value={newUser?.name || ''}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                        </label>
                        <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="e.g., jane.doe@example.com"
                        value={newUser?.email || ''}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-1">
                        Roles
                        </label>
                        <select
                        id="roles"
                        name="roles"
                        defaultValue={newUser?.roles || UserRoles.CUSTOMER}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        >
                            {Object.keys(UserRoles).map((item, key) => (
                                <option key={`roles-${item}`}>{item}</option>
                            ))}
                        </select>
                    </div>                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Update User...' : 'Update User'}
                    </button>
                    </form>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-slow"></div>
                    <p className="text-gray-700 text-lg font-semibold">Loading...</p>
                </div>
            )}

            {!newUser && (
                <NoDataFound handleGoBack={router.back}/>
            )}
        </>
    )
}