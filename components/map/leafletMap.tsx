// components/LocationMapForm.js
import * as L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

declare module "leaflet" {
  interface IconOptions {
    _getIconUrl?: string
  }
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

function MapInteractionLayer({
  currentPosition,
  setCurrentPosition,
  markerRef,
}) {
  useMapEvents({
    click(e) {
      setCurrentPosition(e.latlng)
    },
  })

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker != null) {
        setCurrentPosition(marker.getLatLng())
      }
    },
  }

  return currentPosition === null ? null : (
    <Marker
      position={currentPosition}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  )
}

function LocationMapForm({
  initialPosition,
  onLocationChange,
}: {
  initialPosition: {
    lat: number
    lng: number
  }
  onLocationChange: (value: unknown) => void
}) {
  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const markerRef = useRef(null)

  useEffect(() => {
    setCurrentPosition(initialPosition)
  }, [initialPosition])

  useEffect(() => {
    if (onLocationChange && currentPosition) {
      onLocationChange(currentPosition)
    }
  }, [currentPosition, onLocationChange])

  function MapEventHandlers() {
    useMapEvents({
      click(e) {
        onLocationChange(e.latlng)
      },
    })
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={currentPosition}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          key={JSON.stringify(currentPosition)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInteractionLayer
            currentPosition={currentPosition}
            setCurrentPosition={setCurrentPosition}
            markerRef={markerRef}
          />
          <MapEventHandlers />
        </MapContainer>
      </div>
    </div>
  )
}

export default LocationMapForm
