// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed. Use POST.",
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

  try {
    const body = await req.json();

    // Validate required fields
    const {
      productId,
      archivePrices = true, // Whether to also archive associated prices
    } = body;

    if (!productId) {
      return new Response(
        JSON.stringify({
          error: "Product ID is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Always delete from platform account (no stripeAccount needed)

    // Archive the product (set active to false)
    const archivedProduct = await stripe.products.update(
      productId,
      { active: false },
    );

    console.log("Product archived:", productId);

    const archivedPrices = [];

    // Optionally archive all associated prices
    if (archivePrices) {
      // Get all prices for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 100,
      });

      // Archive each active price
      for (const price of prices.data) {
        const archivedPrice = await stripe.prices.update(
          price.id,
          { active: false },
        );
        archivedPrices.push({
          id: archivedPrice.id,
          unit_amount: archivedPrice.unit_amount,
          currency: archivedPrice.currency,
          recurring: archivedPrice.recurring,
          active: archivedPrice.active,
        });
        console.log("Price archived:", price.id);
      }
    }

    // Return the archived product and prices
    const result = {
      product: {
        id: archivedProduct.id,
        name: archivedProduct.name,
        description: archivedProduct.description,
        metadata: archivedProduct.metadata,
        active: archivedProduct.active,
      },
      archivedPrices: archivedPrices,
      message:
        `Product ${productId} and ${archivedPrices.length} associated prices have been archived.`,
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("Error archiving product:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to archive product",
        message: err.message,
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-product' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
