"use client"
import InputGenerator from "@/components/form/inputGenerator"
import ListComponent from "@/components/list/ListComponent"
import { BUTTON_DEFAULT, BUTTON_SUBMIT } from "@/constants/formStyleConstant"
import { GETAPICALL, PUSHAPI } from "@/helpers/apiRequest"
import {
  convertObjectToSelectOptions,
  enumToSelectOptions,
} from "@/helpers/objectHelpers"
import {
  CategoryType,
  initCategory,
  SeoScores,
  SeoSuggestions,
} from "@/models/interfaces/category.interfaces"
import { PublishStatus } from "@/models/interfaces/global.interfaces"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AddCategoryPage() {
  const [category, setCategory] = useState<CategoryType>(initCategory)
  const [parentOptions, setParentOptions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<SeoSuggestions | null>(
    null,
  )
  const [aiScores, setAiScores] = useState<SeoScores | null>(null)

  const getParentCategory = async () => {
    const { response, ApiResponse } = await GETAPICALL(
      `/api/categories?level=0`,
    )

    if (response && ApiResponse.results) {
      const optionsData = convertObjectToSelectOptions(
        ApiResponse.results.data,
        {
          valueKey: "_id",
          labelKey: "name",
          defaultValue: "",
        },
      )
      setParentOptions(optionsData)
    }
  }

  useEffect(() => {
    getParentCategory()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setCategory((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const { response, data } = await PUSHAPI(
        "POST",
        "/api/categories",
        JSON.stringify(category),
      )
      if (response.ok && data.success) {
        setCategory({ ...category, ...initCategory }) // Reset form
        setResponseMessage(data.message)
      } else {
        setError(data.message || "Failed to add category")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error: `, err.message)
        setError(err.message)
      }
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setResponseMessage("")
        setAiSuggestions(null)
        setAiScores(null)
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

  const askSEOSuggestion = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const { response, data } = await PUSHAPI(
        "POST",
        "/api/categories/suggestions",
        JSON.stringify(category),
      )
      if (response.ok && data.success) {
        const { suggestions, scores } = data.data
        setAiSuggestions(suggestions)
        setAiScores(scores)
        console.log(data)
        setResponseMessage(data.message)
      } else {
        setError(data.message || "Failed to add suggestions")
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(`Error: `, err.message)
        setError(err.message)
      }
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setResponseMessage("")
      }, 5000)
    }
  }
  const inputForm = [
    {
      type: "text",
      name: "name",
      placeholder: "e.g., Kids Fashion",
      value: category?.name || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      label: "Parent Category",
      name: "parentId",
      placeholder: "e.g., kids-fashion",
      value: category?.parentId || "",
      options: parentOptions,
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "textarea",
      name: "description",
      placeholder: "add description, length min 100",
      value: category?.description || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      label: "meta title",
      name: "meta_title",
      placeholder: "add meta title",
      value: category?.meta_title || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "textarea",
      label: "meta description",
      name: "meta_description",
      placeholder: "",
      value: category?.meta_description || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "textarea",
      label: "meta keywords",
      name: "meta_keywords",
      placeholder: "",
      value: category?.meta_keywords || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      name: "publish",
      value: category?.publish || PublishStatus.PUBLISHED,
      onChange: handleInputChange,
      required: true,
      options: enumToSelectOptions(PublishStatus),
    },
  ]

  return (
    <>
      {/* Form Tambah Category */}
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
          <Link
            className="w-[100px] p-4 border rounded-md text-center align-middle"
            href="/dashboard/categories"
          >
            Back
          </Link>
          <h2 className="h-full text-xl sm:text-2xl font-bold p-2 grow">
            Add Category
          </h2>
        </div>
        {isSubmitting && handleResponse()}
        <form onSubmit={handleAdd} className="space-y-4 w-3/4">
          <InputGenerator props={inputForm} />
          {aiSuggestions && (
            <ListComponent title="Suggestions" listObj={aiSuggestions} />
          )}
          {aiScores && <ListComponent title="SEO SCORES" listObj={aiScores} />}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              className={BUTTON_DEFAULT}
              onClick={askSEOSuggestion}
            >
              AI Suggestions
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={BUTTON_SUBMIT}
            >
              {isSubmitting ? "Adding Category..." : "Submit Category"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
