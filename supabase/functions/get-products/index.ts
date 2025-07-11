// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed. Use GET.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({
        error: "Missing Stripe secret key",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Stripe initialized successfully");

    // Fetch prices using the Stripe SDK
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ["data.product"],
      active: true,
    });

    console.log(`Fetched ${prices.data.length} prices from Stripe`);

    // Filter out inactive prices and archived products, then flatten the result
    const result = prices.data
      .filter((price: Stripe.Price) => {
        // Only include active prices
        if (price.active !== true) {
          return false;
        }
        // Only include prices with active products
        if (
          price.product && typeof price.product === "object" &&
          "active" in price.product
        ) {
          const product = price.product as Stripe.Product;
          if (product.active !== true) {
            return false;
          }
        }
        return true;
      })
      .map((price: Stripe.Price) => {
        const product = typeof price.product === "object"
          ? price.product as Stripe.Product
          : null;

        return {
          productId: product?.id ?? null,
          productName: product?.name ?? null,
          productDescription: product?.description ?? null,
          productMetadata: product?.metadata ?? {},
          priceId: price.id,
          unitAmount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring ?? null,
          // Include the account ID from metadata for easy identification
          connectedAccountId: product?.metadata?.connected_account_id ?? null,
        };
      });

    console.log(`Returning ${result.length} filtered products`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error("Error in get-products function:", e);
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        message: e instanceof Error ? e.message : String(e),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-products' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
