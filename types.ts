
export interface BioContent {
  type: string;
  content?: { text: string; type: string }[];
}

export interface BentoItemData {
  id: string;
  href?: string;
  type: string;
  style?: {
    mobile?: string;
    desktop?: string;
  };
  overrides?: {
    title?: {
      type: string;
      content: {
        type: string;
        content: { text: string; type: string }[];
      }[];
    };
    mapPlace?: string;
    mapCaption?: string;
  };
  title?: {
    type: string;
    content: {
        type: string;
        content: { text: string; type: string; }[];
    }[];
  };
  content?: {
    type: string;
    content: {
        type: string;
        content: { text: string; type: string; }[];
    }[];
  };
}

export interface BentoItem {
  data: BentoItemData;
  position: {
    mobile: { x: number; y: number };
    desktop: { x: number; y: number };
  };
}

// FIX: Make properties optional to match the shape of the data in `data.ts`.
// The type was too strict, requiring properties that are sometimes missing from the fallback data.
export interface UrlMetadata {
  url?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  faviconUrl?: string | null;
  [key: string]: any;
}

export interface SpotifyRichData {
    name: string;
    thumbnail: string;
    artistName: string;
}

export interface InstagramRichData {
    followers: number;
    userName:string;
}

export interface TwitterRichData {
    userName: string;
    handle: string;
}

export interface RichData {
    url: string;
    data: SpotifyRichData | InstagramRichData | TwitterRichData | Record<string, any>;
    status: string;
}

export interface FallbackData {
  [key: string]: UrlMetadata | RichData;
}