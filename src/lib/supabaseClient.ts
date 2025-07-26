import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://poxkkgxonmzdhizzworc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is required. Please add it to your .env file.');
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 