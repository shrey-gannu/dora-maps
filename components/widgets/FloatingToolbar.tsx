
import React, { useState, useRef, useEffect } from 'react';
import { LinkIcon, ImageIcon, QuoteIcon, MapIcon, LayoutIcon, DeviceIcon, MobileIcon } from '../icons/ToolbarIcons';

interface FloatingToolbarProps {
    onAddLink: (url: string) => void;
    onAddImage: () => void;
    onAddText: (text: string) => void;
    onAddSectionTitle: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
    onAddLink,
    onAddImage,
    onAddText,
    onAddSectionTitle
}) => {
    const [activePopup, setActivePopup] = useState<'none' | 'link' | 'text'>('none');
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        if (activePopup !== 'none') {
            setInputValue('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [activePopup]);

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddLink(inputValue);
            setActivePopup('none');
        }
    };

    const handleTextSubmit = () => {
        if (inputValue.trim()) {
            onAddText(inputValue);
            setActivePopup('none');
        }
    };

    const togglePopup = (type: 'link' | 'text') => {
        setActivePopup(prev => prev === type ? 'none' : type);
    };

    // Wrappers to close popups when other actions are taken
    const handleAddImage = () => {
        setActivePopup('none');
        onAddImage();
    };

    const handleAddSectionTitle = () => {
        setActivePopup('none');
        onAddSectionTitle();
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
            
            {/* Popups */}
            {activePopup === 'link' && (
                <div className="mb-2 bg-white rounded-xl shadow-xl p-1.5 flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200 border border-gray-100">
                    <form onSubmit={handleLinkSubmit} className="flex items-center gap-1.5">
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            placeholder="Enter Link"
                            className="bg-transparent outline-none text-gray-700 px-2 py-1.5 w-48 text-xs"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="bg-white hover:bg-gray-50 text-black font-semibold text-[10px] px-2 py-1 rounded-md border border-gray-200 shadow-sm transition-colors"
                        >
                            Add
                        </button>
                    </form>
                </div>
            )}

            {activePopup === 'text' && (
                <div className="mb-2 bg-white rounded-2xl shadow-xl p-2 w-48 animate-in slide-in-from-bottom-2 fade-in duration-200 border border-gray-100">
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        placeholder="Add note..."
                        className="w-full bg-gray-100 rounded-lg p-2 outline-none text-gray-700 text-xs resize-none mb-2 h-16"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleTextSubmit();
                            }
                        }}
                    />
                    <div className="flex justify-between items-center">
                        <button onClick={() => setActivePopup('none')} className="text-gray-400 hover:text-gray-600 p-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                        <button 
                            onClick={handleTextSubmit}
                            className="bg-black text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-gray-800 transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Toolbar - Compact */}
            <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1 flex items-center gap-0.5 border border-gray-100/50 backdrop-blur-sm scale-90 origin-bottom">
                
                {/* Share Button */}
                <button 
                    onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        alert("Link copied to clipboard!");
                    }}
                    className="bg-[#4ADE80] hover:bg-[#42ce76] text-white font-bold text-xs px-3 py-1.5 rounded-full mr-1 transition-all active:scale-95 shadow-sm whitespace-nowrap"
                >
                    Share
                </button>

                <div className="h-4 w-px bg-gray-200 mx-1"></div>

                {/* Link Button */}
                <button 
                    onClick={() => togglePopup('link')}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 ${activePopup === 'link' ? 'bg-gray-100 text-black' : ''}`}
                    title="Add Link"
                >
                    <LinkIcon className="scale-75" />
                </button>

                {/* Image Button */}
                <button 
                    onClick={handleAddImage}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                    title="Add Image"
                >
                    <ImageIcon className="scale-75" />
                </button>

                {/* Text Button */}
                <button 
                    onClick={() => togglePopup('text')}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 ${activePopup === 'text' ? 'bg-gray-100 text-black' : ''}`}
                    title="Add Text"
                >
                    <QuoteIcon className="text-blue-400 scale-75" />
                </button>

                {/* Map/Section Title Button */}
                <button 
                    onClick={handleAddSectionTitle}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                    title="Add Section Title"
                >
                    <MapIcon className="text-green-500 scale-75" />
                </button>

                {/* Layout Button (Visual only) */}
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 cursor-not-allowed hidden sm:block">
                    <LayoutIcon className="scale-75" />
                </button>

                <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* Device Toggles (Visual only) */}
                <div className="hidden sm:flex items-center gap-0.5">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-800">
                        <DeviceIcon className="scale-75" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                        <MobileIcon className="scale-75" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingToolbar;
