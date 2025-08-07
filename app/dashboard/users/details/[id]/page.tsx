"use client"
import NoDataFound from "@/components/DataNotFound"
import InputGenerator from "@/components/form/inputGenerator"
import { GETAPICALL, PUSHAPI } from "@/helpers/apiRequest"
import { enumToSelectOptions } from "@/helpers/objectHelpers"
import { catchError } from "@/helpers/responseHelper"
import {
  editUser,
  EnumUserStatus,
  initEditUser,
  UserRoles,
} from "@/models/interfaces/users.interfaces"
import { ParamValue } from "next/dist/server/request/params"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function EditUserPage() {
  const [newUser, setNewUser] = useState<editUser>(initEditUser)
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)
  const router = useRouter()

  const { id } = useParams()

  const handleGetUser = useCallback(
    async (id: ParamValue) => {
      try {
        setIsLoading(true)
        const { response, ApiResponse } = await GETAPICALL(`/api/users/${id}`)
        if (response.ok && ApiResponse.success) {
          setNewUser({ ...newUser, ...ApiResponse.data })
        } else {
          setError(ApiResponse.message || "Failed to fetch User data")
        }
      } catch (error: unknown) {
        const errMsg = catchError(error)
        setError(errMsg)
      } finally {
        setIsLoading(false)
        setIsFirstLoad(false)
      }
    },
    [newUser],
  )

  useEffect(() => {
    if (id && isFirstLoad) {
      handleGetUser(id)
    }
  }, [id, isFirstLoad, handleGetUser])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const { response, data } = await PUSHAPI(
        "PUT",
        "/api/users/",
        JSON.stringify(newUser),
      )
      if (response.ok && data.success) {
        setNewUser({ ...newUser, ...data.data }) // Reset form
        setResponseMessage(data.message)
      } else {
        setError(data.message || "Failed to add user")
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      setError(errMsg)
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setResponseMessage("")
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

    return <></>
  }

  const inputForm = [
    {
      type: "text",
      name: "name",
      placeholder: "e.g., Jane Doe",
      value: newUser?.name || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      name: "username",
      placeholder: "e.g., JaneDoe",
      value: newUser?.username || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      name: "email",
      placeholder: "e.g., jane.doe@example.com",
      value: newUser?.email || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      label: "Roles",
      name: "roles",
      value: newUser?.roles || UserRoles.CUSTOMER,
      options: enumToSelectOptions(UserRoles),
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      name: "status",
      value: newUser?.status || EnumUserStatus.ACTIVE,
      onChange: handleInputChange,
      required: true,
      options: enumToSelectOptions(EnumUserStatus),
    },
  ]

  return (
    <>
      {/* Form Tambah User */}
      {newUser && !isLoading && (
        <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
          {handleResponse()}
          <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
            <Link
              className="w-[100px] p-4 border rounded-md text-center align-middle"
              href="/dashboard/users"
            >
              Back
            </Link>
            <h2 className="h-full text-xl sm:text-2xl font-bold p-2 flex-grow">
              Edit User
            </h2>
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4 w-1/2">
            <InputGenerator props={inputForm} />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Update User..." : "Update User"}
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-xl font-semibold text-gray-700">Loading data...</p>
        </div>
      )}

      {!newUser && <NoDataFound handleGoBack={router.back} />}
    </>
  )
}
