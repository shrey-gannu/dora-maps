import React, { useState, useEffect, useRef } from 'react';
import { GoogleMapsIcon } from '../icons/GuideIcons';
import { GoogleGenAI } from "@google/genai";

export interface LocationData {
    name: string;
    lat: number;
    lng: number;
    address?: string;
}

interface LocationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: LocationData) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    // Form States
    const [customTitle, setCustomTitle] = useState('');
    const [addressQuery, setAddressQuery] = useState('');
    
    // Search & Selection States
    const [results, setResults] = useState<LocationData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const debounceTimeoutRef = useRef<number | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Reset on Open
    useEffect(() => {
        if (isOpen) {
            setCustomTitle('');
            setAddressQuery('');
            setResults([]);
            setSelectedLocation(null);
            setIsSearching(false);
            // Focus title first
            setTimeout(() => titleInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Search Logic using Gemini 2.5 with Google Maps Tool
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // If we have selected a location and the query matches it, don't search again
        if (selectedLocation && addressQuery === selectedLocation.address) {
            return;
        }

        if (!addressQuery.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsLoading(true);
        setIsSearching(true);
        
        // Debounce set to 600ms to allow typing to finish before hitting the AI/Maps API
        debounceTimeoutRef.current = window.setTimeout(async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                // We ask Gemini to use the Google Maps tool to find the places
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Find 5 distinct real-world places that match the query: "${addressQuery}". 
                    Use the Google Maps tool to find the exact business or address.
                    Return ONLY a raw JSON array of objects (no markdown formatting).
                    Each object must have these exact keys: "name", "address", "lat", "lng".
                    
                    Example: [{"name": "Spacetime Coworking", "address": "Sector 45, Gurgaon", "lat": 28.123, "lng": 77.123}]`,
                    config: {
                        tools: [{googleMaps: {}}],
                        // Note: responseMimeType: 'application/json' is NOT allowed with googleMaps tool, 
                        // so we parse the text manually.
                    }
                });

                const text = response.text || "";
                
                // Robustly extract JSON from the response (in case of extra conversational text)
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    
                    // Validate and map the data
                    const places: LocationData[] = parsedData.map((item: any) => ({
                        name: item.name,
                        address: item.address,
                        lat: Number(item.lat),
                        lng: Number(item.lng)
                    }));
                    
                    setResults(places);
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 600);

        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, [addressQuery]);

    const handleSelectResult = (loc: LocationData) => {
        setSelectedLocation(loc);
        setAddressQuery(loc.address || '');
        // Auto-fill custom title if empty, but let user override
        if (!customTitle.trim()) {
           // If the location name is essentially the address, don't set it as title
           // But if it's a specific place name (like "Spacetime Coworking"), set it
           setCustomTitle(loc.name);
        }
        setIsSearching(false); // Hide the dropdown
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onSelect({
                ...selectedLocation,
                // Ensure we use the user's custom title if provided, otherwise the place name
                name: customTitle || selectedLocation.name || "Pinned Location"
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200 font-['Inter']">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 relative z-10">
                
                {/* 1. Map Area (Top Half) */}
                <div className="relative h-[45%] bg-gray-100 border-b border-gray-200">
                    {selectedLocation ? (
                        <div className="w-full h-full relative">
                             <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=16&output=embed`}
                                className="w-full h-full opacity-100 transition-opacity"
                                title="Location Preview"
                            ></iframe>
                            {/* Visual Overlay to make it feel like a "Pin" selection */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none pb-8">
                                <div className="text-4xl drop-shadow-md filter">📍</div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 pattern-grid-lg">
                            <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-gray-100">
                                <GoogleMapsIcon className="w-8 h-8 opacity-80" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Search to locate on map</span>
                        </div>
                    )}
                    
                    {/* Close Button overlay */}
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm p-2 rounded-full hover:bg-white transition-colors z-10"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* 2. Form Area (Bottom Half) */}
                <div className="flex-1 flex flex-col p-6 bg-white relative">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Add New Place</h2>

                    <div className="space-y-6">
                        {/* Custom Title Input */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Custom Title</label>
                            <input 
                                ref={titleInputRef}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-400"
                                placeholder="e.g. My Favorite Co-working"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                            />
                        </div>

                        {/* Address Search Input */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Address Search</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-400"
                                    placeholder="Search 'Spacetime Coworking'..."
                                    value={addressQuery}
                                    onChange={(e) => {
                                        setAddressQuery(e.target.value);
                                        // If user types, we assume they are searching again, so invalidate selection until they pick
                                        if (selectedLocation) setSelectedLocation(null); 
                                    }}
                                />
                                {isLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {isSearching && results.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[220px] overflow-y-auto z-50 divide-y divide-gray-50">
                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                        Google Maps Results
                                    </div>
                                    {results.map((loc, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => handleSelectResult(loc)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors"
                                        >
                                            <div className="mt-1 min-w-[16px] text-red-500">
                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-800">{loc.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{loc.address}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-auto pt-4">
                        <button 
                            disabled={!selectedLocation}
                            onClick={handleConfirm}
                            className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center gap-2
                                ${selectedLocation 
                                    ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl translate-y-0' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            Confirm Location
                            {selectedLocation && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LocationSearchModal;