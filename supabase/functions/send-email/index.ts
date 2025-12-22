import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const { to, subject, body, inReplyTo }: SendEmailRequest = await req.json();

    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpUser = Deno.env.get("IMAP_USER");
    const smtpPass = Deno.env.get("IMAP_PASS");

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Missing SMTP configuration");
    }

    console.log(`Connecting to SMTP host: ${smtpHost}`);

    // Use STARTTLS approach for One.com (port 587)
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: 587,
        tls: false, // Start without TLS, use STARTTLS
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

    await client.send({
      from: smtpUser,
      to: to,
      subject: emailSubject,
      content: body,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });

    await client.close();

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
