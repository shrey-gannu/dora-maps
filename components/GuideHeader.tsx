
import React from 'react';
import { StarIconFilled, GoogleMapsIcon, DownloadIcon, ShareIcon } from './icons/GuideIcons';

interface GuideHeaderProps {
    title: string;
    rating: string;
    updatedDate: string;
    profileName: string;
    profileImage: string;
    profileDesc: string;
    onOpenMap?: () => void;
    onSaveOffline?: () => void;
    onShare?: () => void;
    hasLocations?: boolean;
}

const GuideHeader: React.FC<GuideHeaderProps> = ({
    title,
    rating,
    updatedDate,
    profileName,
    profileImage,
    profileDesc,
    onOpenMap,
    onSaveOffline,
    onShare,
    hasLocations = false
}) => {
    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-6 pt-6 font-['Inter']">
            {/* 1. Title: Softer black (gray-800) */}
            <h1 className="text-[22px] font-medium text-gray-800 text-center leading-tight">
                {title}
            </h1>

            {/* 2. Rating & Date: Softer colors */}
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[13px] font-normal text-gray-500">
                <div className="flex items-center gap-1">
                    <StarIconFilled className="w-3 h-3 text-black" />
                    <span className="text-gray-800 font-medium">{rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">updated {updatedDate}</span>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100 mt-5 mb-5"></div>

            {/* Profile Section */}
            <div className="flex items-center gap-3 w-full">
                <img 
                    src={profileImage} 
                    alt={profileName} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0"
                />
                <div className="flex flex-col justify-center">
                    <h3 className="text-[15px] font-medium text-gray-800 leading-snug">
                        {profileName}
                    </h3>
                    <p className="text-[13px] font-normal text-gray-500 leading-snug mt-0.5">
                        {profileDesc}
                    </p>
                </div>
            </div>

            {/* 5. Primary Action Buttons */}
            <div className="flex items-center w-full gap-2 mt-5 print:hidden">
                <button 
                    onClick={onOpenMap}
                    disabled={!hasLocations}
                    className={`flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl h-9 px-2 active:scale-95 duration-100 cursor-pointer ${!hasLocations ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <div className="bg-white rounded-full p-0.5 shadow-sm">
                        <GoogleMapsIcon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Open in Google Maps</span>
                </button>

                <button 
                    onClick={onSaveOffline}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl h-9 px-2 active:scale-95 duration-100"
                >
                    <DownloadIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">Save Offline</span>
                </button>

                <button 
                    onClick={onShare}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl w-9 h-9 flex-shrink-0 active:scale-95 duration-100"
                >
                    <ShareIcon className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            
             {/* Divider after buttons/before list */}
             <div className="w-full h-px bg-gray-50 mt-6"></div>
        </div>
    );
};

export default GuideHeader;
