
import React, { useState, useRef, useEffect } from 'react';
import { BentoItem as BentoItemType, FallbackData } from '../types';
import BentoItem from './BentoItem';

interface BentoGridProps {
  items: BentoItemType[];
  fallback: FallbackData;
  onItemClick?: (id: string) => void;
  onItemsChange: (items: BentoItemType[]) => void;
  onDelete: (id: string) => void;
}

const BentoGrid: React.FC<BentoGridProps> = ({ 
    items: initialItems, 
    fallback, 
    onItemClick,
    onItemsChange,
    onDelete
}) => {
  const [items, setItems] = useState<BentoItemType[]>(initialItems);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  const originalItemsRef = useRef<BentoItemType[] | null>(null);

  // Update local items state when prop items change (e.g. from App.tsx add operations)
  useEffect(() => {
      setItems(initialItems);
  }, [initialItems]);

  // Sort items by their y-position then x-position for correct order on mobile
  const sortedMobileItems = [...items].sort((a, b) => {
    if (a.position.mobile.y !== b.position.mobile.y) {
      return a.position.mobile.y - b.position.mobile.y;
    }
    return a.position.mobile.x - b.position.mobile.x;
  });

  // Sort items for desktop
  const sortedDesktopItems = [...items].sort((a, b) => {
    if (a.position.desktop.y !== b.position.desktop.y) {
      return a.position.desktop.y - b.position.desktop.y;
    }
    return a.position.desktop.x - b.position.desktop.x;
  });
  
  const handleResizeItem = (id: string, newDimension: string, isMobile: boolean) => {
    const updatedItems = items.map(item => {
      if (item.data.id !== id) return item;

      const currentStyle = item.data.style || { mobile: '1x4', desktop: '1x4' };
      
      const updatedStyle = {
          mobile: isMobile ? newDimension : currentStyle.mobile,
          desktop: !isMobile ? newDimension : currentStyle.desktop
      };

      return { ...item, data: { ...item.data, style: updatedStyle } };
    });
    
    setItems(updatedItems);
    onItemsChange(updatedItems);
    // FIX: Update active item on resize so subsequent adds happen in this context
    if (onItemClick) onItemClick(id);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
    originalItemsRef.current = JSON.parse(JSON.stringify(items));
    if (onItemClick) onItemClick(id);
  };

  // Called continuously as we drag over other items (Live Preview)
  const handleMove = (targetId: string, isMobile: boolean) => {
    if (!draggedId || draggedId === targetId) return;

    setItems(prevItems => {
        const newItems = [...prevItems];
        const draggedIndex = newItems.findIndex(i => i.data.id === draggedId);
        const targetIndex = newItems.findIndex(i => i.data.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return prevItems;

        const draggedItem = { ...newItems[draggedIndex] };
        const targetItem = { ...newItems[targetIndex] };

        // Swap positions based on current view
        if (isMobile) {
            const tempPos = { ...draggedItem.position.mobile };
            draggedItem.position.mobile = targetItem.position.mobile;
            targetItem.position.mobile = tempPos;
        } else {
            const tempPos = { ...draggedItem.position.desktop };
            draggedItem.position.desktop = targetItem.position.desktop;
            targetItem.position.desktop = tempPos;
        }

        newItems[draggedIndex] = draggedItem;
        newItems[targetIndex] = targetItem;

        return newItems;
    });
  };

  const handleDragEnd = (success: boolean) => {
      if (!success && originalItemsRef.current) {
          // Revert if dropped outside or cancelled
          setItems(originalItemsRef.current);
      } else if (success) {
          // Commit changes to parent
          onItemsChange(items);
      }
      setDraggedId(null);
      originalItemsRef.current = null;
  };
  
  const onGridDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const onGridDrop = (e: React.DragEvent) => {
      e.preventDefault();
      handleDragEnd(true);
  };

  return (
    <>
      {/* Mobile Grid */}
      <div 
        className="grid grid-cols-2 gap-4 lg:hidden auto-rows-min items-start"
        onDragOver={onGridDragOver}
        onDrop={onGridDrop}
      >
        {sortedMobileItems.map(item => (
          <BentoItem 
            key={item.data.id} 
            item={item} 
            fallback={fallback} 
            isMobile={true}
            onResize={handleResizeItem}
            onDelete={onDelete}
            onDragStart={handleDragStart}
            onMove={handleMove}
            onDragEnd={handleDragEnd}
            draggedId={draggedId}
            isDragging={!!draggedId}
            onClick={() => onItemClick && onItemClick(item.data.id)}
          />
        ))}
      </div>

      {/* Desktop Grid */}
      <div 
        className="hidden lg:grid lg:grid-cols-8 lg:grid-flow-row-dense gap-6"
        style={{ gridAutoRows: '77px' }}
        onDragOver={onGridDragOver}
        onDrop={onGridDrop}
      >
        {sortedDesktopItems.map(item => (
          <BentoItem 
            key={item.data.id} 
            item={item} 
            fallback={fallback} 
            isMobile={false} 
            onResize={handleResizeItem}
            onDelete={onDelete}
            onDragStart={handleDragStart}
            onMove={handleMove}
            onDragEnd={handleDragEnd}
            draggedId={draggedId}
            isDragging={!!draggedId}
            onClick={() => onItemClick && onItemClick(item.data.id)}
          />
        ))}
      </div>
    </>
  );
};

export default BentoGrid;
