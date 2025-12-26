import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reference image and optimal padding values
const REFERENCE_IMAGE_URL = 'https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/referensbild//referens.png';
const OPTIMAL_PADDING = 0.26;
const OPTIMAL_PADDING_BOTTOM = 0.06;

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

    const systemPrompt = `Du är en expert på bilredigering och bildkomposition. Din uppgift är att jämföra en genererad bildbild mot en referensbild och bedöma om den ser lika professionell ut.

DU FÅR TVÅ BILDER:
1. BILD 1 (REFERENSBILD): Detta är ett PERFEKT exempel på hur en välkomponerad bilannons ska se ut. Denna bild skapades med följande inställningar:
   - Padding (storlek): ${OPTIMAL_PADDING}
   - Padding Bottom (position): ${OPTIMAL_PADDING_BOTTOM}

2. BILD 2 (BILD ATT BEDÖMA): Detta är den genererade bilden som användaren vill ha feedback på.

VIKTIGT - Förstå padding-systemet:
- "Padding" kontrollerar bilens STORLEK: Lägre värde = STÖRRE bil. Högre värde = MINDRE bil.
- "Padding Bottom" kontrollerar bilens VERTIKAL POSITION: Lägre värde = bil längre NER. Högre värde = bil längre UPP.
- Värdena går från 0.01 till 0.49.

JÄMFÖR BILD 2 MOT REFERENSBILDEN:

✅ GE STATUS "good" OM:
- Bilens storlek liknar referensbilden (lagom stor, inte för liten/stor)
- Bilen sitter naturligt placerad som i referensen
- Kompositionen ser lika professionell ut som referensen
- Det finns liknande balans och utrymme som i referensen

⚠️ GE STATUS "needs_adjustment" OM:
- Bilen är märkbart större eller mindre än i referensen
- Bilen sitter högre eller lägre än i referensen
- Kompositionen ser obalanserad ut jämfört med referensen

NÄR DU GER TIPS:
- Referera alltid till de optimala värdena (padding: ${OPTIMAL_PADDING}, padding bottom: ${OPTIMAL_PADDING_BOTTOM})
- Ge konkreta förslag som "Prova att öka padding till ca ${OPTIMAL_PADDING} för att matcha referensen"

Svara ALLTID i detta JSON-format (och inget annat):
{
  "status": "good" eller "needs_adjustment",
  "message": "En kort sammanfattning på svenska (max 2 meningar)",
  "tips": ["Tips 1", "Tips 2", "Tips 3"]
}

Om status är "good", bekräfta att bilden liknar referensen.
Om status är "needs_adjustment", ge specifika förslag med de optimala padding-värdena.`;

    const userPrompt = `Jämför den genererade bilden (Bild 2) mot referensbilden (Bild 1).

Nuvarande inställningar för den genererade bilden:
- Padding (storlek): ${currentPadding}
- Padding Bottom (position): ${currentPaddingBottom}

Optimala inställningar (från referensbilden):
- Padding (storlek): ${OPTIMAL_PADDING}
- Padding Bottom (position): ${OPTIMAL_PADDING_BOTTOM}

Bedöm om den genererade bilden ser lika professionell ut som referensen, och ge tips för att förbättra om det behövs.`;

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
                  url: REFERENCE_IMAGE_URL  // Bild 1: Referensbild
                } 
              },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`  // Bild 2: Genererad bild
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
