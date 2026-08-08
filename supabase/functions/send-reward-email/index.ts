import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    const payload = await req.json();

    // Check if this is an update event
    if (payload.type !== "UPDATE") {
      return new Response("Not an update event", { status: 200 });
    }

    const { record, old_record } = payload;

    // We only care if reward_code just got generated (was null, now has a value)
    if (!record.reward_code || old_record.reward_code === record.reward_code) {
      return new Response("No new reward code generated", { status: 200 });
    }

    // Initialize Supabase Client using the built-in Edge Function environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing payload for customer_id:", record.customer_id);

    // Fetch customer details from profiles table first (for registered users)
    let { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", record.customer_id)
      .single();

    // If not found in profiles, they might be a manually added customer in the legacy 'customers' table
    if (!customer) {
      console.log("Not found in profiles, checking legacy customers table...");
      const { data: legacyCustomer } = await supabase
        .from("customers")
        .select("name, email")
        .eq("id", record.customer_id)
        .single();
      
      customer = legacyCustomer;
    }

    if (!customer?.email) {
      console.error("Customer not found or has no email. CustomerData:", customer, "CustomerID:", record.customer_id);
      return new Response("Customer missing email", { status: 400 });
    }

    // Fetch vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from("profiles")
      .select("business_name, name")
      .eq("id", record.vendor_id)
      .single();

    if (vendorError) {
      console.error("Supabase Error fetching vendor:", vendorError);
    }

    if (!vendor) {
      console.warn("Vendor not found for id:", record.vendor_id, "- continuing with default name");
    }

    const businessName = vendor?.business_name || vendor?.name || "A Partner Business";
    let rewardDescription = "a freebie";

    // Build Email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #ea580c; text-align: center;">You earned a reward! 🎉</h1>
        <p>Hi ${customer.name || 'there'},</p>
        <p>Congratulations! You just earned enough points at <strong>${businessName}</strong> to receive <strong>${rewardDescription}</strong>.</p>
        <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
          <p style="margin: 0; font-size: 16px; color: #666;">Your Reward Code</p>
          <h2 style="margin: 10px 0 0 0; font-size: 32px; color: #ea580c; letter-spacing: 4px;">${record.reward_code}</h2>
        </div>
        <p>Show this code to the staff at ${businessName} on your next visit to redeem your reward.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Powered by i-loyalty</p>
      </div>
    `;

    // Send email via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "i-loyalty Rewards <rewards@iloyalty.co.za>", // Ensure you have verified this domain in Resend
        to: [customer.email],
        subject: `Your reward from ${businessName} is ready! 🎁`,
        html: html,
      }),
    });

    const resendData = await resendRes.json();
    console.log("Resend response:", resendData);

    return new Response(JSON.stringify(resendData), {
      headers: { "Content-Type": "application/json" },
      status: resendRes.ok ? 200 : 400,
    });

  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
