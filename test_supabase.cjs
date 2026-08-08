const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function test() {
  console.log("Making a raw fetch request without a JWT token...");
  const response = await fetch('https://oszuytcchfqclyrjuhmq.supabase.co/functions/v1/send-reward-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'UPDATE', record: { reward_code: 'TEST' }, old_record: {} })
  });

  console.log('Status:', response.status);
  console.log('Text:', await response.text());
}
test();
test();
