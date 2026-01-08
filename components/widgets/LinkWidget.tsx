
import React from 'react';
import { BentoItemData, FallbackData } from '../../types';
import { TwitterIcon, LinkedInIcon } from '../icons/SocialIcons';
import InstagramWidget from './InstagramWidget';
import YoutubeWidget from './YoutubeWidget';

interface LinkWidgetProps {
  data: BentoItemData;
  fallback: FallbackData;
  isMobile?: boolean;
}

const LinkWidget: React.FC<LinkWidgetProps> = ({ data, fallback, isMobile }) => {
  const title = data.overrides?.title?.content?.[0]?.content?.[0]?.text || '';
  const href = data.href || '#';

  if (href.includes('instagram.com')) {
      return <InstagramWidget data={data} fallback={fallback} isMobile={isMobile} />;
  }

  if (href.includes('youtube.com') || href.includes('youtu.be')) {
      return <YoutubeWidget data={data} fallback={fallback} isMobile={isMobile} />;
  }

  const renderContent = () => {
    if (href.includes('x.com') || href.includes('twitter.com')) {
      return (
        <div className="p-4 flex items-center space-x-3 h-full" style={{backgroundColor: '#F5FAFE'}}>
          <div className="w-8 h-8 flex-shrink-0">
             <TwitterIcon />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
      );
    }

    if (href.includes('linkedin.com')) {
      return (
        <div className="p-4 flex items-center space-x-3 h-full" style={{backgroundColor: '#F0F6F9'}}>
          <div className="w-8 h-8 flex-shrink-0">
            <LinkedInIcon />
          </div>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
      );
    }
    
    // Generic Link Card (e.g. Reddit, Personal Blogs, etc.)
    // We try to make this look "beautiful" by fetching an icon and cleaning up the title
    let hostname = '';
    try {
        hostname = new URL(href).hostname.replace('www.', '');
    } catch (e) {
        hostname = href;
    }
    
    // If the title is just the URL (which is default on paste), show the hostname instead to look cleaner
    const displayTitle = (title && title !== href) ? title : hostname;
    
    // Use Google's favicon service for a nice touch without backend
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    return (
      <div className="p-4 flex flex-col h-full justify-between bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
           <img 
             src={faviconUrl} 
             alt="" 
             className="w-8 h-8 rounded-lg shadow-sm border border-gray-100 object-contain bg-white" 
             onError={(e) => {
                 (e.target as HTMLImageElement).style.display = 'none';
             }}
           />
           {/* Optional: Add an external link icon or arrow here if desired */}
        </div>
        <div className="mt-2">
           <span className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
               {displayTitle}
           </span>
           {(title && title !== href) && (
               <span className="text-xs text-gray-400 mt-0.5 block">{hostname}</span>
           )}
        </div>
      </div>
    );
  };
  
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      draggable={false}
      className="block w-full h-full bg-white rounded-3xl shadow-sm border border-black/[.08] overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transform transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-400"
    >
      {renderContent()}
    </a>
  );
};

export default LinkWidget;
