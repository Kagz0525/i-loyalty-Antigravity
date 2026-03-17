import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function testUploadNoUpsert() {
  console.log('--- Signing in as customer ---');
  const { data: custAuth, error: custErr } = await supabase.auth.signInWithPassword({
    email: 'customer@iloyalty.co.za',
    password: '123456'
  });
  
  if (custErr) { console.error('Sign-in failed:', custErr); return; }

  console.log('--- Attempting Upload without upsert ---');
  const fileContent = new Blob(['Hello, world!'], { type: 'text/plain' });
  const fileName = `profile_pics/${custAuth.user.id}-test3-${Date.now()}.txt`;

  const { data, error } = await supabase.storage
    .from('Send_My_Task_Assets')
    .upload(fileName, fileContent, {
      cacheControl: '3600',
      upsert: false // testing this
    });

  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload success:', data);
  }
}

testUploadNoUpsert().catch(console.error);
