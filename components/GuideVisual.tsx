
import React, { useMemo } from 'react';
import { BentoItem, FallbackData, UrlMetadata, RichData } from '../types';
import { ImageIcon, LinkIcon, QuoteIcon } from './icons/ToolbarIcons';

interface GuideVisualProps {
    items: BentoItem[];
    fallback?: FallbackData;
    isExpanded: boolean;
}

const GuideVisual: React.FC<GuideVisualProps> = ({ items, fallback = {}, isExpanded }) => {
    
    // Logic to extract visual representations from items
    const visuals = useMemo(() => {
        const extracted: { type: 'image' | 'icon', content: string | React.ReactNode, id: string }[] = [];

        // Priority 1: Direct Images
        const imageItems = items.filter(i => i.data.type === 'image');
        imageItems.forEach(item => {
            if (item.data.href) extracted.push({ type: 'image', content: item.data.href, id: item.data.id });
        });

        // Priority 2: Links with Metadata Images
        const linkItems = items.filter(i => i.data.type === 'link');
        linkItems.forEach(item => {
            // Cast types to allow property access, as FallbackData values are union types
            const meta = fallback[`/urlmetadata/${item.data.href}`] as UrlMetadata | undefined;
            const rich = fallback[`/urlrichdata/${item.data.href}`] as RichData | undefined;
            
            // Check Rich Data Thumbnail (Spotify etc)
            if (rich && rich.data && 'thumbnail' in rich.data) {
                 extracted.push({ type: 'image', content: (rich.data as any).thumbnail, id: item.data.id });
            } 
            // Check Metadata Image
            else if (meta && meta.imageUrl) {
                extracted.push({ type: 'image', content: meta.imageUrl, id: item.data.id });
            }
        });

        // Priority 3: Text Items (As a fallback visual if we don't have enough images)
        // Only add if we have less than 2 visuals so far
        if (extracted.length < 2) {
             const textItems = items.filter(i => i.data.type === 'rich-text');
             textItems.forEach(item => {
                 extracted.push({ type: 'icon', content: <QuoteIcon className="w-5 h-5 text-gray-500" />, id: item.data.id });
             });
        }

        // Priority 4: Links without images (Generic Icon)
        if (extracted.length < 2) {
            linkItems.forEach(item => {
                 // Avoid duplicates if already added via image
                 if (!extracted.find(e => e.id === item.data.id)) {
                    extracted.push({ type: 'icon', content: <LinkIcon className="w-5 h-5 text-gray-400" />, id: item.data.id });
                 }
            });
        }

        return extracted.slice(0, 2); // Take top 2
    }, [items, fallback]);

    // If no widgets, show nothing
    if (visuals.length === 0) return null;

    // Animation Classes
    // When expanded: Width 0, Opacity 0, Scale down. 
    // When collapsed: Width 14 (3.5rem), Opacity 100, Scale normal.
    const containerClasses = isExpanded
        ? "w-0 opacity-0 scale-50 -translate-x-4 pointer-events-none margin-0"
        : "w-14 opacity-100 scale-100 translate-x-0 mr-4";

    return (
        <div className={`relative h-14 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex-shrink-0 ${containerClasses}`}>
            {visuals.map((vis, index) => {
                const isFirst = index === 0;
                // Deterministic rotation based on index/id length to look random but stay stable
                const rotation = isFirst ? '-rotate-6' : 'rotate-6';
                const translate = isFirst ? '-translate-x-1 -translate-y-1' : 'translate-x-1 translate-y-1';
                const zIndex = isFirst ? 'z-10' : 'z-0';

                return (
                    <div 
                        key={vis.id}
                        className={`absolute inset-0 w-12 h-12 rounded-xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden transform transition-transform duration-300 ${rotation} ${translate} ${zIndex}`}
                        style={{ top: '4px', left: '4px' }} // Center in the 14x14 box
                    >
                        {vis.type === 'image' ? (
                            <img src={vis.content as string} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-gray-50 w-full h-full flex items-center justify-center">
                                {vis.content}
                            </div>
                        )}
                    </div>
                );
            })}
             {/* Badge count if more than 2? Optional, keeping simple for now as requested */}
        </div>
    );
};

export default GuideVisual;
