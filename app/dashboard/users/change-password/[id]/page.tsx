'use client'
import NoDataFound from "@/components/DataNotFound"
import InputGenerator from "@/components/form/inputGenerator"
import { PUSHAPI } from "@/helpers/apiRequest"
import { changePassword, initChangePassword } from "@/models/interfaces/users.interfaces"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function EditUserPage() {
    const [UserPassword, setUserPassword] = useState<changePassword>(initChangePassword)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [responseMessage, setResponseMessage] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const { id } = useParams()
    const name = searchParams.get('name')

    if(!id ){
        setError(`Invalid user Id`)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setUserPassword((prev) => ({ ...prev, [name]: value }))
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        try {
            const { response, data } = await PUSHAPI('PUT', `/api/users/change-password/${id}`, JSON.stringify(UserPassword))
            if (response.ok && data.success) {
                setUserPassword({ ...UserPassword, ...data.data }) // Reset form
                setResponseMessage(data.message)
            } else {
                setError(data.message || 'Failed to change password user')
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
        if (error) {
            return (
                <div className="flex bg-red-50 mb-3 p-2">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            )
        }

        if (responseMessage) {
            return (
                <div className="flex bg-green-50 mb-3 p-2">
                    <p className="text-green-600">Success: {responseMessage}</p>
                </div>
            )
        }

        return (<></>)
    }

    const inputForm = [
        { type: 'password', name: 'oldPassword', placeholder: '*********', onChange: handleInputChange, required: true },
        { type: 'password', name: 'newPassword', placeholder: '*********', onChange: handleInputChange, required: true },
        { type: 'password', name: 'renewPassword', placeholder: '*********', onChange: handleInputChange, required: true },
    ]

    return (
        <>
            {/* Form Tambah User */}
            {UserPassword && !isLoading && (
                <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {handleResponse()}
                    <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
                        <Link className="w-[100px] p-4 border rounded-md text-center align-middle" href="/dashboard/users">Back</Link>
                        <h2 className="h-full text-xl sm:text-2xl font-bold p-2 flex-grow">Change {name} password</h2>
                    </div>
                    <form onSubmit={handleUpdateUser} className="space-y-4 w-1/2">
                        <InputGenerator props={inputForm} />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Update Password...' : 'Update Password'}
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

            {!UserPassword && (
                <NoDataFound handleGoBack={router.back} />
            )}
        </>
    )
}