import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function testUpload() {
  console.log('--- Signing in as customer ---');
  const { data: custAuth, error: custErr } = await supabase.auth.signInWithPassword({
    email: 'customer@iloyalty.co.za',
    password: '123456'
  });
  
  if (custErr) { console.error('Sign-in failed:', custErr); return; }
  console.log('Customer auth ID:', custAuth.user.id);

  console.log('--- Attempting Upload ---');
  const fileContent = new Blob(['Hello, world!'], { type: 'text/plain' });
  const fileName = `profile_pics/${custAuth.user.id}-test.txt`;

  const { data, error } = await supabase.storage
    .from('Send_My_Task_Assets')
    .upload(fileName, fileContent, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload success:', data);
  }
}

testUpload().catch(console.error);
