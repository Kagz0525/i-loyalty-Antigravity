import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }});
  }

  try {
    const payload = await req.json();

    // The webhook sends the deleted row in `old_record`
    const record = payload.old_record;
    
    if (!record || !record.email) {
      console.error("No email found in deleted record:", record);
      return new Response("No email found", { status: 400 });
    }

    const name = record.name || "Customer";
    const email = record.email;
    const deletionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #ea580c; text-align: center;">Account Deleted</h1>
        <p>Hi ${name},</p>
        <p>This is a confirmation that your i-loyalty account was successfully deleted on <strong>${deletionDate}</strong>.</p>
        <p>As per our Privacy Policy, your personal profile data has been permanently removed from our active database.</p>
        <p>We are sorry to see you go! If you ever wish to return, you can always sign up again.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">i-loyalty Team</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "i-loyalty <noreply@iloyalty.co.za>",
        to: [email],
        subject: "Your i-loyalty account has been deleted",
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
    console.error("Error sending deletion email:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
