"use client"
import NoDataFound from "@/components/DataNotFound"
import InputGenerator from "@/components/form/inputGenerator"
import { GETAPICALL, PUSHAPI } from "@/helpers/apiRequest"
import { enumToSelectOptions } from "@/helpers/objectHelpers"
import { PublishStatus } from "@/models/interfaces/global.interfaces"
import { StoreType, initStore } from "@/models/interfaces/stores.interfaces"
import { ParamValue } from "next/dist/server/request/params"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// Dynamic import for the map component
const DynamicMapComponent = dynamic(
  () => import("@/components/map/leafletMap"),
  { ssr: false },
)

export default function EditStore() {
  const [Store, setStore] = useState<StoreType>(initStore)
  const [position, setPosition] = useState({
    lat: initStore.location.coordinates[0],
    lng: initStore.location.coordinates[1],
  })
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)
  const router = useRouter()

  const { id } = useParams()

  const handleGetStore = useCallback(
    async (id: ParamValue) => {
      try {
        setIsLoading(true)
        const { response, ApiResponse } = await GETAPICALL(`/api/stores/${id}`)
        if (response.ok && ApiResponse.success) {
          setStore({ ...Store, ...ApiResponse.data })
          setPosition({
            lat: ApiResponse.data.location.coordinates[0],
            lng: ApiResponse.data.location.coordinates[1],
          })
        } else {
          setError(ApiResponse.message || "Failed to fetch stores data")
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
    [Store],
  )

  useEffect(() => {
    if (id && isFirstLoad) {
      handleGetStore(id)
    }
  }, [id, isFirstLoad, handleGetStore])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setStore((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const { response, data } = await PUSHAPI(
        "PUT",
        "/api/stores/",
        JSON.stringify(Store),
      )
      if (response.ok && data.success) {
        setStore({ ...Store, ...data.data }) // Reset form
        setResponseMessage(data.message)
      } else {
        setError(data.message || "Failed to add stores")
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
      }, 1000)
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

  const handleLocationChangeFromMap = useCallback(
    (newMapPosition: { lat: number; lng: number }) => {
      setPosition(newMapPosition)
      setStore((prev) => ({
        ...prev,
        location: {
          type: "point",
          coordinates: [newMapPosition.lat, newMapPosition.lng],
        },
      }))
    },
    [],
  )

  const fetchLocation = () => {
    return `${position?.lat?.toFixed(6)} - ${position?.lng?.toFixed(6)}`
  }

  const inputForm = [
    {
      type: "text",
      name: "name",
      placeholder: "e.g., My Store",
      value: Store?.name || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      name: "address",
      placeholder: "e.g., Your store location address",
      value: Store?.address || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      name: "city",
      placeholder: "e.g., Jakarta",
      value: Store?.city || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      name: "province",
      placeholder: "e.g. Jakarta",
      value: Store?.province || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "select",
      name: "publish",
      value: Store?.publish || PublishStatus.PUBLISHED,
      onChange: handleInputChange,
      required: true,
      options: enumToSelectOptions(PublishStatus),
    },
    {
      type: "text",
      name: "location",
      value: fetchLocation(),
      onChange: handleInputChange,
      required: true,
    },
  ]

  return (
    <>
      {/* Form Tambah User */}
      {Store && !isLoading && (
        <div className="w-1/2 sm:w-full md:w-3/4 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
          {handleResponse()}
          <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
            <Link
              className="w-[100px] p-4 border rounded-md text-center align-middle"
              href="/dashboard/stores"
            >
              Back
            </Link>
            <h2 className="h-full text-xl sm:text-2xl font-bold  p-2 flex-grow">
              Edit Store
            </h2>
          </div>
          <form onSubmit={handleUpdateStore} className="space-y-4">
            <InputGenerator props={inputForm} />
            <DynamicMapComponent
              initialPosition={position}
              onLocationChange={handleLocationChangeFromMap}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Update Store..." : "Update Store"}
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <p className="text-xl font-semibold text-gray-700">Loading data...</p>
        </div>
      )}

      {!Store && <NoDataFound handleGoBack={router.back} />}
    </>
  )
}
