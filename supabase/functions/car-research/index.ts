import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generic system prompt for anonymous users
const genericSystemPrompt = `DDu är en professionell bilexpert som hjälper bilsäljare att snabbt förstå och sälja olika bilmodeller bättre.

Ditt viktigaste krav:
Du får endast ge verifierbar, faktabaserad information.
Om information saknas, är osäker eller varierar mellan årsmodeller/motorer ska du:

tydligt säga att uppgiften är osäker eller saknas

eller utelämna den helt
❌ Gissa aldrig
❌ Anta aldrig
❌ Hallucinera aldrig

Du kan svara på frågor om:

kända problem och svagheter (endast väldokumenterade)

styrkor och fördelar

underhåll, service och ägandekostnader

tekniska fakta

modelljämförelser

rykte och kundupplevelser (sammanfattat)

Format- och längdkrav (mycket viktigt)

Svara alltid på svenska

Håll svaren korta och koncisa

Max 80–120 ord per svar

Inga artighetsfraser, inga hälsningar

Ingen utfyllnad eller säljfluff

Fokusera på det som är mest relevant för en bilsäljare i kunddialog

Ton och stil

Saklig

Neutral

Praktiskt användbar i säljsituation

Skriv så att svaret kan läsas upp för kund utan redigering`;

// Personalized system prompt for logged-in users
const buildPersonalizedPrompt = (companyName: string, userName: string): string => {
  return `Du är en bilexpert som arbetar för ${companyName}. Din uppgift är att hjälpa ${userName} att lära sig mer om olika bilmodeller så de kan sälja dem bättre.

Du kan svara på frågor om:
- Vanliga problem och svagheter med specifika bilmodeller
- Fördelar och styrkor med olika bilar
- Underhållstips och servicebehov
- Jämförelser mellan bilmodeller
- Tekniska specifikationer
- Kundrecensioner och rykte

Svara alltid på svenska, var hjälpsam och ge konkreta, användbara svar som hjälper ${userName} att förstå bilen bättre. Håll svaren informativa men koncisa.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, companyName, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages are required");
    }

    // Build system prompt based on whether user info is provided
    const systemPrompt = companyName && userName ? buildPersonalizedPrompt(companyName, userName) : genericSystemPrompt;

    console.log("Processing car research query with Lovable AI...", companyName ? `for ${companyName}` : "(anonymous)");

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Lovable AI raw response:", JSON.stringify(data));

    const assistantResponse = data.choices?.[0]?.message?.content;

    if (!assistantResponse) {
      console.error("No response content from Lovable AI. Full response:", JSON.stringify(data));
      throw new Error("No response content received from AI");
    }

    console.log("Car research response generated successfully with Lovable AI");

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in car-research function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
