
import React from 'react';
import { BentoItemData } from '../../types';

interface ImageWidgetProps {
  data: BentoItemData;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ data }) => {
  const imageUrl = data.href || ''; 
  const title = data.overrides?.title?.content?.[0]?.content?.[0]?.text;

  return (
    <div 
      className="relative w-full h-full bg-gray-200 rounded-3xl shadow-sm border border-black/[.08] overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transform transition-all duration-300"
    >
      <img src={imageUrl} alt={title || 'Image'} className="w-full h-full object-cover object-center" draggable={false} />
      {title && (
         <div className="absolute inset-x-3 bottom-3">
            <div className="bg-white/70 backdrop-blur-md px-2 py-1.5 text-sm font-medium text-gray-900 rounded-lg shadow-sm w-fit">
              {title}
            </div>
          </div>
      )}
    </div>
  );
};

export default ImageWidget;
