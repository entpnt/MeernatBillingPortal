import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info",
};

serve(async (req) => {
  console.log("=== PAYMENT VERIFICATION START ===");
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  if (req.method !== "POST") {
    console.log(`Method not allowed: ${req.method}`);
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
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

  // Get request body
  let body;
  try {
    body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid JSON",
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

  const { sessionId } = body;
  
  if (!sessionId) {
    return new Response(
      JSON.stringify({
        error: "Missing sessionId",
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

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing Stripe secret key");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log(`Verifying session: ${sessionId}`);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    console.log("Session retrieved:", {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      customer: session.customer,
    });

    // Check if the session is complete and paid
    if (session.status !== 'complete') {
      console.log(`Session not complete. Status: ${session.status}`);
      return new Response(
        JSON.stringify({
          verified: false,
          error: "Payment session not completed",
          session_status: session.status,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (session.payment_status !== 'paid') {
      console.log(`Payment not completed. Payment status: ${session.payment_status}`);
      return new Response(
        JSON.stringify({
          verified: false,
          error: "Payment not completed",
          payment_status: session.payment_status,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // If we have a payment intent, verify it's succeeded
    if (session.payment_intent && typeof session.payment_intent === 'object') {
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
      if (paymentIntent.status !== 'succeeded') {
        console.log(`Payment intent not succeeded. Status: ${paymentIntent.status}`);
        return new Response(
          JSON.stringify({
            verified: false,
            error: "Payment intent not succeeded",
            payment_intent_status: paymentIntent.status,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // Payment is verified as successful
    console.log("Payment verification successful");
    
    return new Response(
      JSON.stringify({
        verified: true,
        session_id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        customer_id: session.customer,
        metadata: session.metadata,
        line_items: session.line_items?.data,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );

  } catch (err: unknown) {
    console.error("Error verifying payment session:", err);
    return new Response(
      JSON.stringify({
        verified: false,
        error: err instanceof Error ? err.message : "An error occurred during verification",
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