"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
    coordinates: { lat: number; lng: number } | null;
    onMapClick: (lat: number, lng: number) => void;
    isAdjustMode: boolean;
}

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Custom green marker for farm location
const farmIcon = L.divIcon({
    className: "custom-farm-marker",
    html: `
        <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 18px;
                font-family: 'Material Symbols Outlined';
            ">agriculture</span>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

export default function MapComponent({ coordinates, onMapClick, isAdjustMode }: MapComponentProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Default center (US center) with a zoomed out view
        const defaultCenter: [number, number] = [39.8283, -98.5795];
        const defaultZoom = 4; // Zoomed out to see more area

        mapRef.current = L.map(containerRef.current, {
            center: coordinates ? [coordinates.lat, coordinates.lng] : defaultCenter,
            zoom: coordinates ? 13 : defaultZoom,
            zoomControl: true,
            attributionControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(mapRef.current);

        // Add initial marker if coordinates exist
        if (coordinates) {
            markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
                icon: defaultIcon,
                draggable: false,
            }).addTo(mapRef.current);
        }

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Handle coordinates changes
    useEffect(() => {
        if (!mapRef.current) return;

        if (coordinates) {
            // Update or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
            } else {
                markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
                    icon: defaultIcon,
                    draggable: false,
                }).addTo(mapRef.current);
            }

            // Pan to new location
            mapRef.current.setView([coordinates.lat, coordinates.lng], 13, {
                animate: true,
                duration: 0.5,
            });
        }
    }, [coordinates]);

    // Handle click events — always allow map clicks to set location
    useEffect(() => {
        if (!mapRef.current) return;

        const handleClick = (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        };

        mapRef.current.on("click", handleClick);

        // Update cursor style
        if (containerRef.current) {
            containerRef.current.style.cursor = "crosshair";
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.off("click", handleClick);
            }
        };
    }, [onMapClick]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ minHeight: "100%" }}
        />
    );
}
