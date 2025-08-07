"use client"
import InputGenerator from "@/components/form/inputGenerator"
import { PUSHAPI } from "@/helpers/apiRequest"
import { enumToSelectOptions } from "@/helpers/objectHelpers"
import { PublishStatus } from "@/models/interfaces/global.interfaces"
import { StoreType, initStore } from "@/models/interfaces/stores.interfaces"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useCallback, useState } from "react" // Import useCallback and useEffect

// Dynamic import for the map component
const DynamicMapComponent = dynamic(
  () => import("@/components/map/leafletMap"),
  { ssr: false },
)

export default function AddCategoryPage() {
  const [Store, setStore] = useState<StoreType>(initStore)
  const [position, setPosition] = useState({
    lat: initStore.location.coordinates[0],
    lng: initStore.location.coordinates[1],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target
      setStore((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

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

  const handleAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)
      try {
        const { response, data } = await PUSHAPI(
          "POST",
          "/api/stores",
          JSON.stringify(Store),
        )
        if (response.ok && data.success) {
          setStore({ ...initStore })
          setPosition({
            lat: initStore.location.coordinates[0],
            lng: initStore.location.coordinates[1],
          })
          setResponseMessage(data.message)
        } else {
          setError(data.message || "Failed to add store")
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
    },
    [Store],
  )

  const fetchLocation = () => {
    return `${position.lat.toFixed(6)} - ${position.lng.toFixed(6)}`
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
      <div className="w-1/2 sm:w-full md:w-3/4 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
          <Link
            className="w-[100px] p-4 border rounded-md text-center align-middle"
            href="/dashboard/stores"
          >
            Back
          </Link>
          <h2 className="h-full text-xl sm:text-2xl font-bold p-2 flex-grow">
            Add Store
          </h2>
        </div>
        {(isSubmitting || error || responseMessage) && handleResponse()}{" "}
        {/* Render hanya jika ada pesan */}
        <form onSubmit={handleAdd} className="space-y-4">
          <InputGenerator props={inputForm} />
          <DynamicMapComponent
            initialPosition={position}
            onLocationChange={handleLocationChangeFromMap}
          />
          <div></div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding Store..." : "Submit Store"}
          </button>
        </form>
      </div>
    </>
  )
}
