import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create the client if we have keys, or if we are not in a build step where they might be missing.
// However, createClient throws if key is empty.
// We'll export a "getSupabase" function or just use a fallback to prevent build crash.

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder'); // Fallback for build time

