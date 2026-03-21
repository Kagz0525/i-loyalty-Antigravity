import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log('Webhook payload received:', payload);
    
    // Webhook verification hurdle note: Use PEACH_WEBHOOK_SECRET to ensure 
    // the request actually originated from Peach Payments.
    // e.g. using crypto.subtle.verify or an HMAC
    
    // For standard Peach Payments payload:
    const checkoutId = payload.checkoutId || payload.id;
    let status = payload.result?.description === 'Transaction succeeded' ? 'successful' : 'failed';
    
    // Common successful Peach codes start with 000.000., 000.100., 000.3
    if (/^(000\.000\.|000\.100\.1|000\.3)/.test(payload.result?.code)) {
        status = 'successful'; 
    }

    if (checkoutId) {
      // Connect specifically bypassing RLS because webhooks are backend-backend
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Execute update query against the SQL table
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ status })
        .eq('checkout_id', checkoutId);

      if (error) {
        console.error('Supabase DB Update failed:', error.message);
      } else {
        console.log(`Successfully updated transaction ${checkoutId} to status ${status}`);
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});
