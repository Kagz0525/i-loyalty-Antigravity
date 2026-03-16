import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and public API key
const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
