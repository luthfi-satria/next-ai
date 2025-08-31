"use client"
import InputGenerator from "@/components/form/inputGenerator"
import { PUSHAPI } from "@/helpers/apiRequest"
import { enumToSelectOptions } from "@/helpers/objectHelpers"
import { catchError } from "@/helpers/responseHelper"
import {
  EnumUserStatus,
  initUser,
  NewUser,
  UserRoles,
} from "@/models/interfaces/users.interfaces"
import Link from "next/link"
import { useState } from "react"

export default function AddUserPage() {
  const [newUser, setNewUser] = useState<NewUser>(initUser)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldsError, setFieldsError] = useState<string[]>([])
  const [responseMessage, setResponseMessage] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = async (): Promise<boolean> => {
    if (newUser.password !== newUser.repassword) {
      setError(`password and re password doesn't match`)
      setFieldsError([...fieldsError, "password", "repassword"])
      return false
    }
    setFieldsError([])
    setError("")
    return true
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const validateUserForm = await validateForm()
      if (validateUserForm) {
        const { response, data } = await PUSHAPI(
          "POST",
          "/api/users",
          JSON.stringify(newUser),
        )
        if (response.ok && data.success) {
          setNewUser({ ...newUser, ...initUser }) // Reset form
          setResponseMessage(data.message)
        } else {
          setError(data.message || "Failed to add user")
        }
      }
    } catch (err: unknown) {
      const errMsg = catchError(err)
      setError(errMsg)
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setResponseMessage("")
      }, 5000)
    }
  }

  const handleResponse = () => {
    let message = ""
    let style = ""
    if (error) {
      message = `Error: ${error}`
      style = "text-red-600 bg-red-300 border border-red-500"
    }

    if (responseMessage) {
      message = responseMessage
      style = "text-green-600 bg-green-300 border border-green-500"
    }

    return (
      <div className={`h-auto flex bg-gray-50 p-2 mb-3 ${style}`}>
        <p className="text-md">{message}</p>
      </div>
    )
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
    {
      type: "password",
      name: "password",
      placeholder: "********",
      value: newUser?.password || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "password",
      name: "repassword",
      placeholder: "********",
      value: newUser?.repassword || "",
      onChange: handleInputChange,
      required: true,
    },
  ]

  return (
    <>
      {/* Form Tambah User */}
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
          <Link
            className="w-[100px] p-4 border rounded-md text-center align-middle"
            href="/dashboard/users"
          >
            Back
          </Link>
          <h2 className="h-full text-xl sm:text-2xl font-bold p-2 grow">
            Add New User
          </h2>
        </div>
        {isSubmitting && handleResponse()}
        <form onSubmit={handleAddUser} className="space-y-4 w-1/2">
          <InputGenerator props={inputForm} fieldsError={fieldsError} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding User..." : "Submit User"}
          </button>
        </form>
      </div>
    </>
  )
}
