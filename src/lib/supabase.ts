import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  }
});

// Image optimization helper
export const getOptimizedImageUrl = (url: string, width?: number, height?: number, quality: number = 80) => {
  if (!url || !url.includes('supabase')) return url;
  
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('format', 'webp');
  
  return `${url}?${params.toString()}`;
};

// Cache management
const imageCache = new Map<string, string>();

export const getCachedImageUrl = (originalUrl: string, options?: { width?: number; height?: number; quality?: number }) => {
  const cacheKey = `${originalUrl}_${JSON.stringify(options || {})}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  const optimizedUrl = getOptimizedImageUrl(
    originalUrl, 
    options?.width, 
    options?.height, 
    options?.quality || 80
  );
  
  imageCache.set(cacheKey, optimizedUrl);
  return optimizedUrl;
};

// Database types
export interface Parish {
  id: string;
  name: string;
  history: string;
  founded_year: number;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  cloudinary_public_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  cloudinary_public_id: string | null;
  category: 'history' | 'events' | 'celebrations' | 'community';
  created_at: string;
}

export interface Slide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  cloudinary_public_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  author: string;
  is_published: boolean;
  cloudinary_public_id: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  day_of_week: string;
  time: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface ParishAnnouncement {
  id: string;
  type: 'event' | 'announcement';
  title: string;
  content: string;
  event_date: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Priest {
  id: string;
  name: string;
  title: string;
  photo_url: string | null;
  cloudinary_public_id?: string | null;
  short_bio: string;
  full_bio: string;
  ordination_year: number | null;
  parish_since: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}