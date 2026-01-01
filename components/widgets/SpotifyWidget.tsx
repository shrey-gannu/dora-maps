
import React from 'react';
import { BentoItemData, FallbackData, SpotifyRichData } from '../../types';
import { PlayIcon, SpotifyLogoIcon } from '../icons/SocialIcons';

interface SpotifyWidgetProps {
  data: BentoItemData;
  fallback: FallbackData;
}

const SpotifyWidget: React.FC<SpotifyWidgetProps> = ({ data, fallback }) => {
  const richDataKey = `/urlrichdata/${data.href}`;
  const spotifyInfo = fallback[richDataKey]?.data as SpotifyRichData;

  if (!spotifyInfo) {
    return <div className="p-4 bg-gray-200 rounded-3xl h-full flex items-center justify-center">Loading Spotify...</div>;
  }

  return (
    <a 
      href={data.href} 
      target="_blank" 
      rel="noopener noreferrer" 
      draggable={false}
      className="block w-full h-full rounded-3xl shadow-sm border border-black/[.08] overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transform transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-400"
      style={{ backgroundColor: '#EDFCF3' }}
    >
      <div className="w-full h-full p-6 flex items-center justify-between space-x-4">
          <div className="flex flex-col justify-center h-full">
              <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-lg">{spotifyInfo.name}</span>
                  <span className="text-gray-600 text-sm">{spotifyInfo.artistName}</span>
              </div>
            <button className="mt-6 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-full transition-transform hover:scale-105 w-fit text-sm">
                <PlayIcon className="w-3 h-3" />
                <span>Play</span>
            </button>
          </div>
        
          <div className="w-32 h-32 flex-shrink-0">
              <img src={spotifyInfo.thumbnail} alt={spotifyInfo.name} className="w-full h-full object-cover rounded-lg shadow-md" />
          </div>
      </div>
    </a>
  );
};

export default SpotifyWidget;
