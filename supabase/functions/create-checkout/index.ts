import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe price IDs
const STRIPE_PRICES = {
  gen1: 'price_1Shc20KlMKbpVsVCnsSugfC5',
  gen2: 'price_1Shfl1KlMKbpVsVCArcgFSEN',
  creditBonus: 'price_1Shc2uKlMKbpVsVCpWybKDsQ',
  creditMax: 'price_1Shc3fKlMKbpVsVCEA8PFKCe',
  emailAssistant: 'price_1ShfkqKlMKbpVsVCFbB4S2CH'
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { packageKey, addons } = await req.json();
    logStep("Request body parsed", { packageKey, addons });

    if (!packageKey || !['gen1', 'gen2'].includes(packageKey)) {
      throw new Error("Invalid package key. Must be 'gen1' or 'gen2'");
    }

    // Build line items
    const lineItems: Array<{ price: string; quantity: number }> = [];
    
    // Add base package
    const basePriceId = STRIPE_PRICES[packageKey as keyof typeof STRIPE_PRICES];
    lineItems.push({ price: basePriceId, quantity: 1 });
    logStep("Added base package", { packageKey, priceId: basePriceId });

    // Add selected add-ons
    if (addons && Array.isArray(addons)) {
      for (const addonId of addons) {
        let priceId: string | undefined;
        switch (addonId) {
          case 'credit-max':
            priceId = STRIPE_PRICES.creditMax;
            break;
          case 'credit-bonus':
            priceId = STRIPE_PRICES.creditBonus;
            break;
          case 'email-assistant':
            priceId = STRIPE_PRICES.emailAssistant;
            break;
        }
        if (priceId) {
          lineItems.push({ price: priceId, quantity: 1 });
          logStep("Added addon", { addonId, priceId });
        }
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: {
        user_id: user.id,
        package: packageKey,
        addons: addons ? addons.join(',') : ''
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
