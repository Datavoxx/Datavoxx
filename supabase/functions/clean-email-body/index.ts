import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailBody } = await req.json();

    if (!emailBody) {
      return new Response(
        JSON.stringify({ error: "emailBody is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du är en e-postformaterare. Din uppgift är att ta emot rå e-postinnehåll som kan innehålla HTML, CSS, MIME-headers, base64-kodning, och annan teknisk "skräp".

Extrahera ENDAST det faktiska meddelandet från avsändaren och returnera det i ett rent, läsbart format.

Regler:
- Ta bort ALL HTML, CSS, JavaScript och styling
- Ta bort MIME-headers och teknisk metadata
- Ta bort kodrader och base64-innehåll
- Behåll avsändarens ursprungliga budskap intakt
- Formatera texten snyggt med radbrytningar där det passar
- Om mejlet innehåller en signatur, behåll den separat i slutet
- Svara ENDAST med det städade meddelandet, ingen förklaring`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Städa upp följande e-postmeddelande:\n\n${emailBody}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const cleanedBody = data.choices?.[0]?.message?.content || emailBody;

    console.log("Email body cleaned successfully");

    return new Response(
      JSON.stringify({ cleanedBody }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in clean-email-body:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
