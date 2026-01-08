import React, { useCallback } from 'react';
import { BentoItem as BentoItemType, FallbackData } from '../types';
import BentoItem from './BentoItem';

interface BentoGridProps {
  sectionId: string;
  items: BentoItemType[];
  fallback: FallbackData;
  onItemClick?: (id: string) => void;
  onItemsChange: (items: BentoItemType[]) => void;
  onItemResize?: (itemId: string, newDimension: string, isMobile: boolean) => void;
  onDelete: (id: string) => void;
  
  // New Pointer Drag Props
  draggingItemId?: string | null;
  dropPreview?: { x: number, y: number, w: number, h: number } | null; // Coordinates for grey placeholder
  onItemPointerDown: (e: React.PointerEvent, sectionId: string, itemId: string) => void;

  isMobileViewForced?: boolean; 
}

const BentoGrid: React.FC<BentoGridProps> = ({ 
    sectionId,
    items, 
    fallback, 
    onItemClick,
    onItemsChange,
    onItemResize,
    onDelete,
    draggingItemId,
    dropPreview,
    onItemPointerDown,
    isMobileViewForced = false
}) => {
  
  const handleResizeItem = useCallback((id: string, newDimension: string, isMobile: boolean) => {
    // Pass resize up to App to handle reflow
    if (onItemResize) {
        onItemResize(id, newDimension, isMobile);
    }
    if (onItemClick) onItemClick(id);
  }, [onItemResize, onItemClick]);

  // Sort items for render order (Y then X) to keep DOM stable
  const getSortedItems = (mobile: boolean) => {
      return [...items].sort((a, b) => {
          const posA = mobile ? a.position.mobile : a.position.desktop;
          const posB = mobile ? b.position.mobile : b.position.desktop;
          if (posA.y !== posB.y) return posA.y - posB.y;
          return posA.x - posB.x;
      });
  };

  const renderGridContent = (isMobile: boolean) => {
      const sortedItems = getSortedItems(isMobile);
      const cols = isMobile ? 4 : 8;

      return (
        <div 
            id={`section-grid-${sectionId}`}
            // Using minmax(0, 1fr) is critical to prevent implicit columns from squashing items
            className={`${isMobile ? 'grid grid-cols-[repeat(4,minmax(0,1fr))] gap-4' : 'grid grid-cols-[repeat(8,minmax(0,1fr))] gap-6'} auto-rows-[minmax(10px,auto)] items-start min-h-[50px] relative transition-all duration-200`}
            style={!isMobile ? { gridAutoRows: '77px' } : {}}
            data-section-id={sectionId} // Helper for hit-testing
        >
            {/* 1. Render Actual Items */}
            {sortedItems.map(item => (
                <BentoItem 
                    key={item.data.id} 
                    item={item} 
                    fallback={fallback} 
                    isMobile={isMobile}
                    onResize={handleResizeItem}
                    onDelete={onDelete}
                    onPointerDown={(e, itemId) => onItemPointerDown(e, sectionId, itemId)}
                    isDraggingSource={draggingItemId === item.data.id}
                    onClick={() => onItemClick && onItemClick(item.data.id)}
                />
            ))}

            {/* 2. Render Drop Preview Placeholder (The Grey Box) */}
            {dropPreview && (
                <div 
                    className="rounded-3xl border-2 border-dashed border-gray-300 bg-gray-100/50 pointer-events-none z-10"
                    style={{
                        gridColumnStart: dropPreview.x + 1,
                        gridColumnEnd: `span ${dropPreview.w}`,
                        gridRowStart: dropPreview.y + 1,
                        gridRowEnd: `span ${dropPreview.h}`
                    }}
                />
            )}
        </div>
      );
  };

  if (isMobileViewForced) {
      return renderGridContent(true);
  }

  return (
    <>
      <div className="lg:hidden">
        {renderGridContent(true)}
      </div>
      <div className="hidden lg:block">
        {renderGridContent(false)}
      </div>
    </>
  );
};

export default React.memo(BentoGrid);