import React from 'react';
import { BentoItemData, FallbackData, InstagramRichData } from '../../types';
import { InstagramIcon } from '../icons/SocialIcons';

interface InstagramWidgetProps {
  data: BentoItemData;
  fallback: FallbackData;
  isMobile?: boolean;
}

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

const InstagramWidget: React.FC<InstagramWidgetProps> = ({ data, fallback, isMobile }) => {
    const title = data.overrides?.title?.content?.[0]?.content?.[0]?.text || '';
    const richDataKey = `/urlrichdata/${data.href}`;
    const richData = fallback[richDataKey] as any;
    
    // Select style based on device type
    const style = (isMobile && data.style?.mobile) ? data.style.mobile : (data.style?.desktop || '2x4');

    const instagramInfo = richData?.data as InstagramRichData;

    const FollowButton = () => (
        <button 
          onClick={(e) => e.preventDefault()} 
          className="h-7 px-3 bg-[#4093EF] hover:bg-[#2875CA] text-white text-[12px] font-bold rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
            Follow <span className="ml-1 opacity-90 font-normal">{instagramInfo?.followers || 0}</span>
        </button>
    );

    // --- Form 1: 2x2 Square ---
    if (style === '2x2') {
        return (
            <Wrapper href={data.href}>
                <div className="p-4 flex flex-col h-full">
                    <div className="w-9 h-9 mb-3"><InstagramIcon /></div>
                    <div className="text-[14px] font-medium leading-tight text-gray-900 mb-2 line-clamp-3">
                        {title}
                    </div>
                    <div className="mt-auto">
                        <FollowButton />
                    </div>
                </div>
            </Wrapper>
        );
    }

    // --- Form 2: 1x4 Horizontal Bar ---
    if (style === '1x4') {
        return (
            <Wrapper href={data.href}>
                 <div className="p-3 flex items-center gap-3 h-full">
                     <div className="w-8 h-8 flex-shrink-0"><InstagramIcon /></div>
                     <div className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-1 flex-grow">{title}</div>
                </div>
            </Wrapper>
        );
    }

    // --- Form 3: 2x4 Wide Rectangle ---
    if (style === '2x4') {
        return (
            <Wrapper href={data.href}>
                <div className="p-5 flex gap-5 h-full">
                    <div className="flex flex-col flex-1 min-w-0 h-full">
                        <div className="w-10 h-10 mb-3"><InstagramIcon /></div>
                        <div className="text-[15px] font-semibold leading-tight text-gray-900 mb-2 line-clamp-3">
                            {title}
                        </div>
                        <div className="mt-auto">
                            <FollowButton />
                        </div>
                    </div>
                    {/* Image Grid Placeholder */}
                    <div className="w-[120px] flex-shrink-0 h-full hidden xs:block">
                         <div className="grid grid-cols-2 gap-2 h-full content-center">
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                         </div>
                    </div>
                </div>
            </Wrapper>
        );
    }

    // --- Form 4: 4x2 Tall Rectangle ---
    if (style === '4x2') {
         return (
            <Wrapper href={data.href}>
                <div className="p-5 flex flex-col h-full">
                    <div className="w-10 h-10 mb-3"><InstagramIcon /></div>
                    <div className="text-[15px] font-semibold leading-tight text-gray-900 mb-4">
                        {title}
                    </div>
                    
                    <div className="flex-grow mb-4">
                         <div className="grid grid-cols-2 gap-2">
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                            <div className="aspect-square bg-gray-100 rounded-md"></div>
                         </div>
                    </div>

                    <div className="mt-auto">
                        <FollowButton />
                    </div>
                </div>
            </Wrapper>
         );
    }

    // --- Form 5: 4x4 Large Square ---
    if (style === '4x4') {
        return (
            <Wrapper href={data.href}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12"><InstagramIcon /></div>
                        <FollowButton />
                    </div>
                    
                    <div className="text-[18px] font-semibold leading-tight text-gray-900 mb-6 max-w-[90%]">
                        {title}
                    </div>
                    
                    <div className="flex-grow grid grid-cols-3 gap-2.5">
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                        <div className="aspect-square bg-gray-100 rounded-lg"></div>
                    </div>
                </div>
            </Wrapper>
        );
    }
    
    // Default fallback
    return (
        <Wrapper href={data.href}>
            <div className="p-4 flex flex-col h-full">
                <div className="w-9 h-9 mb-3"><InstagramIcon /></div>
                <div className="text-[14px] font-semibold text-gray-900">{title}</div>
            </div>
        </Wrapper>
    );
};

export default InstagramWidget;