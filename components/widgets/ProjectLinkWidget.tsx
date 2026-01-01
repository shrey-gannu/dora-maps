
import React from 'react';
import { BentoItemData, FallbackData, UrlMetadata } from '../../types';

interface ProjectLinkWidgetProps {
    data: BentoItemData;
    fallback: FallbackData;
}

const ProjectLinkWidget: React.FC<ProjectLinkWidgetProps> = ({ data, fallback }) => {
    const metadataKey = `/urlmetadata/${data.href}`;
    const metadata = fallback[metadataKey] as UrlMetadata;
    const imageUrl = metadata?.imageUrl;
    const faviconUrl = metadata?.faviconUrl;
    const title = metadata?.title || data.href;
    const host = data.href ? new URL(data.href).hostname : '';

    return (
        <a
            href={data.href}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            className="flex flex-col w-full h-full bg-white rounded-3xl shadow-sm border border-black/[.08] overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transform transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-400"
        >
            <div className="p-4 flex items-start space-x-3">
                {faviconUrl && <img src={faviconUrl} alt="favicon" className="w-6 h-6 mt-1 rounded-sm"/>}
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 line-clamp-1">{title}</span>
                    <span className="text-sm text-gray-500">{host}</span>
                </div>
            </div>
            {imageUrl && (
                <div className="flex-grow bg-gray-100">
                    <img src={imageUrl} alt={title || ''} className="w-full h-full object-cover" />
                </div>
            )}
        </a>
    );
};

export default ProjectLinkWidget;
