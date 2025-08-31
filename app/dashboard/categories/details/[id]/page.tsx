"use client"
import NoDataFound from "@/components/DataNotFound"
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
import { ParamValue } from "next/dist/server/request/params"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function EditCategory() {
  const [Category, setCategory] = useState<CategoryType>(initCategory)
  const [parentOptions, setParentOptions] = useState([])
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<SeoSuggestions | null>(
    null,
  )
  const [aiScores, setAiScores] = useState<SeoScores | null>(null)

  const router = useRouter()

  const { id } = useParams()

  const handleGetCategory = useCallback(
    async (id: ParamValue) => {
      try {
        setIsLoading(true)
        const { response, ApiResponse } = await GETAPICALL(
          `/api/categories/${id}`,
        )
        if (response.ok && ApiResponse.success) {
          setCategory({ ...Category, ...ApiResponse.data })
        } else {
          setError(ApiResponse.message || "Failed to fetch Categories data")
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(`Error: `, error.message)
          setError(error.message)
        }
      } finally {
        setIsLoading(false)
        setIsFirstLoad(false)
      }
    },
    [Category],
  )

  useEffect(() => {
    if (id && isFirstLoad) {
      handleGetCategory(id)
      getParentCategory()
    }
  }, [id, isFirstLoad, handleGetCategory])

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setCategory((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const { response, data } = await PUSHAPI(
        "PUT",
        "/api/categories/",
        JSON.stringify(Category),
      )
      if (response.ok && data.success) {
        setCategory({ ...Category, ...data.data }) // Reset form
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

  const askSEOSuggestion = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const { response, data } = await PUSHAPI(
        "POST",
        "/api/categories/suggestions",
        JSON.stringify(Category),
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
      value: Category?.name || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      label: "Parent Category",
      name: "parentId",
      placeholder: "e.g., kids-fashion",
      value: Category?.parentId || "",
      options: parentOptions,
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "textarea",
      name: "description",
      placeholder: "add description, length min 100",
      value: Category?.description || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      label: "meta title",
      name: "meta_title",
      placeholder: "add meta title",
      value: Category?.meta_title || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "textarea",
      label: "meta description",
      name: "meta_description",
      placeholder: "",
      value: Category?.meta_description || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "textarea",
      label: "meta keywords",
      name: "meta_keywords",
      placeholder: "",
      value: Category?.meta_keywords || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      name: "publish",
      value: Category?.publish || PublishStatus.PUBLISHED,
      onChange: handleInputChange,
      required: true,
      options: enumToSelectOptions(PublishStatus),
    },
  ]

  return (
    <>
      {/* Form Tambah User */}
      {Category && !isLoading && (
        <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
          {handleResponse()}
          <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
            <Link
              className="w-[100px] p-4 border rounded-md text-center align-middle"
              href="/dashboard/categories"
            >
              Back
            </Link>
            <h2 className="h-full text-xl sm:text-2xl font-bold p-2 grow">
              Edit Category
            </h2>
          </div>
          <form onSubmit={handleUpdateCategory} className="space-y-4 w-3/4">
            <InputGenerator props={inputForm} />
            {aiSuggestions && (
              <ListComponent<SeoSuggestions>
                title="Suggestions"
                listObj={aiSuggestions}
              />
            )}
            {aiScores && (
              <ListComponent<SeoScores> title="SEO SCORES" listObj={aiScores} />
            )}
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
                {isSubmitting ? "Update Category..." : "Update Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-xl font-semibold text-gray-700">Loading data...</p>
        </div>
      )}

      {!Category && <NoDataFound handleGoBack={router.back} />}
    </>
  )
}
