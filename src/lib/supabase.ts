import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: 'history' | 'events' | 'celebrations' | 'community';
  created_at: string;
}

export interface Slide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}