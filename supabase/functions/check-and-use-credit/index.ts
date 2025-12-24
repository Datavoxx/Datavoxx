import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit limits per tier
const CREDIT_LIMITS = {
  anonymous: 5,
  free_logged_in: 20,
  gen_1: 120,
  gen_2: 300,
};

// Stripe product IDs mapped to tiers
const PRODUCT_TO_TIER: Record<string, keyof typeof CREDIT_LIMITS> = {
  "prod_TezYFUWmNFuOGQ": "gen_1",
  "prod_TezkXphJVCjLhl": "gen_2",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-CREDIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { consume = false, sessionId } = await req.json();
    logStep("Request params", { consume, sessionId });

    // Check for authenticated user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (!userError && userData.user) {
        userId = userData.user.id;
        userEmail = userData.user.email || null;
        logStep("Authenticated user", { userId, email: userEmail });
      }
    }

    // Determine tier based on subscription
    let tier: keyof typeof CREDIT_LIMITS = "anonymous";
    
    if (userId) {
      tier = "free_logged_in"; // Default for logged-in users

      if (stripeKey && userEmail) {
        try {
          const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
          const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

          if (customers.data.length > 0) {
            const customerId = customers.data[0].id;
            const subscriptions = await stripe.subscriptions.list({
              customer: customerId,
              status: "active",
              limit: 1,
            });

            if (subscriptions.data.length > 0) {
              const subscription = subscriptions.data[0];
              const productId = subscription.items.data[0]?.price?.product as string;
              
              if (productId && PRODUCT_TO_TIER[productId]) {
                tier = PRODUCT_TO_TIER[productId];
                logStep("Found active subscription", { productId, tier });
              }
            }
          }
        } catch (stripeError) {
          console.error("Stripe lookup error:", stripeError);
          // Continue with free tier if Stripe fails
        }
      }
    }

    const creditLimit = CREDIT_LIMITS[tier];
    logStep("Credit limit determined", { tier, creditLimit });

    // Get today's date in UTC
    const today = new Date().toISOString().split("T")[0];
    logStep("Checking credits for date", { today });

    // Query or create daily credits record
    let creditsUsed = 0;
    const lookupColumn = userId ? "user_id" : "session_id";
    const lookupValue = userId || sessionId;

    if (!lookupValue) {
      return new Response(
        JSON.stringify({ error: "Session ID or authentication required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing credits for today
    const { data: existingCredits, error: fetchError } = await supabase
      .from("daily_credits")
      .select("id, credits_used")
      .eq(lookupColumn, lookupValue)
      .eq("date", today)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch credits error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingCredits) {
      creditsUsed = existingCredits.credits_used;
      logStep("Found existing credits", { creditsUsed });
    }

    const remaining = creditLimit - creditsUsed;
    const allowed = remaining > 0;

    logStep("Credit status", { creditsUsed, remaining, allowed, consume });

    // If just checking (consume = false), return status
    if (!consume) {
      return new Response(
        JSON.stringify({
          allowed,
          remaining,
          limit: creditLimit,
          tier,
          resetAt: "midnatt",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If consuming, check if allowed
    if (!allowed) {
      logStep("Credit limit reached - blocking");
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          limit: creditLimit,
          tier,
          resetAt: "midnatt",
          error: "Du har använt alla credits för idag. Dina credits återställs vid midnatt.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert credits
    if (existingCredits) {
      const { error: updateError } = await supabase
        .from("daily_credits")
        .update({ credits_used: creditsUsed + 1 })
        .eq("id", existingCredits.id);

      if (updateError) {
        console.error("Update credits error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update credits" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const insertData: Record<string, unknown> = {
        date: today,
        credits_used: 1,
      };
      
      if (userId) {
        insertData.user_id = userId;
      } else {
        insertData.session_id = sessionId;
      }

      const { error: insertError } = await supabase
        .from("daily_credits")
        .insert(insertData);

      if (insertError) {
        console.error("Insert credits error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create credits record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    logStep("Credit consumed successfully");

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: remaining - 1,
        limit: creditLimit,
        tier,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-and-use-credit:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
