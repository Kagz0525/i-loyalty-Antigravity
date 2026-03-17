import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oszuytcchfqclyrjuhmq.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ozLY25gCI6-f45A_PMrr-A_4iXTKRI_";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function check() {
  console.log('--- Profiles ---');
  const { data: profiles } = await supabase.from('profiles').select('*').eq('email', 'customer@iloyalty.co.za');
  console.log(profiles);

  console.log('\n--- Customers ---');
  const { data: customers } = await supabase.from('customers').select('*').eq('email', 'customer@iloyalty.co.za');
  console.log(customers);

  console.log('\n--- Loyalty Records ---');
  // Find loyalty records by customer email indirectly
  if (profiles && profiles.length > 0) {
    const { data: pr } = await supabase.from('loyalty_records').select('*').eq('customer_id', profiles[0].id);
    console.log(`from profiles id ${profiles[0].id}:`, pr);
  }
  if (customers && customers.length > 0) {
    const { data: cr } = await supabase.from('loyalty_records').select('*').eq('customer_id', customers[0].id);
    console.log(`from customers id ${customers[0].id}:`, cr);
  }
}

check().catch(console.error);
