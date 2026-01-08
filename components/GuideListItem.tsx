
import React from 'react';
import { ChevronRightIcon } from './icons/GuideIcons';
import GuideVisual from './GuideVisual';
import { GuideVisualType } from '../types';

export type GuideItemType = GuideVisualType;

interface GuideListItemProps {
    type: GuideItemType;
    title: string;
    imageUrls?: string[];
}

const GuideListItem: React.FC<GuideListItemProps> = ({ type, title, imageUrls }) => {
    // Adapt props for GuideVisual which expects Bento items
    const visualItems = (imageUrls || []).map((url, i) => ({
        data: { id: `visual-${i}`, type: 'image', href: url },
        position: { mobile: { x: 0, y: 0 }, desktop: { x: 0, y: 0 } }
    }));

    return (
        <div className="flex items-center justify-between w-full py-2 px-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group font-['Inter']">
            <div className="flex items-center gap-4">
                {/* Left Visual Stack */}
                <div className="flex-shrink-0">
                    <GuideVisual items={visualItems} isExpanded={false} />
                </div>
                
                {/* Title */}
                <span className="text-[15px] font-medium text-gray-800 leading-tight group-hover:text-black">
                    {title}
                </span>
            </div>

            {/* Right Action - Only show arrow for info items, removed bookmark icon */}
            <div className="text-gray-300">
                {type === 'info' && (
                    <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                )}
            </div>
        </div>
    );
};

export default GuideListItem;
