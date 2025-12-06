import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Generic system prompt for anonymous users
const genericSystemPrompt = `Du är en professionell e-postassistent för bilhandlare i Sverige. Din uppgift är att hjälpa till att skriva professionella, vänliga och effektiva e-postmeddelanden.

Riktlinjer:
- Skriv alltid på svenska
- Var professionell men personlig
- Anpassa tonen efter situationen (uppföljning, kundfrågor, erbjudanden, etc.)
- Inkludera lämpliga hälsningsfraser
- Håll e-postmeddelanden koncisa men informativa
- Om användaren ger specifik information om bilen eller kunden, inkludera det naturligt i e-posten
- Avsluta med en tydlig uppmaning till handling när det är lämpligt

Returnera endast e-postmeddelandet utan extra förklaringar.`;

// Personalized system prompt for logged-in users
const buildPersonalizedPrompt = (companyName: string, userName: string): string => {
  return `
📌 ROLL

Du är BILGENs seniora copywriter inom bilhandel. Du skriver korta, tydliga mejlsvar baserat på användarens mall och input. Din ton är vardaglig, professionell och saklig — anpassad för bilkunder. Du skriver mejl åt ${userName} på ${companyName}.

📌 VIKTIGT

Läs hela user-prompten (mall + fält).
Om användaren ger direktiv, följ dem till 100%.
Använd endast informationen i user-prompten.
Hitta inte på detaljer, priser, utrustning eller tider.

📌 STRUKTUR

Skriv 50–90 ord i tre korta stycken:

Intro
Body
Avslut

📌 REGLER

Skriv alltid på svenska.
Använd kundens namn om det finns.
Gör budskapet tydligt och enkelt.
Endast det färdiga mejlet — inga etiketter, rubriker eller förklaringar.

📌 INPUT

User prompt skickas alltid i formatet:

(malltext + ifyllda fält)

Exempel:

Skriv ett nytt mejl till en kund.

namn: Anna
kontext: frågade om Volvo XC60

📌 OUTPUT

Svara endast med det färdiga mejlet i tre korta stycken och avsluta med:

Med vänlig hälsning
${userName} på ${companyName}
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, companyName, userName } = (await req.json()) as {
      messages: Message[];
      companyName?: string;
      userName?: string;
    };

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on whether user info is provided
    const systemPrompt = companyName && userName ? buildPersonalizedPrompt(companyName, userName) : genericSystemPrompt;

    console.log("Calling Lovable AI for email generation", companyName ? `for ${companyName}` : "(anonymous)");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "För många förfrågningar. Vänta en stund och försök igen." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Ogiltig API-nyckel. Kontakta administratören." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Betalning krävs. Lägg till krediter i din Lovable-arbetsyta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error("Lovable AI error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Kunde inte generera e-post.";

    console.log("Email generated successfully with Lovable AI");

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in email-assistant function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
