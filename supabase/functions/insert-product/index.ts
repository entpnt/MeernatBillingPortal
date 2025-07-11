// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log("Hello from Functions!");

// Helper function to create a product
async function createProduct(productData: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const data = new URLSearchParams({
    name: productData.name,
    active: "true",
  });

  if (productData.description) {
    data.append("description", productData.description);
  }

  if (productData.metadata) {
    console.log("Processing metadata for product:", productData.metadata);
    Object.entries(productData.metadata).forEach(([key, value]) => {
      console.log(`Adding metadata[${key}] = ${value}`);
      data.append(`metadata[${key}]`, String(value));
    });
  }

  const response = await fetch("https://api.stripe.com/v1/products", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create product: ${errorText}`);
  }

  const product = await response.json();
  console.log("Product created:", product.id);
  return product;
}

serve(async (req) => {
  console.log("=== INSERT PRODUCT FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  // Handle CORS
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    console.log("Parsing request body...");
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const {
      name,
      description,
      price,
      amount, // For backward compatibility
      currency = "usd",
      accountId,
      accountName,
      metadata = {},
      includeDynamicCharge = false,
      dynamicChargeDescription,
    } = body;

    // Use price if available, otherwise fall back to amount
    const finalPrice = price !== undefined ? price : amount;

    console.log("Extracted parameters:");
    console.log("- name:", name);
    console.log("- description:", description);
    console.log("- price:", price);
    console.log("- amount:", amount);
    console.log("- finalPrice:", finalPrice);
    console.log("- currency:", currency);
    console.log("- accountId:", accountId);
    console.log("- accountName:", accountName);
    console.log("- metadata:", metadata);
    console.log("- includeDynamicCharge:", includeDynamicCharge);
    console.log("- dynamicChargeDescription:", dynamicChargeDescription);

    // Validate required fields
    if (!name || finalPrice === undefined) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Name and price/amount are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    console.log("Validation passed, proceeding with product creation...");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.log("Missing STRIPE_SECRET_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    console.log("Stripe secret key found, initializing variables...");
    let dynamicProductId: string | null = null;
    let dynamicPrice: Record<string, unknown> | null = null;

    // If dynamic charge is requested, create the dynamic product first
    if (includeDynamicCharge) {
      console.log("=== CREATING DYNAMIC PRODUCT ===");
      const dynamicProductName = `${name} - Dynamic`;
      console.log("Dynamic product name:", dynamicProductName);

      // Create dynamic product using helper function
      console.log("Calling createProduct helper for dynamic product...");
      const dynamicProduct = await createProduct({
        name: dynamicProductName,
        description: dynamicChargeDescription || "Dynamic usage-based pricing",
        metadata: {
          ...metadata,
          ...(accountId && { connected_account_id: accountId }),
          type: "dynamic_charge",
          parent_product_name: name,
        },
      });

      dynamicProductId = dynamicProduct.id;
      console.log("Dynamic product created successfully:", dynamicProductId);

      console.log("=== CREATING DYNAMIC PRICE ===");
      console.log("Preparing dynamic price data...");

      // Since Stripe now requires meters for metered pricing and we can't create meters,
      // we'll create a regular recurring price that can be used for dynamic billing
      const dynamicPriceParams = new URLSearchParams({
        unit_amount: "1", // 1 cent per unit
        currency: "usd",
        product: dynamicProductId!, // We know it's not null here
        "recurring[interval]": "month",
        "recurring[usage_type]": "licensed", // Use licensed instead of metered
      });
      console.log("Dynamic price params:", dynamicPriceParams.toString());

      console.log("Making request to create dynamic price...");
      const dynamicPriceResponse = await fetch(
        "https://api.stripe.com/v1/prices",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: dynamicPriceParams.toString(),
        },
      );

      console.log(
        "Dynamic price response status:",
        dynamicPriceResponse.status,
      );
      console.log(
        "Dynamic price response headers:",
        Object.fromEntries(dynamicPriceResponse.headers.entries()),
      );

      if (!dynamicPriceResponse.ok) {
        const errorText = await dynamicPriceResponse.text();
        console.log("Dynamic price creation failed:", errorText);
        throw new Error(`Failed to create dynamic price: ${errorText}`);
      }

      dynamicPrice = await dynamicPriceResponse.json();
      console.log("Dynamic price created successfully:", dynamicPrice!.id);
    }

    console.log("=== CREATING MAIN PRODUCT ===");
    // Create the main product using helper function
    console.log("Calling createProduct helper for main product...");

    const productMetadata = {
      ...metadata,
      ...(accountId && { connected_account_id: accountId }),
      ...(accountName && { account_name: accountName }),
      ...(dynamicProductId && { dynamic_product_id: dynamicProductId }),
      ...(dynamicPrice && { dynamic_price_id: dynamicPrice.id }),
      frequency: metadata.type === "one-time" ? "one-time" : "monthly", // Clear frequency indicator
    };

    console.log(
      "Final product metadata being sent to Stripe:",
      productMetadata,
    );

    const product = await createProduct({
      name: name,
      description: description,
      metadata: productMetadata,
    });

    console.log("Main product created successfully:", product.id);

    console.log("=== CREATING MAIN PRICE ===");
    // Create the price using direct fetch in the platform account
    console.log("Preparing main price data...");

    const priceData = new URLSearchParams({
      product: product.id,
      unit_amount: String(Math.round(parseFloat(finalPrice) * 100)), // Convert to cents
      currency: currency.toLowerCase(),
      active: "true",
      "recurring[interval]": "month",
    });

    console.log("Main price params:", priceData.toString());

    console.log("Making request to create main price...");
    const priceResponse = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // Note: No Stripe-Account header - creating in platform account
      },
      body: priceData.toString(),
    });

    console.log("Main price response status:", priceResponse.status);
    console.log(
      "Main price response headers:",
      Object.fromEntries(priceResponse.headers.entries()),
    );

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text();
      console.log("Main price creation failed:", errorText);
      throw new Error(`Failed to create price: ${errorText}`);
    }

    const stripePrice = await priceResponse.json();
    console.log("Main price created successfully:", stripePrice.id);

    console.log("=== FUNCTION COMPLETED SUCCESSFULLY ===");
    const result = {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
      },
      price: {
        id: stripePrice.id,
        unit_amount: stripePrice.unit_amount,
        currency: stripePrice.currency,
        recurring: stripePrice.recurring,
      },
      dynamicProduct: dynamicProductId
        ? {
          id: dynamicProductId,
          name: `${name} - Dynamic`,
        }
        : null,
      dynamicPrice: dynamicPrice
        ? {
          id: dynamicPrice!.id,
          unit_amount: dynamicPrice!.unit_amount,
          currency: dynamicPrice!.currency,
          recurring: dynamicPrice!.recurring,
        }
        : null,
    };

    console.log("Returning result:", JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: unknown) {
    console.log("=== FUNCTION ERROR ===");
    console.log(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.log(
      "Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.log(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/insert-product' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
