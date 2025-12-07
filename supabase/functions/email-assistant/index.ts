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

📌 MALLAR

- ny kontakt: Skriv ett nytt mejl till en kund.

namn: 
kontext: 

* detta innebär att vi skriver ett helt nytt mejl så läs av avsikten som finns i "kontext" det kan handla om allt!!!




✅ MALL 1 — “Ny kontakt”
📌 USER INPUT (helt enligt din struktur)
Skriv ett nytt mejl till en kund.

namn: Anna
kontext: fråga när vi kan hämta bilen med reghhy364

📌 OUTPUT (tre stycken, 70 ord, kort och sakligt)

Hej Anna

Hoppas allt är bra med dig. 

Vi vill gärna vet när bilen med reg nr:hhy364 är klar för upphämtning?. 

Meddela gärna när ni har ett datum för upphämning så att vi kan planera korrekt internt

Med vänlig hälsning
[namn]

✅ MALL 2 — “Svara kund”
📌 USER INPUT (originalformat, inga fel)
Svara på ett kundmejl.

kundens mejl: frågar om bilen är servad och om det finns vinterdäck
mitt svar ska innehålla: bekräfta service och skriv att vi kan lösa vinterdäck som tillval

📌 OUTPUT (kort, tydligt, tre stycken)

Hej

Tack för ditt mejl. Bilen är servad och i gott skick, så du kan känna dig trygg med att allt är i ordning. När det gäller vinterdäck finns det möjlighet att lägga till det, så det går att lösa smidigt.

Hör gärna av dig om du vill veta mer eller komma förbi och titta på bilen.

Med vänlig hälsning
[namn]

✅ MALL 3 — “Köpintresse / Inköp”
📌 USER INPUT (helt enligt dina fält)
Skriv ett mejl om ett fordon som en kund visat intresse för.

fordon: BMW 320d 2019
kund: Peter
kontext: lämnade en intresseanmälan på hemsidan och vill veta nästa steg

📌 OUTPUT (professionellt, 3 stycken)

Hej Peter

Tack för din intresseanmälan. BMW 320d 2019 finns tillgänglig och vi hjälper gärna dig vidare. Vi kan gå igenom bilens detaljer och svara på dina frågor i lugn och ro.

Återkom gärna med en tid som passar dig så ordnar vi en visning och nästa steg.

Med vänlig hälsning
[namn]
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
