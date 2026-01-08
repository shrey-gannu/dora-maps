
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import GuideHeader from './components/GuideHeader';
import GuideVisual from './components/GuideVisual';
import FloatingToolbar from './components/widgets/FloatingToolbar';
import LocationSearchModal from './components/widgets/LocationSearchModal';
import OfflineInstructionModal from './components/widgets/OfflineInstructionModal';
import BentoGrid from './components/BentoGrid';
import BentoItemComponent from './components/BentoItem'; // Import for Overlay
import { PencilIcon, ExternalLinkIcon } from './components/icons/GuideIcons';
import { DeleteIcon } from './components/icons/EditIcons'; 
import { SectionData, BentoItem, BentoItemData, FallbackData, LocationData } from './types';

// Default Data Constants
const DEFAULT_PROFILE = {
    name: "Shrey Tripathi",
    image: "https://storage.googleapis.com/creatorspace-public/users%2Fcm00txl2t00inrw01zvyb2kb4%2FA4Ai7wHSpx9Y4bc7-WhatsApp%2520Image%25202025-02-15%2520at%25202.50.43%2520PM.jpeg",
    desc: "Former Googler, living in Havelock for the last 8 years"
};

const DEFAULT_SECTIONS: SectionData[] = [
    {
        id: 's1',
        type: 'default',
        visualType: 'info', 
        title: 'General information:', 
        isExpanded: true,
        items: [
             {
                data: {
                    id: 'i1',
                    type: 'rich-text',
                    style: { mobile: '2x2', desktop: '2x2' },
                    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ text: 'Welcome to Havelock! Here are my favorite spots.', type: 'text' }] }] }
                },
                position: { mobile: { x: 0, y: 0 }, desktop: { x: 0, y: 0 } }
            }
        ]
    },
    {
        id: 's2',
        type: 'gmap_location',
        visualType: 'beach',
        visualImage: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Radhanagar Beach',
        locationData: { name: 'Radhanagar Beach', lat: 11.9845, lng: 92.9515 },
        isExpanded: true,
        items: [
             {
                data: {
                    id: 'i2',
                    type: 'image',
                    href: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    style: { mobile: '2x2', desktop: '2x2' },
                },
                position: { mobile: { x: 0, y: 0 }, desktop: { x: 0, y: 0 } }
            }
        ]
    },
    {
        id: 's3',
        type: 'gmap_location',
        visualType: 'place',
        title: 'Kala patthar Beach',
        locationData: { name: 'Kala patthar Beach', lat: 12.0336, lng: 92.9886 },
        isExpanded: false,
        items: []
    }
];

interface DragState {
    activeItemId: string;
    sourceSectionId: string;
    item: BentoItem;
    // Where we clicked relative to item top-left
    offset: { x: number; y: number };
    // Current pointer pos
    current: { x: number; y: number };
    // Original rect for animation source
    originalRect: DOMRect;
}

interface DropPreview {
    sectionId: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

// Utility to compress images.
// Heavily optimized to ensure output is small enough for localStorage (aiming for <100KB)
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 600; // Safe size for mobile cards
        const MAX_HEIGHT = 600;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // 0.5 quality JPEG is very efficient
                    resolve(canvas.toDataURL('image/jpeg', 0.5));
                } else {
                    resolve(event.target?.result as string);
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const sanitizeSections = (sections: SectionData[]): SectionData[] => {
    if (!Array.isArray(sections)) return DEFAULT_SECTIONS;
    return sections.map(section => ({
        ...section,
        items: section.items.map(item => {
            if (item.data.href && item.data.href.startsWith('data:')) {
                // Remove existing blobs > 1MB that might have slipped through
                if (item.data.href.length > 1000000) {
                    return { ...item, data: { ...item.data, href: 'https://via.placeholder.com/400x400?text=Image+Too+Large' } };
                }
            }
            return item;
        })
    }));
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  handleReset = () => {
    try { localStorage.clear(); } catch {}
    window.location.reload();
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 font-['Inter'] text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <button onClick={this.handleReset} className="px-4 py-2 bg-red-600 text-white rounded-lg">Reset App Data</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // Use Defaults INITIALLY to ensure fast first paint
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Storage AFTER mount
  useEffect(() => {
    try {
        const rawProfile = localStorage.getItem('guide_profile');
        if (rawProfile) setProfile(JSON.parse(rawProfile));

        const rawSections = localStorage.getItem('guide_sections');
        if (rawSections) {
            const parsed = JSON.parse(rawSections);
            setSections(sanitizeSections(parsed));
        }
    } catch (e) {
        console.error("Hydration failed", e);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Save to storage
  useEffect(() => {
    if (!isLoaded) return; // Don't save default over valid data if loading isn't done
    try {
        const str = JSON.stringify(profile);
        if (str.length < 1000000) localStorage.setItem('guide_profile', str);
    } catch {}
  }, [profile, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
        const str = JSON.stringify(sections);
        // Safety check before writing
        if (str.length < 2000000) {
            localStorage.setItem('guide_sections', str);
        } else {
            console.warn("Section data too large to save");
        }
    } catch {}
  }, [sections, isLoaded]);


  const [history, setHistory] = useState<{ past: SectionData[][], future: SectionData[][] }>({
      past: [],
      future: []
  });

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [fallbackData, setFallbackData] = useState<FallbackData>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [updatingSectionId, setUpdatingSectionId] = useState<string | null>(null);
  const [showOfflineInstructions, setShowOfflineInstructions] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>('s1');

  const updateSections = useCallback((newSections: SectionData[], addToHistory = true) => {
      if (addToHistory) {
          setHistory(prev => ({
              past: [...prev.past, sections], 
              future: [] 
          }));
      }
      setSections(newSections);
  }, [sections]);

  const handleUndo = useCallback(() => {
      if (history.past.length === 0) return;
      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);
      setHistory({
          past: newPast,
          future: [sections, ...history.future]
      });
      setSections(previous);
  }, [history, sections]);

  const handleRedo = useCallback(() => {
      if (history.future.length === 0) return;
      const next = history.future[0];
      const newFuture = history.future.slice(1);
      setHistory({
          past: [...history.past, sections],
          future: newFuture
      });
      setSections(next);
  }, [history, sections]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
              e.preventDefault();
              if (e.shiftKey) handleRedo();
              else handleUndo();
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
              e.preventDefault();
              handleRedo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // --- Helpers for Geometry & Layout Logic ---
  const GRID_COLS = 4;

  const getSpan = (item: BentoItem) => {
    const styleStr = item.data.style?.mobile || '2x2';
    if (item.data.type === 'section-header') return { w: 4, h: 1 };
    
    // [rows, cols]
    const spanMap: Record<string, [number, number]> = { 
        '1x4': [1,4], // Full Width
        '2x2': [2,2], 
        '2x4': [2,4], 
        '4x2': [4,2], 
        '4x4': [4,4] 
    };
    const [h, w] = spanMap[styleStr] || [1, 1];
    return { w, h };
  };

  const clampPos = (x: number, y: number, w: number) => {
    return { x: Math.max(0, Math.min(GRID_COLS - w, x)), y: Math.max(0, y) };
  };

  const checkOverlap = (item1: BentoItem, item2: BentoItem) => {
    const pos1 = item1.position.mobile;
    const size1 = getSpan(item1);
    const pos2 = item2.position.mobile;
    const size2 = getSpan(item2);
    
    const xOverlap = Math.max(0, Math.min(pos1.x + size1.w, pos2.x + size2.w) - Math.max(pos1.x, pos2.x));
    const yOverlap = Math.max(0, Math.min(pos1.y + size1.h, pos2.y + size2.h) - Math.max(pos1.y, pos2.y));
    
    return xOverlap > 0 && yOverlap > 0;
  };

  const isSpotOccupied = (items: BentoItem[], x: number, y: number, w: number, h: number, excludeItemId?: string) => {
      return items.some(item => {
          if (excludeItemId && item.data.id === excludeItemId) return false;
          if (item.data.type === 'placeholder') return false;
          
          const pos = item.position.mobile;
          const size = getSpan(item);
          
          const xOverlap = Math.max(0, Math.min(x + w, pos.x + size.w) - Math.max(x, pos.x));
          const yOverlap = Math.max(0, Math.min(y + h, pos.y + size.h) - Math.max(y, pos.y));
          
          return xOverlap > 0 && yOverlap > 0;
      });
  };

  const findFirstEmptySpot = (items: BentoItem[], w: number, h: number, excludeId?: string) => {
     for (let y = 0; y < 200; y++) {
         for (let x = 0; x <= GRID_COLS - w; x++) {
             if (!isSpotOccupied(items, x, y, w, h, excludeId)) {
                 return { x, y };
             }
         }
     }
     return { x: 0, y: 0 };
  };

  const placeAndPush = (items: BentoItem[], fixedItemId: string) => {
    const fixedItem = items.find(i => i.data.id === fixedItemId);
    if (!fixedItem) return items;
    
    const others = items.filter(i => i.data.id !== fixedItemId && i.data.type !== 'placeholder');
    others.sort((a, b) => {
        const pa = a.position.mobile;
        const pb = b.position.mobile;
        return pa.y - pb.y || pa.x - pb.x;
    });
    
    const placedItems = [fixedItem];
    
    for (const item of others) {
        let pos = item.position.mobile;
        const size = getSpan(item);
        let { x, y } = clampPos(pos.x, pos.y, size.w);
        
        let collision = true;
        while (collision) {
             const tempItem = { ...item, position: { ...item.position } };
             tempItem.position.mobile = { x, y };
             tempItem.position.desktop = { x, y };
             collision = placedItems.some(placed => checkOverlap(tempItem, placed));
             if (collision) {
                 x++;
                 if (x + size.w > GRID_COLS) {
                     x = 0;
                     y++;
                 }
             }
        }
        item.position.mobile = { x, y };
        item.position.desktop = { x, y };
        placedItems.push(item);
    }
    return placedItems;
  };

  const getTargetSectionId = () => {
      if (activeSectionId && sections.find(s => s.id === activeSectionId)) return activeSectionId;
      if (sections.length > 0) return sections[sections.length - 1].id;
      return null;
  };

  const addItemToSection = useCallback((type: string, content: string) => {
      const targetId = getTargetSectionId();
      if (!targetId) return;

      const newSections = sections.map(section => {
          if (section.id !== targetId) return section;

          const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
          let data: BentoItemData = { id, type, style: { mobile: '2x2', desktop: '2x2' } };

          if (type === 'link') {
              data.href = content;
              data.style = { mobile: '1x4', desktop: '1x4' };
              setFallbackData(prev => ({ ...prev, [`/urlmetadata/${content}`]: { url: content, title: content } }));
          } else if (type === 'image') {
              data.href = content; data.type = 'image';
          } else if (type === 'rich-text') {
              data.content = { type: 'doc', content: [{ type: 'paragraph', content: [{ text: content, type: 'text' }] }] };
          }

          const newItem: BentoItem = { data, position: { mobile: { x: 0, y: 0 }, desktop: { x: 0, y: 0 } } };
          const styleStr = newItem.data.style?.mobile || '2x2';
          const spanMap: any = { '1x4': [1,4], '2x2': [2,2], '2x4': [2,4], '4x2': [4,2], '4x4': [4,4] };
          const [h, w] = spanMap[styleStr] || [1, 1];
          const pos = findFirstEmptySpot(section.items, w, h);
          newItem.position.mobile = pos;
          newItem.position.desktop = pos;

          return { ...section, isExpanded: true, items: [...section.items, newItem] };
      });
      updateSections(newSections);
  }, [activeSectionId, sections, updateSections]);

  const handlePointerDown = (e: React.PointerEvent, sectionId: string, itemId: string) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const section = sections.find(s => s.id === sectionId);
      const item = section?.items.find(i => i.data.id === itemId);
      if (!section || !item) return;

      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      
      setDragState({
          activeItemId: itemId,
          sourceSectionId: sectionId,
          item: item,
          offset: { x: e.clientX - rect.left, y: e.clientY - rect.top },
          current: { x: e.clientX, y: e.clientY },
          originalRect: rect
      });
  };

  useEffect(() => {
      if (!dragState) return;

      const handlePointerMove = (e: PointerEvent) => {
          setDragState(prev => prev ? { ...prev, current: { x: e.clientX, y: e.clientY } } : null);

          const elements = document.elementsFromPoint(e.clientX, e.clientY);
          const gridElement = elements.find(el => el.getAttribute('data-section-id'));
          
          if (gridElement) {
              const targetSectionId = gridElement.getAttribute('data-section-id')!;
              setSections(prev => {
                  const s = prev.find(sec => sec.id === targetSectionId);
                  if (s && !s.isExpanded) {
                      return prev.map(sec => sec.id === targetSectionId ? { ...sec, isExpanded: true } : sec);
                  }
                  return prev;
              });

              const rect = gridElement.getBoundingClientRect();
              const cellW = rect.width / GRID_COLS;
              const cellH = cellW;
              const relX = e.clientX - rect.left;
              const relY = e.clientY - rect.top;

              let x = Math.floor(relX / cellW);
              let y = Math.floor(relY / cellH);

              const styleStr = dragState.item.data.style?.mobile || '2x2';
              const spanMap: any = { '1x4': [1,4], '2x2': [2,2], '2x4': [2,4], '4x2': [4,2], '4x4': [4,4] };
              let [h, w] = [1, 1];
              if (dragState.item.data.type === 'section-header') w = 4;
              else [h, w] = spanMap[styleStr] || [1, 1];

              x = Math.max(0, Math.min(x, GRID_COLS - w)); 
              y = Math.max(0, y);

              setDropPreview({ sectionId: targetSectionId, x, y, w, h });
          } else {
              setDropPreview(null);
          }
      };

      const handlePointerUp = (e: PointerEvent) => {
          if (dragState && dropPreview) {
              setSections(prevSections => {
                  const sourceSectionIndex = prevSections.findIndex(s => s.id === dragState.sourceSectionId);
                  const targetSectionIndex = prevSections.findIndex(s => s.id === dropPreview.sectionId);
                  
                  if (sourceSectionIndex === -1 || targetSectionIndex === -1) return prevSections;

                  const newSections = [...prevSections];
                  const sourceSection = { ...newSections[sourceSectionIndex], items: [...newSections[sourceSectionIndex].items] };
                  const targetSection = (sourceSectionIndex === targetSectionIndex) 
                      ? sourceSection : { ...newSections[targetSectionIndex], items: [...newSections[targetSectionIndex].items] };
                  
                  const itemIndex = sourceSection.items.findIndex(i => i.data.id === dragState.activeItemId);
                  if (itemIndex === -1) return prevSections;

                  const movingItem = { ...sourceSection.items[itemIndex] };
                  movingItem.position = { 
                      mobile: { ...movingItem.position.mobile }, 
                      desktop: { ...movingItem.position.desktop }
                  };

                  sourceSection.items.splice(itemIndex, 1);
                  movingItem.position.mobile = { x: dropPreview.x, y: dropPreview.y };
                  movingItem.position.desktop = { x: dropPreview.x, y: dropPreview.y };
                  targetSection.items.push(movingItem);
                  targetSection.items = placeAndPush(targetSection.items, movingItem.data.id);

                  newSections[sourceSectionIndex] = sourceSection;
                  newSections[targetSectionIndex] = targetSection;
                  
                  setTimeout(() => updateSections(newSections, true), 0);
                  return newSections;
              });
          }
          setDragState(null);
          setDropPreview(null);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
      };
  }, [dragState, dropPreview, sections, updateSections]);

  // FIXED: Correctly clamp item position when resizing to prevent overflow/clipping
  const handleItemResize = (sectionId: string, itemId: string, newDimension: string) => {
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;
      
      const newSections = [...sections];
      const section = { ...newSections[sectionIndex], items: [...newSections[sectionIndex].items] };
      
      const itemIndex = section.items.findIndex(i => i.data.id === itemId);
      if (itemIndex === -1) return;
      
      const item = { 
          ...section.items[itemIndex], 
          data: { ...section.items[itemIndex].data },
          position: { 
              mobile: { ...section.items[itemIndex].position.mobile },
              desktop: { ...section.items[itemIndex].position.desktop }
          }
      };
      
      // Update dimensions
      item.data.style = { mobile: newDimension, desktop: newDimension };
      
      // Determine new width in columns
      const spanMap: Record<string, [number, number]> = { 
          '1x4': [1,4], '2x2': [2,2], '2x4': [2,4], '4x2': [4,2], '4x4': [4,4] 
      };
      let [h, w] = spanMap[newDimension] || [1, 1];
      if (item.data.type === 'section-header') w = 4;
      
      // Clamp X position so item fits on the grid. 
      // e.g., if x=2 and new width is 4, new x MUST be 0.
      const newX = Math.max(0, Math.min(GRID_COLS - w, item.position.mobile.x));
      
      item.position.mobile.x = newX;
      item.position.desktop.x = newX;

      section.items[itemIndex] = item;
      
      // Re-layout other items around this one
      section.items = placeAndPush(section.items, itemId);
      
      newSections[sectionIndex] = section;
      updateSections(newSections, true);
  };

  useEffect(() => {
      const handlePaste = (e: ClipboardEvent) => {
          if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
          const clipboardData = e.clipboardData;
          if (!clipboardData) return;
          if (clipboardData.files && clipboardData.files.length > 0) {
              const file = clipboardData.files[0];
              if (file.type.startsWith('image/')) {
                  e.preventDefault();
                  compressImage(file).then(base64 => addItemToSection('image', base64));
              }
              return;
          }
          const text = clipboardData.getData('text');
          if (text) {
              e.preventDefault();
              const isUrl = /^(http|https):\/\/[^ "]+$/.test(text);
              if (isUrl) {
                  if (text.match(/\.(jpeg|jpg|gif|png)$/) != null) addItemToSection('image', text);
                  else addItemToSection('link', text);
              } else addItemToSection('rich-text', text);
          }
      };
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
  }, [addItemToSection]);

  const handleLocationSelect = useCallback((location: LocationData) => {
    let newSections: SectionData[] = [];
    if (updatingSectionId) {
        newSections = sections.map(s => s.id === updatingSectionId ? { ...s, title: location.name, locationData: location } : s);
        setUpdatingSectionId(null);
    } else {
        const newSection: SectionData = {
            id: Date.now().toString(),
            type: 'gmap_location',
            visualType: 'place',
            title: location.name,
            locationData: location,
            isExpanded: true,
            items: []
        };
        newSections = [...sections, newSection];
        setActiveSectionId(newSection.id);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }
    updateSections(newSections);
    setIsSearchOpen(false);
  }, [sections, updatingSectionId, updateSections]);

  const toggleSection = useCallback((id: string) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s));
      setActiveSectionId(id); 
  }, []);
  
  const handleRenameSection = useCallback((id: string, newTitle: string) => {
    const newSections = sections.map(s => s.id === id ? { ...s, title: newTitle } : s);
    updateSections(newSections);
    setEditingSectionId(null);
  }, [sections, updateSections]);

  const handleDeleteSection = useCallback((id: string) => {
      if (window.confirm("Are you sure you want to delete this section?")) {
        const newSections = sections.filter(s => s.id !== id);
        updateSections(newSections);
      }
  }, [sections, updateSections]);

  const handleGridItemsChange = useCallback((sectionId: string, newItems: BentoItem[]) => {
      const newSections = sections.map(s => s.id === sectionId ? { ...s, items: newItems } : s);
      updateSections(newSections);
  }, [sections, updateSections]);

  const handleGridItemDelete = useCallback((sectionId: string, itemId: string) => {
      const newSections = sections.map(s => {
          if (s.id !== sectionId) return s;
          return { ...s, items: s.items.filter(i => i.data.id !== itemId) };
      });
      updateSections(newSections);
  }, [sections, updateSections]);

  const handleSaveOffline = () => { setActiveMenuId(null); window.print(); };
  const handleShare = async () => { /* ... */ };
  const validLocations = useMemo(() => { return sections.filter(s => s.type === 'gmap_location' && s.locationData).map(s => s.locationData!); }, [sections]);
  const handleOpenMultiMap = () => { /* ... */ };

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 pb-32 font-['Inter']">
      <GuideHeader 
        title="Havelock like a Local 🌴"
        rating="4.94"
        updatedDate="Apr 2024"
        profileName={profile.name}
        profileImage={profile.image}
        profileDesc={profile.desc}
        onOpenMap={handleOpenMultiMap}
        onSaveOffline={handleSaveOffline}
        onShare={handleShare}
        hasLocations={validLocations.length > 0}
      />

      {dragState && (
          <div 
            className="fixed z-[9999] pointer-events-none"
            style={{ 
                left: dragState.current.x - dragState.offset.x, 
                top: dragState.current.y - dragState.offset.y,
                width: dragState.originalRect.width,
                height: dragState.originalRect.height
            }}
          >
              <BentoItemComponent 
                item={dragState.item}
                fallback={fallbackData}
                isMobile={true}
                onResize={() => {}} 
                onDelete={() => {}}
                onPointerDown={() => {}}
                isDraggingSource={false}
                isOverlay={true}
              />
          </div>
      )}

      <div className="w-full max-w-md mx-auto px-4 mt-6 space-y-4">
          {sections.map(section => (
              <div 
                key={section.id} 
                className={`break-inside-avoid relative rounded-xl border border-transparent ${section.type === 'gmap_location' ? 'bg-white' : ''} ${activeSectionId === section.id ? 'ring-1 ring-blue-50' : ''}`}
                onClick={() => setActiveSectionId(section.id)} 
              >
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                    className="flex items-center justify-between py-2 px-2 cursor-pointer group select-none hover:bg-gray-50 rounded-xl transition-colors mb-1 relative"
                  >
                      <div className="flex items-center gap-0 flex-1">
                            <GuideVisual items={section.items} fallback={fallbackData} isExpanded={section.isExpanded} />
                            
                            {editingSectionId === section.id ? (
                                <input 
                                    className="w-full bg-transparent text-[16px] font-semibold text-gray-900 border-b-2 border-black outline-none py-0.5"
                                    defaultValue={section.title}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSection(section.id, e.currentTarget.value);
                                    }}
                                    onBlur={(e) => handleRenameSection(section.id, e.currentTarget.value)}
                                    autoFocus
                                />
                            ) : (
                                <div className="flex items-center gap-2 relative">
                                    <span className="text-[16px] font-semibold text-gray-900 group-hover:text-black">
                                        {section.title || "Untitled Section"}
                                    </span>
                                    <button 
                                        className={`p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition-all print:hidden ${activeMenuId === section.id ? 'opacity-100 bg-gray-200 text-black' : 'opacity-0 group-hover:opacity-100'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === section.id ? null : section.id);
                                        }}
                                        title="Edit Section"
                                    >
                                        <PencilIcon className="w-3.5 h-3.5" />
                                    </button>
                                    {activeMenuId === section.id && (
                                        <div className="absolute top-8 left-0 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left print:hidden">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSectionId(section.id);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <span className="text-gray-400">✏️</span> Rename
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUpdatingSectionId(section.id);
                                                    setIsSearchOpen(true);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <span className="text-gray-400">📍</span> Change Location
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSection(section.id);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                    <DeleteIcon /> Delete Section
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                            {section.type === 'gmap_location' && section.locationData && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${section.locationData.lat},${section.locationData.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 text-gray-400 hover:text-black transition-colors"
                                >
                                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </a>
                            )}
                      </div>
                  </div>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden print:overflow-visible print:max-h-none print:opacity-100 ${section.isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
                      <div className={`transition-all duration-300 ${section.items.length === 0 ? 'pb-4' : 'pb-10'} px-1`}>
                         <BentoGrid 
                            sectionId={section.id}
                            items={section.items} 
                            fallback={fallbackData}
                            onItemsChange={(items) => handleGridItemsChange(section.id, items)}
                            onItemResize={(itemId, newDim) => handleItemResize(section.id, itemId, newDim)}
                            onDelete={(itemId) => handleGridItemDelete(section.id, itemId)}
                            draggingItemId={dragState?.activeItemId}
                            dropPreview={(dropPreview?.sectionId === section.id) ? dropPreview : null}
                            onItemPointerDown={handlePointerDown}
                            isMobileViewForced={true} 
                         />
                         
                         {section.items.length === 0 && (
                            <div className="py-4 px-4 text-sm text-gray-400 italic bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                                Empty section. Paste images/links or use the toolbar.
                            </div>
                        )}
                      </div>
                  </div>
              </div>
          ))}

          <button 
              onClick={() => { setUpdatingSectionId(null); setIsSearchOpen(true); }}
              className="group w-full py-4 mt-8 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer print:hidden"
          >
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <span className="text-gray-500 font-bold text-lg leading-none mb-0.5">+</span>
              </div>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-600">Add New Place</span>
          </button>
      </div>
      
      <div className="print:hidden">
        <FloatingToolbar 
            onAddLink={(url) => addItemToSection('link', url)} 
            onAddText={(text) => addItemToSection('rich-text', text)} 
            onAddSectionTitle={() => { setUpdatingSectionId(null); setIsSearchOpen(true); }} 
            onAddImage={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        compressImage(file).then(base64 => {
                             addItemToSection('image', base64);
                        }).catch(err => console.error(err));
                    }
                };
                input.click();
            }} 
        />
      </div>

      <LocationSearchModal 
        isOpen={isSearchOpen}
        onClose={() => { setIsSearchOpen(false); setUpdatingSectionId(null); }}
        onSelect={handleLocationSelect}
      />
      
      <OfflineInstructionModal 
        isOpen={showOfflineInstructions}
        onClose={() => setShowOfflineInstructions(false)}
      />
      
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
