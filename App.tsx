
import React, { useState } from 'react';
import { profileData } from './data';
import ProfileHeader from './components/ProfileHeader';
import BentoGrid from './components/BentoGrid';
import Footer from './components/Footer';
import FloatingToolbar from './components/widgets/FloatingToolbar';
import { BentoItem as BentoItemType } from './types';

const App: React.FC = () => {
  // Lift profile state to allow editing
  // Cast initial state to compatible type to avoid strict inference issues with data.ts
  const [profile, setProfile] = useState<{
      name: string;
      image: string;
      bio: any;
      bento: { items: BentoItemType[] };
  }>(profileData.props.pageProps.profile as any);

  const { fallback } = profileData.props.pageProps;
  
  // Track the last clicked item to determine insertion point
  const [lastActiveItemId, setLastActiveItemId] = useState<string | null>(null);

  const handleUpdateProfile = (field: 'name' | 'image' | 'bio', value: any) => {
    setProfile(prev => {
        if (field === 'bio') {
            const newBioContent = [...prev.bio.content];
             if (typeof value === 'string') {
                 if (newBioContent[0]) {
                     const firstPara = { ...newBioContent[0] };
                     if (firstPara.content && firstPara.content[0]) {
                        const textNode = { ...firstPara.content[0], text: value };
                        firstPara.content = [textNode, ...firstPara.content.slice(1)];
                     }
                     newBioContent[0] = firstPara;
                 }
             }
             return { ...prev, bio: { ...prev.bio, content: newBioContent } };
        }
        return { ...prev, [field]: value };
    });
  };

  const handleUpdateBioLine = (lineIndex: number, text: string) => {
      setProfile(prev => {
          const newBioContent = [...prev.bio.content];
          if (newBioContent[lineIndex]) {
              const para = { ...newBioContent[lineIndex] };
              const paraContent = para.content ? [...para.content] : [];
              if (paraContent[0]) {
                  paraContent[0] = { ...paraContent[0], text: text };
              } else {
                  paraContent.push({ type: 'text', text });
              }
              para.content = paraContent;
              newBioContent[lineIndex] = para;
          }
          return { ...prev, bio: { ...prev.bio, content: newBioContent } };
      });
  }

  const handleAddBioLine = (index: number) => {
    setProfile(prev => {
      const newBioContent = [...prev.bio.content];
      newBioContent.splice(index + 1, 0, { type: 'paragraph', content: [{ type: 'text', text: '' }] });
      return { ...prev, bio: { ...prev.bio, content: newBioContent } };
    });
  };

  // --- Grid State Handlers ---

  const handleItemsChange = (newItems: BentoItemType[]) => {
      setProfile(prev => ({
          ...prev,
          bento: { ...prev.bento, items: newItems }
      }));
  };

  const handleDeleteItem = (id: string) => {
      setProfile(prev => {
          const items = prev.bento.items;
          const remainingItems = items.filter(i => i.data.id !== id);
          
          if (lastActiveItemId === id) {
              // If we delete the active item, we need to pick a new one nearby 
              // so the "active section" context is not lost (which would cause jumps to end).
              
              // Sort original items visually to find neighbors
              const originalSorted = [...items].sort((a, b) => {
                 if (a.position.desktop.y !== b.position.desktop.y) return a.position.desktop.y - b.position.desktop.y;
                 return a.position.desktop.x - b.position.desktop.x;
              });
              
              const deletedIndex = originalSorted.findIndex(i => i.data.id === id);
              let newActiveId = null;
              
              if (deletedIndex > 0) {
                  // Select previous item (visually above/left)
                  newActiveId = originalSorted[deletedIndex - 1].data.id;
              } else if (originalSorted.length > 1) {
                  // If it was the first item, select the one that followed it
                  // We check length > 1 because 1 item is being deleted
                  newActiveId = originalSorted[1]?.data.id; 
              }
              
              // We must update the state via the setter outside if possible, but inside setProfile callback
              // we can't call another setState synchronously for the same render cycle easily without effects.
              // However, since we are inside the setProfile callback, we can't setLastActiveItemId here directly cleanly 
              // without causing a potential race or double render, but setting state from event handler is fine.
              // We'll calculate it here but we need to set it.
              // Actually, standard React batching handles this if we do it in the function body
          }
          
          return {
              ...prev,
              bento: { ...prev.bento, items: remainingItems }
          };
      });

      // We need to calculate the new active ID again because we can't access the logic inside setProfile easily
      // This is safe because profile.bento.items is the state before update
      if (lastActiveItemId === id) {
          const items = profile.bento.items;
          const originalSorted = [...items].sort((a, b) => {
             if (a.position.desktop.y !== b.position.desktop.y) return a.position.desktop.y - b.position.desktop.y;
             return a.position.desktop.x - b.position.desktop.x;
          });
          const deletedIndex = originalSorted.findIndex(i => i.data.id === id);
          if (deletedIndex > 0) {
              setLastActiveItemId(originalSorted[deletedIndex - 1].data.id);
          } else if (items.length > 1) {
               // Find the item that wasn't deleted
               const nextItem = originalSorted.find((_, idx) => idx !== deletedIndex);
               setLastActiveItemId(nextItem ? nextItem.data.id : null);
          } else {
              setLastActiveItemId(null);
          }
      }
  };

  // --- Toolbar / Insertion Handlers ---

  const getNewItemPosition = (items: BentoItemType[], activeId: string | null) => {
      // 1. Sort items visually to determine section boundaries correctly
      // We prioritize desktop layout for structure as it's more stable
      const sortedItems = [...items].sort((a, b) => {
          if (a.position.desktop.y !== b.position.desktop.y) {
              return a.position.desktop.y - b.position.desktop.y;
          }
          return a.position.desktop.x - b.position.desktop.x;
      });

      let currentSectionStartIndex = 0;
      let nextSectionStartIndex = sortedItems.length;

      // 2. Find Active Index in the SORTED array
      let activeIndex = -1;
      if (activeId) {
          activeIndex = sortedItems.findIndex(i => i.data.id === activeId);
      }

      // 3. Determine Section Range
      if (activeIndex !== -1) {
          // Scan backwards for current header (inclusive if active item is header)
          for (let i = activeIndex; i >= 0; i--) {
              if (sortedItems[i].data.type === 'section-header') {
                  currentSectionStartIndex = i;
                  break;
              }
          }
          // Scan forwards for next header
          for (let i = activeIndex + 1; i < sortedItems.length; i++) {
              if (sortedItems[i].data.type === 'section-header') {
                  nextSectionStartIndex = i;
                  break;
              }
          }
      } else {
          // No active selection: find the last header to append to last section
          for (let i = sortedItems.length - 1; i >= 0; i--) {
              if (sortedItems[i].data.type === 'section-header') {
                  currentSectionStartIndex = i;
                  break;
              }
          }
      }

      // 4. Extract items in the target section
      const sectionItems = sortedItems.slice(currentSectionStartIndex, nextSectionStartIndex);

      // 5. Find the maximum Y value in this section to place new item after it
      let maxYDesktop = -Infinity;
      let maxYMobile = -Infinity;

      if (sectionItems.length > 0) {
          sectionItems.forEach(item => {
              if (item.position.desktop.y > maxYDesktop) maxYDesktop = item.position.desktop.y;
              if (item.position.mobile.y > maxYMobile) maxYMobile = item.position.mobile.y;
          });
      } else {
          // Should not happen if header exists, but fallback
          maxYDesktop = 0;
          maxYMobile = 0;
      }

      // 6. Return new position
      // Add a small offset (0.5) to ensure it visually sorts after the last item 
      // but before any item in the next section (which would be at next integer row or further).
      return {
          desktop: { x: 0, y: maxYDesktop + 0.5 },
          mobile: { x: 0, y: maxYMobile + 0.5 }
      };
  };

  const addNewItem = (newItemData: any) => {
      setProfile(prev => {
          const items = [...prev.bento.items];
          
          const position = getNewItemPosition(items, lastActiveItemId);
          
          const newItem: BentoItemType = {
              data: {
                  id: `new-${Date.now()}`,
                  ...newItemData
              },
              position: position
          };

          const newItems = [...items, newItem];
          
          // Set new item as active so subsequent adds go after it
          setLastActiveItemId(newItem.data.id);

          return { ...prev, bento: { ...prev.bento, items: newItems } };
      });
  };

  const onAddLink = (url: string) => {
      addNewItem({
          type: 'link',
          href: url,
          style: { mobile: '1x4', desktop: '1x4' },
          overrides: {
              title: { type: 'doc', content: [{ type: 'paragraph', content: [{ text: url, type: 'text' }] }] }
          }
      });
  };

  const onAddText = (text: string) => {
      addNewItem({
          type: 'rich-text',
          style: { mobile: '2x2', desktop: '2x2' },
          content: { type: 'doc', content: [{ type: 'paragraph', content: [{ text, type: 'text' }] }] }
      });
  };

  const onAddSectionTitle = () => {
      // For a new section, we generally want it at the bottom of the current block
      // The logic above puts it after the last item, effectively starting a new section
      addNewItem({
          type: 'section-header',
          title: { type: 'doc', content: [{ type: 'paragraph', content: [{ text: 'New Section', type: 'text' }] }] }
      });
  };

  const onAddImage = () => {
      addNewItem({
          type: 'link',
          href: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
          style: { mobile: '2x2', desktop: '2x2' },
          overrides: {
              title: { type: 'doc', content: [{ type: 'paragraph', content: [{ text: 'New Image', type: 'text' }] }] }
          }
      });
  };

  return (
    <div className="relative min-h-screen pb-24">
      <main className="min-h-screen w-full bg-white text-gray-800 flex flex-col items-center p-6 lg:p-12 xl:p-16">
        <div className="w-full max-w-[1728px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:justify-start lg:items-start">
            {/* Left Column: Profile Info */}
            <div className="w-full max-w-[428px] lg:w-auto lg:flex-1 lg:max-w-md xl:max-w-lg lg:sticky top-16 self-start px-4 lg:px-0">
              <ProfileHeader 
                name={profile.name} 
                imageUrl={profile.image} 
                bio={profile.bio.content} 
                onUpdateName={(val) => handleUpdateProfile('name', val)}
                onUpdateImage={(val) => handleUpdateProfile('image', val)}
                onUpdateBio={handleUpdateBioLine}
                onAddBioLine={handleAddBioLine}
              />
            </div>

            {/* Spacer */}
            <div className="hidden lg:block flex-shrink-0 w-12 xl:w-20"></div>
            
            {/* Right Column: Bento Grid */}
            <div className="w-full max-w-[428px] lg:max-w-none lg:w-[600px] xl:w-[784px] lg:flex-none mt-8 lg:mt-0">
              <BentoGrid 
                items={profile.bento.items} 
                fallback={fallback} 
                onItemClick={(id) => setLastActiveItemId(id)}
                onItemsChange={handleItemsChange}
                onDelete={handleDeleteItem}
              />
            </div>
          </div>
        </div>
      </main>
      
      <FloatingToolbar 
        onAddLink={onAddLink}
        onAddText={onAddText}
        onAddSectionTitle={onAddSectionTitle}
        onAddImage={onAddImage}
      />
      
      <Footer />
    </div>
  );
};

export default App;
