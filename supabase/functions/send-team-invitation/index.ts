import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, role } = await req.json();

    // Get the user making the request
    const authHeader = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader);

    if (userError || !user) {
      throw new Error("Invalid user");
    }

    // Generate a unique token for the invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create the invitation
    const { error: inviteError } = await supabaseClient
      .from("team_invitations")
      .insert({
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (inviteError) {
      throw inviteError;
    }

    // Send the invitation email using the Resend API
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const inviteUrl = `${req.headers.get("origin")}/accept-invite?token=${token}`;
    
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Team Invites <onboarding@resend.dev>",
        to: [email],
        subject: "You've been invited to join the team",
        html: `
          <h1>Team Invitation</h1>
          <p>You've been invited to join the team with the role of ${role}.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${inviteUrl}">${inviteUrl}</a>
          <p>This invitation will expire in 7 days.</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      throw new Error("Failed to send email");
    }

    return new Response(
      JSON.stringify({ message: "Invitation sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});