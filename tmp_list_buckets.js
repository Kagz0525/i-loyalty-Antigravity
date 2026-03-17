import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Bucket list error:', error);
  } else {
    console.log('Buckets:', data);
  }
}

listBuckets().catch(console.error);
