import React from 'react';
import { BentoItemData, FallbackData } from '../../types';

interface YoutubeWidgetProps {
  data: BentoItemData;
  fallback: FallbackData;
  isMobile?: boolean;
}

const YoutubeIcon: React.FC = () => (
    <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg">
        <rect width="40" height="40" rx="10" fill="#FF0000" />
        <path d="M30.41 14.59C30.41 14.59 30.29 12.44 29.35 11.49C28.16 10.24 26.83 10.23 26.22 10.16C21.84 9.85 19.99 9.85 19.99 9.85C19.99 9.85 18.15 9.85 13.78 10.16C13.17 10.23 11.84 10.24 10.65 11.49C9.71 12.44 9.59 14.59 9.59 14.59C9.59 14.59 9.47 17.11 9.47 19.64V22.01C9.47 24.53 9.59 27.05 9.59 27.05C9.59 27.05 9.71 29.21 10.65 30.15C11.84 31.41 13.41 31.36 14.1 31.49C16.63 31.73 20 31.8 20 31.8C20 31.8 21.85 31.79 26.22 31.48C26.83 31.41 28.16 31.41 29.35 30.15C30.29 29.21 30.41 27.05 30.41 27.05C30.41 27.05 30.53 24.53 30.53 22.01V19.64C30.53 17.11 30.41 14.59 30.41 14.59ZM17.89 24.16V16.89L24.28 20.53L17.89 24.16Z" fill="white"/>
    </svg>
);

interface WrapperProps {
  children: React.ReactNode;
  href?: string;
}

const Wrapper: React.FC<WrapperProps> = ({ children, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    draggable={false}
    className="group flex w-full h-full flex-col bg-white rounded-[24px] border border-black/[0.08] shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 overflow-hidden"
  >
    {children}
  </a>
);

const YoutubeWidget: React.FC<YoutubeWidgetProps> = ({ data, isMobile }) => {
    const title = data.overrides?.title?.content?.[0]?.content?.[0]?.text || 'Youtube Channel';
    const style = (isMobile && data.style?.mobile) ? data.style.mobile : (data.style?.desktop || '2x4');

    const SubscribeButton = () => (
        <button 
          onClick={(e) => e.preventDefault()} 
          className="h-7 px-3 bg-[#CC0000] hover:bg-[#a60000] text-white text-[12px] font-bold rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
            Subscribe
        </button>
    );

    const VideoThumb = () => (
        <div className="aspect-video bg-gray-100 rounded-md relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-5 h-5 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
                     <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-red-600 border-b-[3px] border-b-transparent ml-0.5"></div>
                 </div>
             </div>
        </div>
    );

    if (style === '2x2') {
        return (
            <Wrapper href={data.href}>
                <div className="p-4 flex flex-col h-full">
                    <div className="w-9 h-9 mb-3"><YoutubeIcon /></div>
                    <div className="text-[14px] font-medium leading-tight text-gray-900 mb-2 line-clamp-3">
                        {title}
                    </div>
                    <div className="mt-auto">
                        <SubscribeButton />
                    </div>
                </div>
            </Wrapper>
        );
    }

    if (style === '1x4') {
        return (
            <Wrapper href={data.href}>
                 <div className="p-3 flex items-center gap-3 h-full">
                     <div className="w-8 h-8 flex-shrink-0"><YoutubeIcon /></div>
                     <div className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-1 flex-grow">{title}</div>
                </div>
            </Wrapper>
        );
    }

    if (style === '2x4') {
        return (
            <Wrapper href={data.href}>
                <div className="p-5 flex gap-5 h-full">
                    <div className="flex flex-col flex-1 min-w-0 h-full">
                        <div className="w-10 h-10 mb-3"><YoutubeIcon /></div>
                        <div className="text-[15px] font-semibold leading-tight text-gray-900 mb-2 line-clamp-3">
                            {title}
                        </div>
                        <div className="mt-auto">
                            <SubscribeButton />
                        </div>
                    </div>
                    <div className="w-[120px] flex-shrink-0 flex flex-col justify-center gap-2">
                        <VideoThumb />
                        <VideoThumb />
                    </div>
                </div>
            </Wrapper>
        );
    }

    if (style === '4x2') {
        return (
            <Wrapper href={data.href}>
                <div className="p-5 flex flex-col h-full">
                    <div className="w-10 h-10 mb-3"><YoutubeIcon /></div>
                    <div className="text-[15px] font-semibold leading-tight text-gray-900 mb-4">
                        {title}
                    </div>
                    
                    <div className="flex-grow mb-4 grid grid-cols-1 gap-2 content-start">
                        <VideoThumb />
                        <VideoThumb />
                    </div>

                    <div className="mt-auto">
                        <SubscribeButton />
                    </div>
                </div>
            </Wrapper>
        );
    }

    if (style === '4x4') {
        return (
            <Wrapper href={data.href}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12"><YoutubeIcon /></div>
                        <SubscribeButton />
                    </div>
                    
                    <div className="text-[18px] font-semibold leading-tight text-gray-900 mb-6 max-w-[90%]">
                        {title}
                    </div>
                    
                    <div className="flex-grow grid grid-cols-2 gap-2.5 content-start">
                        <VideoThumb />
                        <VideoThumb />
                        <VideoThumb />
                        <VideoThumb />
                    </div>
                </div>
            </Wrapper>
        );
    }

    return (
        <Wrapper href={data.href}>
            <div className="p-4 flex flex-col h-full">
                 <div className="w-9 h-9 mb-3"><YoutubeIcon /></div>
                 <div className="text-[14px] font-semibold text-gray-900">{title}</div>
            </div>
        </Wrapper>
    );
};

export default YoutubeWidget;