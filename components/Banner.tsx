
import React from 'react';

const Banner: React.FC = () => {
  return (
    <a 
      href="https://bento.me/bento-sunset" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="pointer-events-auto fixed top-0 left-0 right-0 z-50 flex w-full cursor-pointer items-center justify-center py-2.5 text-sm font-semibold text-white"
      style={{ backgroundColor: '#768CFF' }}
    >
      Bento will sunset on February 13th. Read the announcement here
      <img src="https://cdn.prod.website-files.com/6335b33630f88833a92915fc/63e519115f5d67d8f5450447_miniarrowwhite.svg" alt="arrow" className="ml-2.5 inline-block h-3 w-3" />
    </a>
  );
};

export default Banner;
