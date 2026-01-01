
import React, { useState, useEffect } from 'react';
import { BentoItemData } from '../../types';

interface SectionHeaderWidgetProps {
  data: BentoItemData;
}

const SectionHeaderWidget: React.FC<SectionHeaderWidgetProps> = ({ data }) => {
  const initialTitle = data.title?.content?.[0]?.content?.[0]?.text || '';
  const [text, setText] = useState(initialTitle);

  // In a real app, you would debounce this and save it upwards
  // For this demo, local state allows the "editing" interaction
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
  }
  
  return (
    <div className="h-full flex items-center w-full">
      <input 
        value={text}
        onChange={handleChange}
        className="w-full bg-transparent text-md font-medium text-gray-600 border-none outline-none focus:ring-0 p-0 m-0 cursor-text"
        placeholder="Section Title..."
        // Stop propagation only for drag start (mousedown), but allow click to bubble so item can be selected
        onMouseDown={(e) => e.stopPropagation()} 
        // Ensure we don't block selection click if it happens on the input
        onClick={(e) => {
            // We want to allow the parent BentoItem's onClick to fire to set active state.
            // Since we stopped propagation on MouseDown (to prevent drag), we must ensure 
            // that doesn't interfere with focus/selection logic we might expect.
            // Actually, bubbling click is fine. 
        }}
      />
    </div>
  );
};

export default SectionHeaderWidget;
