import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PHOTOROOM_API_KEY = Deno.env.get("PHOTOROOM_API_KEY");
    if (!PHOTOROOM_API_KEY) {
      throw new Error("PHOTOROOM_API_KEY is not configured");
    }

    console.log("[PHOTOROOM-CREDITS] Fetching account info...");

    const response = await fetch("https://image-api.photoroom.com/v2/account", {
      method: "GET",
      headers: {
        "x-api-key": PHOTOROOM_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PHOTOROOM-CREDITS] API error:", response.status, errorText);
      throw new Error(`Photoroom API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[PHOTOROOM-CREDITS] Account data:", JSON.stringify(data));

    // Photoroom returns: images.available (used) and images.subscription (total)
    const used = data.images?.available || 0;
    const total = data.images?.subscription || 1000;
    const remaining = total - used;

    return new Response(
      JSON.stringify({
        remaining,
        total,
        used,
        plan: data.plan || "Unknown",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[PHOTOROOM-CREDITS] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
