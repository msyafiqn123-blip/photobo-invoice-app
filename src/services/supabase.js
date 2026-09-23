import { createClient } from '@supabase/supabase-js';

// Get keys from environment or localStorage for in-app configuration
export const getSupabaseConfig = () => {
  const savedUrl = localStorage.getItem('photobo_supabase_url');
  const savedKey = localStorage.getItem('photobo_supabase_key');
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    url: savedUrl || envUrl || '',
    key: savedKey || envKey || '',
  };
};

let supabaseInstance = null;

export const getSupabase = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (err) {
      console.error('Supabase init error:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
