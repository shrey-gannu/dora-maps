
import React from 'react';
import { BentoItemData, FallbackData, UrlMetadata } from '../../types';

interface MapWidgetProps {
  data: BentoItemData;
  fallback: FallbackData;
}

const MapWidget: React.FC<MapWidgetProps> = ({ data, fallback }) => {
  const metadataKey = `/urlmetadata/${data.href}`;
  const metadata = fallback[metadataKey] as UrlMetadata;
  const imageUrl = metadata?.imageUrl;
  const caption = data.overrides?.mapCaption || '';

  return (
    <a 
      href={data.href} 
      target="_blank" 
      rel="noopener noreferrer"
      draggable={false}
      className="relative block w-full h-full bg-gray-200 rounded-3xl shadow-sm border border-black/[.08] overflow-hidden bg-cover bg-center group-hover:shadow-xl group-hover:-translate-y-1 transform transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-400"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-x-3 bottom-3">
        <div className="bg-white/70 backdrop-blur-md px-2 py-1.5 text-sm font-medium text-gray-900 rounded-lg shadow-sm w-fit">
          {caption}
        </div>
      </div>
    </a>
  );
};

export default MapWidget;
