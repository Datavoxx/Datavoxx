import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generic system prompt for anonymous users
const genericSystemPrompt = `Du är en bilexpert. Din uppgift är att hjälpa säljare att lära sig mer om olika bilmodeller så de kan sälja dem bättre.

Du kan svara på frågor om:
- Vanliga problem och svagheter med specifika bilmodeller
- Fördelar och styrkor med olika bilar
- Underhållstips och servicebehov
- Jämförelser mellan bilmodeller
- Tekniska specifikationer
- Kundrecensioner och rykte

Svara alltid på svenska, var hjälpsam och ge konkreta, användbara svar som hjälper säljaren att förstå bilen bättre. Håll svaren informativa men koncisa.`;

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
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { messages, companyName, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages are required");
    }

    // Build system prompt based on whether user info is provided
    const systemPrompt = companyName && userName
      ? buildPersonalizedPrompt(companyName, userName)
      : genericSystemPrompt;

    console.log("Processing car research query...", companyName ? `for ${companyName}` : "(anonymous)");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    console.log("Car research response generated successfully");

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in car-research function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
