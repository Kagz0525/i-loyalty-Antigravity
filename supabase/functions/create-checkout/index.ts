import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

// Mandatory CORS headers as per past hurdles
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight securely
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user from the Authorization header using the Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Default payload matching required format
    const { amount = 99.00, currency = 'ZAR' } = await req.json();

    const clientId = Deno.env.get('PEACH_CLIENT_ID');
    const clientSecret = Deno.env.get('PEACH_CLIENT_SECRET');
    const entityId = Deno.env.get('PEACH_ENTITY_ID');

    // Step A: Exchange Client Credentials for Access Token
    const tokenRes = await fetch('https://sandbox.peachpayments.com/api/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        merchantId: entityId
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`Failed to get Peach access token: ${JSON.stringify(tokenData)}`);
    }
    const accessToken = tokenData.access_token;

    // Step B: Create Checkout Instance
    // Define the return URL (must be valid in Peach config)
    const shopperResultUrl = `${req.headers.get('origin') || 'https://sandbox.peachpayments.com'}/checkout-success`;
    const nonce = crypto.randomUUID();

    const checkoutPayload = {
      entityId,
      amount: parseFloat(amount).toFixed(2),
      currency,
      paymentType: 'DB', // DB represents standard Debit/Credit payment
      nonce,
      shopperResultUrl
    };

    const checkoutRes = await fetch('https://sandbox.peachpayments.com/v2/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(checkoutPayload)
    });

    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok || !checkoutData.checkoutId) {
       throw new Error(`Failed to create checkout: ${JSON.stringify(checkoutData)}`);
    }

    // Note: Store the transaction quickly in Supabase using the Service Role Key bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      checkout_id: checkoutData.checkoutId,
      amount,
      status: 'pending'
    });

    // Return the checkout ID successfully
    return new Response(JSON.stringify({ checkoutId: checkoutData.checkoutId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
