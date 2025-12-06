import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
}

interface RequestBody {
  formData: FormData;
  systemPrompt: string;
  companyName?: string;
  userName?: string;
}

// Function to personalize the system prompt if user info is provided
const personalizePrompt = (basePrompt: string, companyName?: string, userName?: string): string => {
  if (!companyName || !userName) {
    return basePrompt;
  }
  
  // Add personalization to the prompt
  return `${basePrompt}

Denna annons är för ${companyName}. Inkludera företagsnamnet naturligt i annonsen där det passar (t.ex. "Kontakta oss på ${companyName}" eller "Välkommen till ${companyName}").`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, systemPrompt, companyName, userName } = (await req.json()) as RequestBody;

    console.log("Generating ad for:", formData.brand, formData.model, companyName ? `(${companyName})` : "(anonymous)");

    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API-nyckel är inte konfigurerad på servern" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Personalize the system prompt if user info is provided
    const finalSystemPrompt = personalizePrompt(systemPrompt, companyName, userName);

    // Build the user prompt with car information
    const userPrompt = `Skapa en bilannons för följande bil:

Märke: ${formData.brand}
Modell: ${formData.model}
${formData.year ? `Årsmodell: ${formData.year}` : ""}
${formData.mileage ? `Miltal: ${formData.mileage} mil` : ""}
${formData.price ? `Pris: ${formData.price} kr` : ""}

${formData.equipment ? `Utrustning:\n${formData.equipment}` : ""}

${formData.condition ? `Skick:\n${formData.condition}` : ""}

Generera en professionell och säljande annons baserat på denna information.`;

    console.log("Calling OpenAI API with gpt-5-mini...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      
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
      
      return new Response(
        JSON.stringify({ error: "Fel vid anrop till AI-tjänsten" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedAd = data.choices?.[0]?.message?.content || "";

    console.log("Ad generated successfully with gpt-5-mini");

    return new Response(
      JSON.stringify({ generatedAd }),
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
