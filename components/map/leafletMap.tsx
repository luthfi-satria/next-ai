// components/LocationMapForm.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

declare module 'leaflet' {
    namespace Icon {
        interface Default {
            _getIconUrl?: string; // Declare the property as optional string
        }
    }
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapInteractionLayer({ currentPosition, setCurrentPosition, markerRef }) {
    // Handles map clicks
    useMapEvents({
        click(e) {
            setCurrentPosition(e.latlng)
        },
    });

    // Handles marker drag end
    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                setCurrentPosition(marker.getLatLng())
            }
        },
    };

    return currentPosition === null ? null : (
        <Marker
            position={currentPosition}
            draggable={true} // Make the marker draggable
            eventHandlers={eventHandlers}
            ref={markerRef}
        />
    );
}

function LocationMapForm({
    initialPosition,
    onLocationChange,
}: {
    initialPosition: any,
    onLocationChange: (value: any) => void,
}) {
    const [currentPosition, setCurrentPosition] = useState(initialPosition)
    const markerRef = useRef(null);

    useEffect(() => {
        if (onLocationChange && currentPosition) {
            onLocationChange(currentPosition)
        }
    }, [currentPosition, onLocationChange])

    useEffect(() => {
        if (initialPosition && (initialPosition.lat !== currentPosition.lat || initialPosition.lng !== currentPosition.lng)) {
            setCurrentPosition(initialPosition)
        }
    }, [initialPosition])

    function MapEventHandlers() {
        useMapEvents({
            click(e) {
                onLocationChange(e.latlng);
            },
        });
        return null;
    }

    const handleMarkerDragEnd = () => {
        const marker = markerRef.current;
        if (marker != null) {
            onLocationChange(marker.getLatLng());
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <div style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer
                    center={currentPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
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
    );
}

export default LocationMapForm;