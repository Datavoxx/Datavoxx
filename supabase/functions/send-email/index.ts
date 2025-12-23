import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  messageId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Autentisering krävs. Logga in igen." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Kunde inte verifiera användare. Logga in igen." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email for user: ${user.id}`);

    // Get the user's email credentials from the database
    const { data: credentials, error: credError } = await supabase
      .from("email_credentials")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credError) {
      console.error("Error fetching credentials:", credError);
      return new Response(
        JSON.stringify({ error: "Kunde inte hämta e-postuppgifter." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!credentials) {
      console.log("No email credentials found for user");
      return new Response(
        JSON.stringify({ error: "Du har inte kopplat någon e-post ännu." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, body, inReplyTo }: SendEmailRequest = await req.json();

    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);

    const smtpHost = credentials.smtp_host || credentials.imap_host.replace("imap.", "smtp.");
    const smtpPort = credentials.smtp_port || 465;
    const smtpUser = credentials.imap_username;
    const smtpPass = credentials.imap_password;

    console.log(`Connecting to SMTP host: ${smtpHost}:${smtpPort}`);

    // Connect using implicit TLS (SMTPS) on port 465
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    // Build email with proper reply headers
    const emailSubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;

    const headers: Record<string, string> = {};
    if (inReplyTo) {
      headers["In-Reply-To"] = inReplyTo;
      headers["References"] = inReplyTo;
    }

    console.log("Sending email via SMTP...");

    try {
      await client.send({
        from: smtpUser,
        to: to,
        subject: emailSubject,
        content: body,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
    } finally {
      try {
        await client.close();
      } catch (closeErr) {
        console.warn("SMTP close error:", closeErr);
      }
    }

    console.log("Email sent successfully!");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});