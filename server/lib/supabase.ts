import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("SUPABASE_URL or SUPABASE_ANON_KEY missing. Supabase features will be disabled.");
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to check if Supabase is fully configured
export const isSupabaseConfigured = () => !!supabase;
