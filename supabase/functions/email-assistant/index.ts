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

interface EmailContext {
  from: string;
  fromName: string;
  subject: string;
  body: string;
}

// Generic system prompt for anonymous users
const genericSystemPrompt = `SYSTEMPROMPT (optimerad):

Du är en e-postassistent för bilhandlare i Sverige.
Din uppgift är att skriva mycket korta, tydliga och professionella mejl baserat på användarens struktur:

kundens förfrågan:

fordon det gäller (om känt):

mitt svar ska innehålla:

Regler:

Skriv alltid på svenska.

Skriv endast själva mejlet, inga förklaringar.

Använd endast information som finns i input. Inga antaganden.

Omsätt formuleringar som börjar med "skriv att …" till färdig text i mejlet.

Mejlen ska vara korta, raka och utan extra detaljer.

Visa lätt uppskattning och avsluta med en enkel uppmaning till vidare kontakt när det passar.

Om input saknar information: skriv kort att uppgiften inte är känd ännu.

Skriv aldrig längre än nödvändigt och lägg aldrig till något oönskat innehåll.

Returnera endast det färdiga mejlet.`;

// Personalized system prompt for logged-in users
const buildPersonalizedPrompt = (companyName: string, userName: string): string => {
  return `📌 ROLL

Du är BILGENs seniora copywriter inom bilhandel. Du skriver korta, tydliga mejlsvar baserat på användarens mall och input. Din ton är vardaglig, professionell och saklig — anpassad för bilbranschen. Du skriver mejl åt ${userName} på ${companyName}.

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
Använd namn om det finns.
Gör budskapet tydligt och enkelt.
Endast det färdiga mejlet — inga etiketter, rubriker eller förklaringar.

📌 MALLAR

✅ MALL 1 — "Inköp"
Användaren vill skicka ett inköpsbud till någon som vill sälja sin bil. Ni är köpare, de är säljare.
Fält: säljarens bil (märke/modell/år/mil), ditt inköpspris, säljarens namn, eventuella villkor

Skriv ett professionellt inköpserbjudande som:
- Inleder kort och rakt på sak med ert intresse för bilen
- Presenterar inköpspriset tydligt och positivt
- Betonar fördelarna med att sälja till er (snabb affär, seriös köpare, smidig hantering)
- Nämner eventuella villkor (besiktning, leverans etc.)
- Avslutar med tydlig CTA (ring för att boka tid, kom förbi för avslut)

✅ MALL 2 — "Svar på förfrågan"
Användaren vill svara på en inkommande förfrågan från en potentiell kund.
Fält: kundens förfrågan, fordon det gäller (om känt), mitt svar ska innehålla

Skriv ett snabbt och professionellt svar som:
- Tackar för förfrågan
- Svarar på kundens frågor
- Visar entusiasm och hjälpsamhet
- Föreslår nästa steg (provkörning, ring, mer info)

Med vänlig hälsning
${userName} på ${companyName}`;
};

// Context-aware prompt for replying to emails
const buildReplyPrompt = (emailContext: EmailContext, companyName?: string, userName?: string): string => {
  const signature = companyName && userName 
    ? `\n\nMed vänlig hälsning\n${userName} på ${companyName}` 
    : "";
  
  return `📌 ROLL

Du är en professionell e-postassistent för bilhandlare i Sverige. Du hjälper till att skriva korta, tydliga och professionella svar på inkommande mejl.

📌 INKOMMANDE MEJL SOM SKA BESVARAS

Från: ${emailContext.fromName} <${emailContext.from}>
Ämne: ${emailContext.subject}

Innehåll:
${emailContext.body}

📌 SNABBVAL / DIREKTIV

Användaren kan välja något av följande snabbval eller skriva eget direktiv:

• "Föreslå att boka en visning/provkörning"
• "Bekräfta pris och tillgänglighet"
• "Tacka artigt men avböj budet"

📌 EXEMPEL

Input: "Föreslå att boka en visning/provkörning"
Output:
"Hej [namn]!

Tack för ditt intresse för [bilen]. Den finns kvar och ser bra ut!

När passar det för en provkörning? Vi har tider lediga hela veckan.${signature}"

Input: "Tacka artigt men avböj budet"
Output:
"Hej [namn]!

Tack för ditt bud på [bilen]. Tyvärr ligger det en bit från vår prisbild och vi väljer att avböja.

Hör gärna av dig om du är intresserad av något annat!${signature}"

📌 REGLER

- Skriv alltid på svenska
- Skriv endast mejlet, inga förklaringar eller rubriker
- **Håll det KORT: max 3-5 rader**
- Var professionell men personlig
- Använd kundens namn om det finns
- Avsluta med signatur om tillgänglig`;
};

// Prompt for suggesting dynamic directives based on email content
const buildSuggestDirectivesPrompt = (emailContext: EmailContext): string => {
  return `Du är en expert på att analysera inkommande mejl till bilhandlare i Sverige.

Analysera mejlet nedan och föreslå 3-4 korta, relevanta svarsalternativ som användaren kan välja för att generera ett svar.

📌 INKOMMANDE MEJL

Från: ${emailContext.fromName} <${emailContext.from}>
Ämne: ${emailContext.subject}

Innehåll:
${emailContext.body}

📌 KATEGORIER OCH EXEMPEL

- Köpförfrågan (kund vill köpa bil) → "Bekräfta tillgänglighet", "Föreslå provkörning", "Skicka mer info om bilen"
- Säljförfrågan (kund vill sälja bil) → "Be om bilder", "Föreslå värdering", "Ge preliminärt inköpspris"
- Prisförhandling → "Stå fast vid pris", "Erbjud liten rabatt", "Föreslå alternativ bil"
- Bokningsbekräftelse → "Bekräfta bokning", "Föreslå annan tid", "Skicka vägbeskrivning"
- Allmän fråga → "Svara på frågan", "Be om mer info", "Hänvisa till hemsida"
- Reklamation/Klagomål → "Be om ursäkt och erbjud lösning", "Be om mer detaljer", "Boka in service"

📌 REGLER

- Returnera ENDAST en JSON-array, inget annat
- Varje objekt har "label" (kort, 2-3 ord) och "value" (mer detaljerat direktiv)
- Anpassa förslagen till mejlets innehåll
- Max 4 förslag

📌 EXEMPELSVAR

[
  {"label": "Bekräfta tillgänglighet", "value": "Bekräfta att bilen finns kvar och är tillgänglig för visning"},
  {"label": "Föreslå provkörning", "value": "Föreslå att boka en provkörning och fråga vilken tid som passar"},
  {"label": "Skicka mer info", "value": "Erbjud dig att skicka mer information om bilens utrustning och historik"}
]`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, companyName, userName, emailContext, directive, mode } = (await req.json()) as {
      messages?: Message[];
      companyName?: string;
      userName?: string;
      emailContext?: EmailContext;
      directive?: string;
      mode?: "suggest-directives" | "generate";
    };

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt: string;
    let chatMessages: { role: string; content: string }[];

    // Mode: suggest-directives - analyze email and suggest quick actions
    if (mode === "suggest-directives" && emailContext) {
      systemPrompt = buildSuggestDirectivesPrompt(emailContext);
      chatMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analysera mejlet och föreslå svarsalternativ." }
      ];
      console.log("Suggesting directives for email from:", emailContext.from);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: chatMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lovable AI error:", response.status, errorText);
        throw new Error("Lovable AI error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      
      // Try to parse as JSON, fallback to empty array
      let directives = [];
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          directives = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse directives:", parseError);
        directives = [];
      }

      console.log("Suggested directives:", directives.length);
      return new Response(JSON.stringify({ directives }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this is a reply-to-email request
    if (emailContext && directive) {
      systemPrompt = buildReplyPrompt(emailContext, companyName, userName);
      chatMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Direktiv: ${directive}` }
      ];
      console.log("Generating email reply", companyName ? `for ${companyName}` : "(anonymous)");
    } else if (messages) {
      // Regular template/freeform mode
      systemPrompt = companyName && userName ? buildPersonalizedPrompt(companyName, userName) : genericSystemPrompt;
      chatMessages = [{ role: "system", content: systemPrompt }, ...messages];
      console.log("Calling Lovable AI for email generation", companyName ? `for ${companyName}` : "(anonymous)");
    } else {
      throw new Error("Missing required parameters: messages or (emailContext + directive)");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: chatMessages,
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