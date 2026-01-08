
import React, { useEffect, useRef, useState } from 'react';

export interface MapMarkerData {
    id: string;
    lat: number;
    lng: number;
    title: string;
    emoji: string;
}

interface FullMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    markers: MapMarkerData[];
}

declare global {
  interface Window {
    google: any;
  }
}

const FullMapModal: React.FC<FullMapModalProps> = ({ isOpen, onClose, markers }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load Google Maps Script securely using process.env.API_KEY
    useEffect(() => {
        if (!isOpen) return;

        const loadGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                return;
            }

            const existingScript = document.getElementById('google-maps-script');
            if (existingScript) {
                setIsLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsLoaded(true);
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, [isOpen]);

    // 2. Initialize Map & Markers
    useEffect(() => {
        if (!isOpen || !isLoaded || !mapContainerRef.current) return;

        const initMap = () => {
            if (!mapInstanceRef.current) {
                mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
                    zoom: 2,
                    center: { lat: 20, lng: 0 },
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    styles: [
                        {
                            "featureType": "poi",
                            "elementType": "labels.text",
                            "stylers": [{ "visibility": "off" }]
                        },
                        {
                            "featureType": "poi.business",
                            "stylers": [{ "visibility": "off" }]
                        }
                    ]
                });
            }

            const map = mapInstanceRef.current;

            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            if (markers.length > 0) {
                const bounds = new window.google.maps.LatLngBounds();

                markers.forEach(markerData => {
                    const position = { lat: markerData.lat, lng: markerData.lng };
                    
                    // Create a custom SVG icon for the emoji to render it sharply on the map
                    const svg = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                            </filter>
                            <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="30" filter="url(#shadow)">${markerData.emoji}</text>
                        </svg>`;
                    
                    const icon = {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
                        scaledSize: new window.google.maps.Size(40, 40),
                        anchor: new window.google.maps.Point(20, 20)
                    };

                    const marker = new window.google.maps.Marker({
                        position,
                        map,
                        title: markerData.title,
                        icon: icon,
                        animation: window.google.maps.Animation.DROP
                    });

                    // Info Window to show title on click
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 4px; font-family: 'Inter', sans-serif;">
                                <strong style="font-size: 14px; color: #1f2937;">${markerData.title}</strong>
                            </div>
                        `,
                        pixelOffset: new window.google.maps.Size(0, -10)
                    });

                    marker.addListener("click", () => {
                        infoWindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        });
                    });

                    bounds.extend(position);
                    markersRef.current.push(marker);
                });

                // Fit bounds to show all markers
                map.fitBounds(bounds);
                
                // Prevent zooming in too far if there is only 1 marker
                const listener = window.google.maps.event.addListener(map, "idle", () => { 
                    if (map.getZoom() > 16) map.setZoom(16); 
                    window.google.maps.event.removeListener(listener); 
                });
            } else {
                map.setCenter({ lat: 20, lng: 0 });
                map.setZoom(2);
            }
        };

        initMap();

    }, [isOpen, isLoaded, markers]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-['Inter']">
            <div className="bg-white w-full h-full md:w-[90vw] md:h-[90vh] md:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-start pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-black/5 pointer-events-auto">
                        <h2 className="text-lg font-bold text-gray-900">Locations</h2>
                        <p className="text-xs text-gray-500">{markers.length} places pinned</p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm border border-black/5 hover:bg-white text-gray-500 hover:text-black transition-colors pointer-events-auto"
                    >
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Map Container */}
                <div ref={mapContainerRef} className="w-full h-full bg-gray-100" />
            </div>
        </div>
    );
};

export default FullMapModal;
