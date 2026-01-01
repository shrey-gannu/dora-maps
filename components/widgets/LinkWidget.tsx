
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
    
    return (
      <div className="p-4 flex items-center justify-center h-full bg-gray-100">
        <span className="font-semibold">{title || href}</span>
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
