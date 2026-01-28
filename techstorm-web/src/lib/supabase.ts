import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Standard client for client-side / restricted operations
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase; // Fallback to standard if service key missing


