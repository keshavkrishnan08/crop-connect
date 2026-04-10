"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

// Types for the component
interface MapLocationPickerProps {
    value: string;
    onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
    placeholder?: string;
}

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

// Dynamic import of map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-gray-500">Loading map...</p>
            </div>
        </div>
    ),
});

export default function MapLocationPicker({ value, onChange, placeholder }: MapLocationPickerProps) {
    const [searchQuery, setSearchQuery] = useState(value);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [mapMode, setMapMode] = useState<"view" | "adjust">("view");
    const [error, setError] = useState<string | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update search query when value prop changes
    useEffect(() => {
        setSearchQuery(value);
    }, [value]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search for locations using Nominatim API (OpenStreetMap)
    const searchLocations = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchLocations(query);
        }, 300);
    };

    // Handle selecting a search result
    const handleSelectResult = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setCoordinates({ lat, lng });
        setSearchQuery(result.display_name);
        onChange(result.display_name, { lat, lng });
        setShowResults(false);
        setMapMode("view");
    };

    // Handle map click — always set location on click
    const handleMapClick = async (lat: number, lng: number) => {
        setCoordinates({ lat, lng });
        setMapMode("view");

        // Reverse geocode to get address
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );
            const data = await response.json();
            if (data.display_name) {
                setSearchQuery(data.display_name);
                onChange(data.display_name, { lat, lng });
            }
        } catch (error) {
            // Still update coordinates even if reverse geocoding fails
            const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setSearchQuery(coordString);
            onChange(coordString, { lat, lng });
        }
    };

    // Use current location
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCoordinates({ lat, lng });

                // Reverse geocode
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                        {
                            headers: {
                                "Accept-Language": "en",
                            },
                        }
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setSearchQuery(data.display_name);
                        onChange(data.display_name, { lat, lng });
                    }
                } catch (error) {
                    const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setSearchQuery(coordString);
                    onChange(coordString, { lat, lng });
                }
            },
            (error) => {
                setError("Unable to get your location. Please enter it manually.");
            }
        );
    };

    return (
        <div className="flex flex-col gap-4" ref={containerRef}>
            {error && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                    <span className="material-symbols-outlined !text-[18px]">error</span>
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto">
                        <span className="material-symbols-outlined !text-[16px]">close</span>
                    </button>
                </div>
            )}
            {/* Search Input */}
            <div className="flex flex-col w-full gap-2">
                <p className="text-[#131811] dark:text-gray-200 text-xs font-black uppercase tracking-widest ml-1">
                    Farm Location
                </p>
                <div className="relative">
                    <div className="relative group">
                        <input
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => searchQuery.length >= 3 && setShowResults(true)}
                            className="w-full rounded-xl text-[#131811] dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 h-11 pl-4 pr-24 text-sm transition-all outline-none font-bold shadow-inner-soft"
                            placeholder={placeholder || "Search for your farm address..."}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isSearching ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleUseCurrentLocation}
                                    className="p-1.5 rounded-lg bg-white dark:bg-[#1a2c15] shadow-sm border border-gray-100 dark:border-white/10 hover:border-primary hover:text-primary transition-colors"
                                    title="Use current location"
                                >
                                    <span className="material-symbols-outlined text-lg">my_location</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a2c15] rounded-xl shadow-premium border border-gray-100 dark:border-white/10 overflow-hidden z-50 max-h-60 overflow-y-auto">
                            {searchResults.map((result) => (
                                <button
                                    key={result.place_id}
                                    type="button"
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-start gap-2 border-b border-gray-100 dark:border-white/5 last:border-0"
                                >
                                    <span className="material-symbols-outlined text-primary !text-[18px] mt-0.5 shrink-0">location_on</span>
                                    <span className="text-xs text-[#131811] dark:text-white font-medium line-clamp-2">
                                        {result.display_name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-52 rounded-xl overflow-hidden relative border border-gray-200 dark:border-white/10 shadow-premium">
                <MapComponent
                    coordinates={coordinates}
                    onMapClick={handleMapClick}
                    isAdjustMode={mapMode === "adjust"}
                />

                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setMapMode(mapMode === "adjust" ? "view" : "adjust")}
                        className={`text-[10px] font-black px-3 py-2 rounded-lg shadow-premium transition-all flex items-center gap-1.5 border ${
                            mapMode === "adjust"
                                ? "bg-primary text-white border-primary hover:bg-primary-dark"
                                : "bg-white dark:bg-[#1a2c15] text-[#131811] dark:text-white border-gray-100 dark:border-white/10 hover:border-primary hover:text-primary"
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {mapMode === "adjust" ? "check" : "edit_location"}
                        </span>
                        {mapMode === "adjust" ? "Done" : "Adjust Pin"}
                    </button>
                </div>

                {/* Adjust mode indicator */}
                {mapMode === "adjust" && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-pulse">
                        Click on the map to set your location
                    </div>
                )}
            </div>

            {/* Coordinates display (optional) */}
            {coordinates && (
                <p className="text-xs text-gray-400 ml-2">
                    Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
            )}
        </div>
    );
}
