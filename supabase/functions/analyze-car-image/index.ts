import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  status: 'good' | 'needs_adjustment';
  message: string;
  tips: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, currentPadding, currentPaddingBottom } = await req.json();

    if (!imageBase64) {
      throw new Error("Ingen bild skickades");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du är en expert på bilredigering och bildkomposition. Din uppgift är att analysera en genererad bildbild och bedöma om den ser professionell ut.

VIKTIGT - Förstå padding-systemet:
- "Padding" kontrollerar bilens STORLEK: Lägre värde (t.ex. 0.10) = STÖRRE bil. Högre värde (t.ex. 0.40) = MINDRE bil.
- "Padding Bottom" kontrollerar bilens VERTIKAL POSITION: Lägre värde (t.ex. 0.10) = bil längre NER. Högre värde (t.ex. 0.40) = bil längre UPP.
- Värdena går från 0.01 till 0.49.

BEDÖMNINGSKRITERIER:

✅ POSITIVA TECKEN (status: "good"):
- Bilen är helt synlig utan att skäras av i kanterna
- Det finns lagom utrymme ovanför och under bilen
- Bilen ser naturligt placerad ut i förhållande till bakgrunden
- Kompositionen ser balanserad och professionell ut
- Bilen fyller bilden på ett tilltalande sätt

⚠️ BEHÖVER JUSTERING (status: "needs_adjustment"):
- Bilen är för liten och ser "borttappad" ut i bilden
- Bilen är så stor att den skärs av i kanterna
- Bilen svävar onaturligt högt eller sjunker för långt ner
- Det ser obalanserat ut med för mycket tomrum på en sida

VIKTIGT: Var GENERÖS med positiv feedback! Om bilden ser professionell ut och bilen är väl placerad, ge status "good" med uppmuntrande feedback. Endast om det finns uppenbara problem ska du ge "needs_adjustment".

Svara ALLTID i detta JSON-format (och inget annat):
{
  "status": "good" eller "needs_adjustment",
  "message": "En kort sammanfattning på svenska (max 2 meningar)",
  "tips": ["Tips 1", "Tips 2", "Tips 3"]
}

Om status är "good", ge tips som bekräftar vad som är bra med bilden.
Om status är "needs_adjustment", ge specifika förslag med ungefärliga padding-värden.`;

    const userPrompt = `Analysera denna genererade bildbild. Nuvarande inställningar är:
- Padding (storlek): ${currentPadding}
- Padding Bottom (position): ${currentPaddingBottom}

Titta på bilen i bilden och bedöm om storleken och positionen är optimal, eller om justeringar behövs.`;

    console.log("Calling Lovable AI for image analysis...");

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                } 
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Tjänsten är överbelastad just nu. Försök igen om en stund." 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI-krediter slut. Kontakta administratören." 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Inget svar från AI");
    }

    console.log("AI response:", content);

    // Parse JSON from response (handle potential markdown code blocks)
    let analysisResult: AnalysisResult;
    try {
      // Remove markdown code blocks if present
      let jsonString = content.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.slice(7);
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.slice(3);
      }
      if (jsonString.endsWith('```')) {
        jsonString = jsonString.slice(0, -3);
      }
      jsonString = jsonString.trim();
      
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Fallback response
      analysisResult = {
        status: 'good',
        message: 'Kunde inte analysera bilden fullständigt, men den ser bra ut!',
        tips: ['Prova att justera padding om du vill ändra bilens storlek', 'Prova padding bottom för att flytta bilen upp eller ner']
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-car-image function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
