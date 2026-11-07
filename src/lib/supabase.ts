import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

export const supabase = supabaseInstance;

/**
 * Returns configuration status details for diagnosis and setup guidance.
 */
export function getSupabaseStatus() {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl || 'Not configured',
    hasAnonKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')),
  };
}
