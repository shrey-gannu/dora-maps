
import React, { useState, useEffect } from 'react';
import { BentoItem as BentoItemType, FallbackData } from '../types';
import SectionHeaderWidget from './widgets/SectionHeaderWidget';
import LinkWidget from './widgets/LinkWidget';
import MapWidget from './widgets/MapWidget';
import SpotifyWidget from './widgets/SpotifyWidget';
import ProjectLinkWidget from './widgets/ProjectLinkWidget';
import EditControls from './widgets/EditControls';

interface BentoItemProps {
  item: BentoItemType;
  fallback: FallbackData;
  isMobile: boolean;
  onResize: (id: string, newDimension: string, isMobile: boolean) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onMove: (targetId: string, isMobile: boolean) => void;
  onDragEnd: (success: boolean) => void;
  draggedId: string | null;
  isDragging: boolean;
  onClick?: () => void;
}

const BentoItem: React.FC<BentoItemProps> = ({ 
    item, 
    fallback, 
    isMobile, 
    onResize, 
    onDelete, 
    onDragStart, 
    onMove, 
    onDragEnd, 
    draggedId,
    isDragging,
    onClick
}) => {
  const [isVisualPlaceholder, setIsVisualPlaceholder] = useState(false);
  const isBeingDragged = draggedId === item.data.id;

  useEffect(() => {
    if (!isBeingDragged) {
        setIsVisualPlaceholder(false);
    }
  }, [isBeingDragged]);

  const getGridStyle = (): React.CSSProperties => {
    if (isMobile) return {};

    const styleString = item.data.style?.desktop;

    // Force full width for section headers
    if (item.data.type === 'section-header') {
        return { gridColumn: '1 / -1' };
    }

    if (!styleString) {
        return { gridColumn: 'span 1', gridRow: 'span 1' };
    }

    const spanMap: Record<string, [number, number]> = {
        '1x4': [1, 4], 
        '2x2': [2, 2], 
        '2x4': [2, 4], 
        '4x2': [4, 2], 
        '4x4': [4, 4], 
    };

    const [rows, cols] = spanMap[styleString] || [1, 1];
    
    return {
      gridColumn: `span ${cols}`,
      gridRow: `span ${rows}`
    };
  };

  const renderWidget = () => {
    const { data } = item;
    switch (data.type) {
      case 'section-header':
        return <SectionHeaderWidget data={data} />;
      case 'link':
        if (data.href?.includes('spotify.com')) {
          return <SpotifyWidget data={data} fallback={fallback} />;
        }
        if (data.href?.includes('google.com/maps')) {
          // Treating Maps as "Photos" (resizable, movable)
          return <MapWidget data={data} fallback={fallback} />;
        }
        if(data.href?.includes('showmeaqi.com')) {
            return <ProjectLinkWidget data={data} fallback={fallback} />;
        }
        return <LinkWidget data={data} fallback={fallback} isMobile={isMobile} />;
      case 'rich-text':
          // Render a simple placeholder text for new rich-text items or existing ones
          // In a real app this would be a full editor
          const textContent = data.content?.content?.[0]?.content?.[0]?.text;
          return (
              <div className="w-full h-full bg-white rounded-3xl p-6 shadow-sm border border-black/[.08] overflow-hidden flex flex-col group-hover:shadow-xl transition-all duration-300">
                  <p className="text-gray-800 whitespace-pre-wrap">{textContent}</p>
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
    '1x4': 'aspect-[4/1]',
    '2x4': 'aspect-[2/1]',
    '4x2': 'aspect-[1/2]',
    '2x2': 'aspect-square', 
    '4x4': 'aspect-square',
  };
  
  const mobileStyle = item.data.style?.mobile;
  const mobileAspectRatio = item.data.type !== 'section-header' && mobileStyle ? aspectRatioMap[mobileStyle] : '';

  const getMobileSpanClass = () => {
    if (!isMobile) return '';
    if (item.data.type === 'section-header') return 'col-span-2';
    if (mobileStyle === '2x2' || mobileStyle === '4x2') {
        return 'col-span-1';
    }
    return 'col-span-2';
  };

  // --- Drag Event Handlers ---

  const handleDragStart = (e: React.DragEvent) => {
      // Don't drag if clicking input in section header
      if ((e.target as HTMLElement).tagName === 'INPUT') {
          e.preventDefault();
          return;
      }

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.data.id);
      
      if (e.currentTarget instanceof HTMLElement) {
          const target = e.currentTarget;
          const clone = target.cloneNode(true) as HTMLElement;
          clone.classList.remove('group'); 
          const controls = clone.querySelectorAll('.edit-controls');
          controls.forEach(c => c.remove());
          clone.style.width = `${target.offsetWidth}px`;
          clone.style.height = `${target.offsetHeight}px`;
          clone.style.position = 'absolute';
          clone.style.top = '-9999px'; 
          clone.style.left = '-9999px';
          clone.style.zIndex = '1000';
          clone.style.opacity = '1'; 
          document.body.appendChild(clone);
          
          const rect = target.getBoundingClientRect();
          e.dataTransfer.setDragImage(clone, e.clientX - rect.left, e.clientY - rect.top);
          setTimeout(() => document.body.removeChild(clone), 0);
      }
      onDragStart(item.data.id);
      setTimeout(() => setIsVisualPlaceholder(true), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
      setIsVisualPlaceholder(false);
      const success = e.dataTransfer.dropEffect === 'move';
      onDragEnd(success);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      if (draggedId && draggedId !== item.data.id) {
          onMove(item.data.id, isMobile);
      }
  };

  // --- Styles ---
  const groupClass = !isDragging ? 'group' : '';
  
  let containerClassName = `${groupClass} relative ${getMobileSpanClass()} select-none transition-all duration-200 ease-in-out`;
  
  if (isVisualPlaceholder) {
      containerClassName += ' bg-gray-100/50 border-2 border-dashed border-gray-300 rounded-3xl opacity-60';
  } else {
      containerClassName += ' cursor-grab active:cursor-grabbing';
  }

  const dragProps = {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
  };

  const handleClick = (e: React.MouseEvent) => {
      // Capture click for selection logic
      if (onClick) onClick();
      // Allow default behavior (e.g. following links) unless preventing it is strictly required
      // For "Edit Mode", we typically might prevent navigation, but the user didn't ask to break links.
  };

  const content = isVisualPlaceholder ? null : renderWidget();
  const isSectionHeader = item.data.type === 'section-header';

  if (isSectionHeader) {
      return (
        <div 
            className={containerClassName} 
            style={getGridStyle()}
            {...dragProps}
            onClick={handleClick}
        >
             <div className={`w-full h-full ${isVisualPlaceholder ? 'invisible' : ''}`}>
                 {renderWidget()}
             </div>
             {/* Edit Controls for Section Header (Only Delete, No Resize) */}
             {!isVisualPlaceholder && !isDragging && (
               <EditControls 
                 itemId={item.data.id}
                 currentStyle={item.data.style}
                 isMobile={isMobile}
                 onDelete={onDelete}
                 onResize={onResize}
                 canResize={false} // Disable resizing
               />
           )}
        </div>
      )
  }

  const heightClass = (isMobile && mobileAspectRatio) ? '' : 'h-full';

  return (
    <div 
        className={containerClassName} 
        style={getGridStyle()}
        {...dragProps}
        onClick={handleClick}
    >
       <div className={`w-full ${heightClass} ${isMobile && mobileAspectRatio ? mobileAspectRatio : ''} pointer-events-none`}>
          <div className={`pointer-events-auto h-full w-full ${isVisualPlaceholder ? 'invisible' : ''}`}> 
            {content}
          </div>
       </div>
       
       {!isVisualPlaceholder && !isDragging && (
           <EditControls 
             itemId={item.data.id}
             currentStyle={item.data.style}
             isMobile={isMobile}
             onDelete={onDelete}
             onResize={onResize}
             canResize={true}
           />
       )}
    </div>
  );
};

export default BentoItem;
