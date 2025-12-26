import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormData {
  car: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
  interestRate: string;
  campaign: string;
  insuranceOffer: string;
  financing: string;
  warranty: string;
}

type AdLength = "short" | "long";

interface RequestBody {
  formData: FormData;
  systemPrompt: string;
  companyName?: string;
  userName?: string;
  length?: AdLength;
  sessionId?: string;
}

const getLengthInstructions = (length: AdLength): string => {
  if (length === "short") {
    return `
VIKTIGT - KORT VERSION:
Skriv en KORTFATTAD annons på max 150 ord. Fokusera på:
- En catchy rubrik
- De 3-4 viktigaste försäljningspunkterna
- Pris och kontaktinfo
Var koncis och säljande utan att vara för ordrik.`;
  }
  return `
VIKTIGT - LÅNG VERSION:
Skriv en UTFÖRLIG och detaljerad annons på 250-400 ord. Inkludera:
- En catchy rubrik
- Detaljerad beskrivning av bilen och dess skick
- All relevant utrustning och funktioner
- Finansieringsmöjligheter om tillgängligt
- Garanti och serviceinformation
- Pris och kontaktinfo
Var säljande och professionell med rik detaljnivå.`;
};

const personalizePrompt = (basePrompt: string, companyName?: string, userName?: string, length: AdLength = "long"): string => {
  let prompt = basePrompt;
  prompt = `${prompt}\n\n${getLengthInstructions(length)}`;
  
  if (companyName && userName) {
    prompt = `${prompt}

Denna annons är för ${companyName}. Inkludera företagsnamnet naturligt i annonsen där det passar (t.ex. "Kontakta oss på ${companyName}" eller "Välkommen till ${companyName}").`;
  }
  
  return prompt;
};

// Helper function to check and consume credit
async function checkAndUseCredit(
  authHeader: string | null,
  sessionId: string | undefined,
  consume: boolean
): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": supabaseAnonKey,
  };
  
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  
  const response = await fetch(`${supabaseUrl}/functions/v1/check-and-use-credit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ consume, sessionId }),
  });

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const { formData, systemPrompt, companyName, userName, length = "long", sessionId } = (await req.json()) as RequestBody;

    console.log("Generating ad for:", formData.car, `length: ${length}`, companyName ? `(${companyName})` : "(anonymous)");

    // Check credits first
    const creditCheck = await checkAndUseCredit(authHeader, sessionId, false);
    if (!creditCheck.allowed) {
      console.log("Credit check failed:", creditCheck);
      return new Response(
        JSON.stringify({ 
          error: creditCheck.error || "Du har använt alla credits för idag. Återställs vid midnatt.",
          creditExhausted: true,
          remaining: 0
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API-nyckel är inte konfigurerad på servern" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalSystemPrompt = personalizePrompt(systemPrompt, companyName, userName, length);

    const userPrompt = `Skapa en bilannons för följande bil:

Bilen: ${formData.car}
${formData.year ? `Årsmodell: ${formData.year}` : ""}
${formData.mileage ? `Miltal: ${formData.mileage} mil` : ""}
${formData.price ? `Pris: ${formData.price} kr` : ""}

${formData.equipment ? `Utrustning:\n${formData.equipment}` : ""}

${formData.condition ? `Skick:\n${formData.condition}` : ""}

${formData.interestRate || formData.campaign || formData.insuranceOffer || formData.financing || formData.warranty ? `
FINANSIERING & FÖRSÄKRING:
${formData.interestRate ? `Ränta: ${formData.interestRate}` : ""}
${formData.campaign ? `Kampanj: ${formData.campaign}` : ""}
${formData.insuranceOffer ? `Försäkringserbjudande: ${formData.insuranceOffer}` : ""}
${formData.financing ? `Finansieringsinfo: ${formData.financing}` : ""}
${formData.warranty ? `Garanti: ${formData.warranty}` : ""}
` : ""}

Generera en professionell och säljande annons baserat på denna information. Följ strukturen i systempromten exakt.`;

    console.log("Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Lovable AI error:", response.status, errorData);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Ogiltig API-nyckel. Kontakta administratören." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "För många förfrågningar. Vänta en stund och försök igen." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Betalning krävs. Lägg till krediter i din Lovable-arbetsyta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Fel vid anrop till AI-tjänsten" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedAd = data.choices?.[0]?.message?.content || "";

    // Consume credit after successful generation
    const consumeResult = await checkAndUseCredit(authHeader, sessionId, true);
    console.log("Credit consumed:", consumeResult);

    console.log("Ad generated successfully with Lovable AI");

    return new Response(
      JSON.stringify({ 
        generatedAd,
        creditsRemaining: consumeResult.remaining
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-ad function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Okänt fel" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
