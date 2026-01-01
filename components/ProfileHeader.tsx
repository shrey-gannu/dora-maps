
import React, { useRef } from 'react';
import { BioContent } from '../types';

interface ProfileHeaderProps {
  name: string;
  imageUrl: string;
  bio: BioContent[];
  onUpdateName: (name: string) => void;
  onUpdateImage: (url: string) => void;
  onUpdateBio: (index: number, text: string) => void;
  onAddBioLine: (index: number) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    name, 
    imageUrl, 
    bio, 
    onUpdateName, 
    onUpdateImage,
    onUpdateBio,
    onAddBioLine
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative animate-fade-in group">
      {/* Profile Image - Hover to edit */}
      <div 
        className="relative w-32 h-32 xl:w-48 xl:h-48 cursor-pointer group-hover:shadow-lg rounded-full transition-all"
        onClick={handleImageClick}
        title="Click to upload new image"
      >
        <img 
          src={imageUrl} 
          alt="avatar" 
          className="w-full h-full rounded-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white font-medium text-sm">Upload Photo</span>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
        />
      </div>

      <div className="mt-8 space-y-3">
        {/* Main Heading (Name) - Editable */}
        <input
            value={name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="w-full bg-transparent text-4xl xl:text-5xl font-extrabold tracking-[-0.04em] text-gray-900 border-none outline-none focus:ring-0 placeholder-gray-300 p-0 m-0"
            placeholder="Your Name"
        />

        {/* Sub Heading (Bio) - Editable Notepad style */}
        <div className="mt-3 text-gray-600 text-lg xl:text-xl space-y-1">
          {bio.map((item, index) => {
             const textContent = item.content?.map(c => c.text).join('') || '';
             // We only render inputs for paragraphs that have content or valid placeholders
             // Bento data sometimes has empty paragraphs for spacing, we keep them simple
             if(item.type !== 'paragraph') return null;
             
             return (
                <div key={index} className="w-full">
                    <input 
                        value={textContent}
                        onChange={(e) => onUpdateBio(index, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onAddBioLine(index);
                            }
                        }}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 m-0 text-gray-600 placeholder-gray-300"
                        placeholder=""
                    />
                </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
