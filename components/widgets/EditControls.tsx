
import React from 'react';
import { DeleteIcon, ResizeIconOneByFour, ResizeIconTwoByTwo, ResizeIconTwoByFour, ResizeIconFourByTwo, ResizeIconFourByFour } from '../icons/EditIcons';

interface EditControlsProps {
    itemId: string;
    currentStyle?: { mobile?: string; desktop?: string };
    isMobile: boolean;
    onDelete: (id: string) => void;
    onResize: (id: string, newDimension: string, isMobile: boolean) => void;
    canResize?: boolean;
    itemType?: string;
}

const resizeOptions = [
    { name: "2x2", value: '2x2', icon: <ResizeIconTwoByTwo /> },
    { name: "1x4", value: '1x4', icon: <ResizeIconOneByFour /> }, // Restored to 2nd position (Form 2)
    { name: "2x4", value: '2x4', icon: <ResizeIconTwoByFour /> }, 
    { name: "4x2", value: '4x2', icon: <ResizeIconFourByTwo /> },
    { name: "4x4", value: '4x4', icon: <ResizeIconFourByFour /> },
];

const EditControls: React.FC<EditControlsProps> = ({ itemId, currentStyle, isMobile, onDelete, onResize, canResize = true, itemType }) => {
  const currentDimension = isMobile ? currentStyle?.mobile : currentStyle?.desktop;

  return (
    // Stop propagation here so clicking controls doesn't start a drag on the parent item
    <div onPointerDown={(e) => e.stopPropagation()}>
      {/* Delete Button */}
      <div className="edit-controls absolute -top-3 -left-3 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-200 ease-out z-10">
        <button 
          onClick={(e) => {
              e.stopPropagation();
              onDelete(itemId);
          }}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Delete widget"
        >
          <DeleteIcon />
        </button>
      </div>

      {/* Resize Menu - Only show if canResize is true */}
      {canResize && (
        <div className="edit-controls absolute bottom-[-20px] left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transform transition-all duration-200 ease-out z-10">
            <div className="flex items-center space-x-1 bg-black text-white rounded-lg p-1 shadow-lg">
            {resizeOptions.map(({name, value, icon}) => {
                const isSelected = currentDimension === value;
                return (
                <button 
                    key={name}
                    onClick={(e) => {
                        e.stopPropagation();
                        onResize(itemId, value, isMobile);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isSelected ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
                    aria-label={`Resize to ${name}`}
                >
                    {icon}
                </button>
                )
            })}
            </div>
        </div>
      )}
    </div>
  );
};

export default EditControls;
