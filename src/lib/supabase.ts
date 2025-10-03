import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file or deployment settings.');
}

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
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
    }
  }
});

// Advanced image cache with localStorage persistence
class ImageCacheManager {
  private memoryCache = new Map<string, string>();
  private cachePrefix = 'parish_img_cache_';

  constructor() {
    this.cleanExpiredCache();
  }

  private cleanExpiredCache() {
    try {
      const now = Date.now();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.cachePrefix)) {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (now - data.timestamp > this.maxCacheAge) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  getCachedUrl(originalUrl: string, options?: { width?: number; height?: number; quality?: number }): string {
    const cacheKey = `${originalUrl}_${JSON.stringify(options || {})}`;
    
    // Check memory cache first
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // Check localStorage cache
    try {
      const storageKey = this.cachePrefix + btoa(cacheKey).slice(0, 50);
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.maxCacheAge) {
          this.memoryCache.set(cacheKey, data.url);
          return data.url;
        }
      }
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    // Generate optimized URL
    const optimizedUrl = this.getOptimizedImageUrl(originalUrl, options?.width, options?.height, options?.quality);
    
    // Cache the result
    this.memoryCache.set(cacheKey, optimizedUrl);
    try {
      const storageKey = this.cachePrefix + btoa(cacheKey).slice(0, 50);
      localStorage.setItem(storageKey, JSON.stringify({
        url: optimizedUrl,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Cache write failed:', error);
    }

    return optimizedUrl;
  }

  private getOptimizedImageUrl(url: string, width?: number, height?: number, quality: number = 75): string {
    if (!url) return url;
    
    // Don't optimize external URLs or already optimized URLs
    if (!url.includes('supabase') || url.includes('?')) return url;
    
    const params = new URLSearchParams();
    if (width) params.append('width', Math.min(width, 800).toString()); // REDUZIDO: Max width 800px
    if (height) params.append('height', Math.min(height, 600).toString()); // REDUZIDO: Max height 600px
    params.append('quality', Math.min(quality, 40).toString()); // REDUZIDO: Max quality 40%
    params.append('format', 'webp');
    params.append('resize', 'cover');
    
    return `${url}?${params.toString()}`;
  }
}

// Global cache instance
const imageCache = new ImageCacheManager();

// Export optimized functions
export const getCachedImageUrl = (originalUrl: string, options?: { width?: number; height?: number; quality?: number }) => {
  // FORÇAR qualidade baixa se não especificada
  const optimizedOptions = {
    ...options,
    quality: Math.min(options?.quality || 30, 30), // Máximo 30% de qualidade
    width: options?.width ? Math.min(options.width, 600) : undefined, // Máximo 600px
    height: options?.height ? Math.min(options.height, 600) : undefined // Máximo 600px
  };
  
  return imageCache.getCachedUrl(originalUrl, optimizedOptions);
};

// Preload critical images
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// Batch preload images
export const preloadImages = async (urls: string[], maxConcurrent = 2): Promise<void> => {
  // REDUZIDO: maxConcurrent de 3 para 2 para economizar bandwidth
  const chunks = [];
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    chunks.push(urls.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(preloadImage));
  }
};

// Database types
export interface Parish {
  id: string;
  name: string;
  history: string;
  founded_year: number;
  address: string;
  phone: string;
  landline_phone?: string | null;
  whatsapp_phone?: string | null;
  email: string;
  logo_url: string | null;
  cloudinary_public_id?: string | null;
  confession_hours?: string | null;
  spiritual_direction_hours?: string | null;
  office_hours?: string | null;
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
  album_id: string | null;
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
  button_text?: string | null;
  button_link?: string | null;
  button_link_type?: 'internal' | 'external' | null;
  button_open_new_tab?: boolean | null;
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
  flyer_url: string | null;
  whatsapp_contact: string | null;
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

export interface Celebration {
  id: string;
  community_name: string;
  celebrant_name: string;
  celebration_type: 'Missa' | 'Celebração';
  time: string;
  day_of_week: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UrgentPopup {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  cloudinary_public_id: string | null;
  link_url: string | null;
  link_text: string;
  is_active: boolean;
  priority: number;
  auto_close_seconds: number;
  created_at: string;
  updated_at: string;
}
export interface Pastoral {
  id: string;
  name: string;
  coordinator: string;
  description: string;
  contact_phone: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoAlbum {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  cloudinary_public_id: string | null;
  is_active: boolean;
  order_index: number;
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
  album_id: string | null;
  created_at: string;
}
