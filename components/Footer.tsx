
import React from 'react';
import { SettingsIcon, ExploreIcon, DiscordIcon } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <div className="fixed left-4 bottom-4 z-40 hidden items-center space-x-2 rounded-xl bg-white/80 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-md xl:flex">
      <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200/80 hover:text-gray-800 transition-colors">
        <SettingsIcon />
      </button>
      <a href="https://bento.me/explore" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-gray-500 hover:bg-gray-200/80 hover:text-gray-800 transition-colors">
        <ExploreIcon />
      </a>
      <a href="https://discord.gg/8rJvDWaSz7" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-gray-500 hover:bg-gray-200/80 hover:text-gray-800 transition-colors">
        <DiscordIcon />
      </a>
      <div className="px-2">
        <div className="h-4 w-px bg-gray-300"></div>
      </div>
      <div className="pr-2 text-sm text-gray-500 font-medium">
        No Views Yesterday
      </div>
    </div>
  );
};

export default Footer;
