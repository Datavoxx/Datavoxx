import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

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
  return `Du är en professionell e-postassistent för ${companyName}. Din uppgift är att hjälpa ${userName} att skriva professionella, vänliga och effektiva e-postmeddelanden.

Riktlinjer:
- Skriv alltid på svenska
- Var professionell men personlig
- Anpassa tonen efter situationen (uppföljning, kundfrågor, erbjudanden, etc.)
- Använd "${companyName}" som avsändarens företagsnamn när det passar
- Inkludera lämpliga hälsningsfraser (signera gärna med ${userName} från ${companyName})
- Håll e-postmeddelanden koncisa men informativa
- Om användaren ger specifik information om bilen eller kunden, inkludera det naturligt i e-posten
- Avsluta med en tydlig uppmaning till handling när det är lämpligt

Returnera endast e-postmeddelandet utan extra förklaringar.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, companyName, userName } = await req.json() as { 
      messages: Message[]; 
      companyName?: string; 
      userName?: string 
    };
    
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build system prompt based on whether user info is provided
    const systemPrompt = companyName && userName
      ? buildPersonalizedPrompt(companyName, userName)
      : genericSystemPrompt;

    console.log("Calling OpenAI API with gpt-5-mini for email generation", companyName ? `for ${companyName}` : "(anonymous)");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "För många förfrågningar. Vänta en stund och försök igen." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Ogiltig API-nyckel. Kontakta administratören." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Kunde inte generera e-post.";

    console.log("Email generated successfully with gpt-5-mini");

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in email-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
