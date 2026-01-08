
import React from 'react';
import { BentoItem as BentoItemType, FallbackData } from '../types';
import SectionHeaderWidget from './widgets/SectionHeaderWidget';
import LinkWidget from './widgets/LinkWidget';
import MapWidget from './widgets/MapWidget';
import SpotifyWidget from './widgets/SpotifyWidget';
import ProjectLinkWidget from './widgets/ProjectLinkWidget';
import ImageWidget from './widgets/ImageWidget';
import EditControls from './widgets/EditControls';

interface BentoItemProps {
  item: BentoItemType;
  fallback: FallbackData;
  isMobile: boolean;
  
  // New Pointer Event Handler
  onPointerDown: (e: React.PointerEvent, itemId: string) => void;
  
  // Edit Handlers
  onResize: (id: string, newDimension: string, isMobile: boolean) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;

  // Visual States
  isDraggingSource: boolean; // Is this the item currently being dragged?
  isOverlay?: boolean;       // Is this the floating overlay?
}

const BentoItem: React.FC<BentoItemProps> = ({ 
    item, 
    fallback, 
    isMobile, 
    onResize, 
    onDelete, 
    onPointerDown,
    onClick,
    isDraggingSource,
    isOverlay = false
}) => {
  
  // Determine Dimensions and Position
  const getGridStyle = (): React.CSSProperties => {
    // If overlay, we don't use grid positioning, just sizing
    if (isOverlay) return { height: '100%', width: '100%' };

    const pos = isMobile ? item.position.mobile : item.position.desktop;
    const styleString = isMobile ? (item.data.style?.mobile || '2x2') : (item.data.style?.desktop || '2x2');

    let colSpan = 1;
    let rowSpan = 1;

    if (item.data.type === 'section-header') {
        colSpan = isMobile ? 4 : 8; 
        rowSpan = 1; 
    } else {
        const spanMap: Record<string, [number, number]> = {
            '1x4': [1, 4], // Corrected: Full Width for Form 2
            '2x2': [2, 2], 
            '2x4': [2, 4], 
            '4x2': [4, 2], 
            '4x4': [4, 4], 
        };
        const [rows, cols] = spanMap[styleString] || [1, 1];
        colSpan = cols;
        rowSpan = rows;
    }

    return {
      gridColumnStart: (pos?.x ?? 0) + 1,
      gridColumnEnd: `span ${colSpan}`,
      gridRowStart: (pos?.y ?? 0) + 1,
      gridRowEnd: `span ${rowSpan}`,
      zIndex: isDraggingSource ? 0 : 20, // Lower z-index for source so overlay is always on top
    };
  };

  const renderWidget = () => {
    const { data } = item;
    
    switch (data.type) {
      case 'section-header':
        return <SectionHeaderWidget data={data} />;
      case 'image':
        return <ImageWidget data={data} />;
      case 'link':
        if (data.href?.includes('spotify.com')) {
          return <SpotifyWidget data={data} fallback={fallback} />;
        }
        if (data.href?.includes('google.com/maps')) {
          return <MapWidget data={data} fallback={fallback} />;
        }
        if(data.href?.includes('showmeaqi.com')) {
            return <ProjectLinkWidget data={data} fallback={fallback} />;
        }
        return <LinkWidget data={data} fallback={fallback} isMobile={isMobile} />;
      case 'rich-text':
          const textContent = data.content?.content?.[0]?.content?.[0]?.text;
          return (
              <div className="w-full h-full p-3 flex flex-col justify-start overflow-hidden group-hover:bg-gray-50 rounded-xl transition-colors bg-white border border-transparent">
                  <p className="text-gray-800 whitespace-pre-wrap text-base pointer-events-none">{textContent}</p>
              </div>
          )
      default:
        return (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-500">{data.type}</span>
          </div>
        );
    }
  };

  const aspectRatioMap: { [key: string]: string } = {
    '1x4': 'aspect-[3/1]', // Wide Strip Aspect Ratio
    '2x4': 'aspect-[2/1]',
    '4x2': 'aspect-[1/2]',
    '2x2': 'aspect-square', 
    '4x4': 'aspect-square',
  };
  
  const styleString = isMobile ? (item.data.style?.mobile || '2x2') : (item.data.style?.desktop || '2x2');
  const mobileAspectRatio = item.data.type !== 'section-header' && isMobile ? aspectRatioMap[styleString] : '';
  const heightClass = (isMobile && mobileAspectRatio) ? '' : 'h-full';

  // --- Styles ---
  let containerClassName = `relative select-none transition-transform duration-200 ease-out`;

  // IF this is the source item being dragged, hide content to create "Ghost" effect
  // But keep the container so layout doesn't collapse
  if (isDraggingSource) {
      // Use opacity 0 or invisible to keep layout space but hide visuals
      return (
          <div 
            style={getGridStyle()} 
            className={`${containerClassName} opacity-0 pointer-events-none`}
          >
              <div className={`w-full h-full border-2 border-dashed border-gray-200 rounded-3xl`}></div>
          </div>
      );
  }

  // If Overlay or Normal Item
  if (!isOverlay) {
      containerClassName += ' group cursor-grab active:cursor-grabbing hover:z-30';
  } else {
      // Overlay Styles
      containerClassName += ' shadow-2xl scale-105 z-50 cursor-grabbing pointer-events-none'; 
  }

  return (
    <div 
        className={containerClassName} 
        onPointerDown={(e) => !isOverlay && onPointerDown(e, item.data.id)}
        onClick={() => !isOverlay && onClick && onClick()}
        // Critical for mobile drag to not scroll page
        // Only apply touch-action: none if we are draggable (not overlay)
        style={{ ...getGridStyle(), touchAction: isOverlay ? 'auto' : 'none' }} 
    >
       <div className={`w-full ${heightClass} ${isMobile && mobileAspectRatio ? mobileAspectRatio : ''} pointer-events-none`}>
          <div className={`pointer-events-auto h-full w-full`}> 
            {renderWidget()}
          </div>
       </div>
       
       {!isOverlay && !isDraggingSource && (
           <EditControls 
             itemId={item.data.id}
             currentStyle={item.data.style}
             isMobile={isMobile}
             onDelete={onDelete}
             onResize={onResize}
             canResize={item.data.type !== 'section-header'}
             itemType={item.data.type} 
           />
       )}
    </div>
  );
};

export default React.memo(BentoItem);
