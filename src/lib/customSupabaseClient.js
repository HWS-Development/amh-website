import { createClient } from '@supabase/supabase-js';

// Read Supabase config from Vite env vars.
// Ensure you define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast in dev to make missing env obvious
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars not set: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
