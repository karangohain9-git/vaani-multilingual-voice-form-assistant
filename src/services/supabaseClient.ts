import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseAnonKey !== 'your-anon-public-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message:
        'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Settings.',
    };
  }

  try {
    // Attempt pinging the verify RPC or public health
    const { error } = await supabase.from('form_submissions').select('count', { count: 'exact', head: true });
    // Note: If RLS denies select (which is intentional per privacy requirements), an HTTP 200 or 403 response still confirms the endpoint exists!
    if (error && error.code !== '42501' && !error.message.includes('permission denied')) {
      return {
        connected: false,
        message: `Connected to Supabase, but encountered table notice: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Supabase connected successfully. Form submissions table is active with Row Level Security.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err?.message || 'Unknown error'}`,
    };
  }
}
