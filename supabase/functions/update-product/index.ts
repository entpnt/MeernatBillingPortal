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
  // Handle CORS preflight requests
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
    // Get request body
    const { productId, amountNextMonth } = await req.json();

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

    if (amountNextMonth === undefined || amountNextMonth === null) {
      return new Response(
        JSON.stringify({
          error: "Amount for next month is required",
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

    // Get the current product from Stripe to retrieve existing metadata
    const currentProduct = await stripe.products.retrieve(productId);

    if (!currentProduct) {
      return new Response(
        JSON.stringify({
          error: "Product not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Update the metadata with the new amount_next_month value
    const updatedMetadata = {
      ...currentProduct.metadata,
      amount_next_month: amountNextMonth.toString(),
    };

    // Update the product with the new metadata using Stripe API
    const updatedProduct = await stripe.products.update(
      productId,
      { metadata: updatedMetadata },
    );

    return new Response(
      JSON.stringify({
        success: true,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          metadata: updatedProduct.metadata,
          active: updatedProduct.active,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error
          ? error.message
          : "Unknown error occurred",
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
