'use client'
import NoDataFound from "@/components/DataNotFound"
import { GETAPICALL, PUSHAPI } from "@/helpers/apiRequest"
import { PublishStatus } from "@/models/interfaces/global.interfaces"
import { StoreType, initStore } from "@/models/interfaces/stores.interfaces"
import { ParamValue } from "next/dist/server/request/params"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// Dynamic import for the map component
const DynamicMapComponent = dynamic(
    () => import('@/components/map/leafletMap'),
    { ssr: false }
);


export default function EditStore() {
    const [Store, setStore] = useState<StoreType>(initStore)
    const [position, setPosition] = useState({ lat: initStore.location.coordinates[0], lng: initStore.location.coordinates[1] });

    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [responseMessage, setResponseMessage] = useState<string | null>(null)
    const router = useRouter()

    const { id } = useParams()

    useEffect(() => {
        if (id) {
            handleGetStore(id)
        }
    }, [id])

    const handleGetStore = async (id: ParamValue) => {
        try {
            setIsLoading(true)
            const { response, ApiResponse } = await GETAPICALL(`/api/stores/${id}`)
            if (response.ok && ApiResponse.success) {
                setStore({ ...Store, ...ApiResponse.data })
                console.log(ApiResponse.data)
                setPosition({
                    lat: ApiResponse.data.location.coordinates[0],
                    lng: ApiResponse.data.location.coordinates[1]
                })
            } else {
                setError(ApiResponse.message || 'Failed to fetch stores data')
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setStore((prev) => ({ ...prev, [name]: value }))
    }

    const handleUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        try {
            const { response, data } = await PUSHAPI('PUT', '/api/stores/', JSON.stringify(Store))
            if (response.ok && data.success) {
                setStore({ ...Store, ...data.data }) // Reset form
                setResponseMessage(data.message)
            } else {
                setError(data.message || 'Failed to add stores')
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
        let message = ''
        let style = ''
        if (error) {
            message = `Error: ${error}`
            style = 'text-red-600 bg-red-300 border border-red-500'
        }

        if (responseMessage) {
            message = responseMessage
            style = 'text-green-600 bg-green-300 border border-green-500'
        }

        return (
            <div className={`h-auto flex bg-gray-50 p-2 mb-3 ${style}`}>
                <p className="text-md">{message}</p>
            </div>
        )
    }

    const handleLocationChangeFromMap = useCallback((newMapPosition: { lat: number; lng: number; }) => {
        setPosition(newMapPosition)
        setStore((prev) => ({
            ...prev,
            location: {
                type: 'point',
                coordinates: [newMapPosition.lat, newMapPosition.lng]
            }
        }));
    }, []);

    const fetchLocation = () => {
        return `${position?.lat?.toFixed(6)} - ${position?.lng?.toFixed(6)}`;
    }

    return (
        <>
            {/* Form Tambah User */}
            {Store && !isLoading && (
                <div className="w-1/2 sm:w-full md:w-3/4 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {handleResponse()}
                    <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
                        <Link className="w-[100px] p-4 border rounded-md text-center align-middle" href="/dashboard/stores">Back</Link>
                        <h2 className="h-full text-xl sm:text-2xl font-bold  p-2 flex-grow">Edit Store</h2>
                    </div>
                    <form onSubmit={handleUpdateStore} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="e.g., My Store name"
                                value={Store?.name || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="e.g., My Store city"
                                value={Store?.city || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                id="province"
                                name="province"
                                placeholder="e.g., My Store province"
                                value={Store?.province || ''}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                id="location"
                                name="location"
                                placeholder="e.g., Location"
                                value={fetchLocation()}
                                readOnly
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                        <DynamicMapComponent
                            initialPosition={position}
                            onLocationChange={handleLocationChangeFromMap}
                        />
                        <div>
                            <label htmlFor="publish" className="block text-sm font-medium text-gray-700 mb-1">
                                publish
                            </label>
                            <select
                                id="publish"
                                name="publish"
                                value={Store?.publish || PublishStatus.PUBLISHED}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            >
                                {Object.keys(PublishStatus).map((item, key) => (
                                    <option key={`roles-${item}`}>{item}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Update Store...' : 'Update Store'}
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

            {!Store && (
                <NoDataFound handleGoBack={router.back} />
            )}
        </>
    )
}