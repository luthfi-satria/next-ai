'use client'
import { APIResponse, PublishStatus } from "@/models/interfaces/global.interfaces"
import { StoreType, initStore } from "@/models/interfaces/stores.interfaces"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useCallback, useState } from "react"; // Import useCallback and useEffect

// Dynamic import for the map component
const DynamicMapComponent = dynamic(
    () => import('@/components/map/leafletMap'),
    { ssr: false }
);

export default function AddCategoryPage() {
    const [store, setStore] = useState<StoreType>(initStore)
    const [position, setPosition] = useState({ lat: initStore.location.lat, lng: initStore.location.lon });

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [responseMessage, setResponseMessage] = useState<string | null>(null)

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setStore((prev) => ({ ...prev, [name]: value }))
    }, [])

    const handleLocationChangeFromMap = useCallback((newMapPosition: { lat: number; lng: number; }) => {
        setPosition(newMapPosition)
        setStore((prev) => ({
            ...prev,
            location: {
                lat: newMapPosition.lat,
                lon: newMapPosition.lng
            }
        }));
    }, []);

    const handleAdd = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        try {
            // Pastikan `store.location` sudah terupdate dari peta
            const response = await fetch('/api/stores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(store),
            })
            const data: APIResponse = await response.json()

            if (response.ok && data.success) {
                // Reset form, termasuk posisi peta ke default initStore
                setStore({ ...initStore });
                setPosition({ lat: initStore.location.lat, lng: initStore.location.lon });
                setResponseMessage(data.message)
            } else {
                setError(data.message || 'Failed to add store')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setTimeout(() => {
                setIsSubmitting(false)
                setResponseMessage('')
            }, 5000)
        }
    }, [store])

    const fetchLocation = () => {
        return `${position.lat.toFixed(6)} - ${position.lng.toFixed(6)}`;
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

    return (
        <>
            <div className="w-1/2 sm:w-full md:w-3/4 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                <div className="flex flex-row gap-2 justify-stretch mb-4">
                    <Link className="w-[100px] p-4 border rounded-md text-center align-middle" href="/dashboard/stores">Back</Link>
                    <h2 className="h-full text-xl sm:text-2xl font-bold text-gray-800 p-2 flex-grow">Add Store</h2>
                </div>
                {(isSubmitting || error || responseMessage) && handleResponse()} {/* Render hanya jika ada pesan */}
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g., My Store name"
                            value={store?.name || ''}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="e.g., My Store address"
                            value={store?.address || ''}
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
                            value={store?.city || ''}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                            Province
                        </label>
                        <input
                            type="text"
                            id="province"
                            name="province"
                            placeholder="e.g., My Store province"
                            value={store?.province || ''}
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
                            Publish
                        </label>
                        <select
                            id="publish"
                            name="publish"
                            value={store?.publish || PublishStatus.PUBLISHED}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        >
                            {Object.keys(PublishStatus).map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Adding Store...' : 'Submit Store'}
                    </button>
                </form>
            </div>
        </>
    )
}