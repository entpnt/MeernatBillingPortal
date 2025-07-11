// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info",
};

interface StripeAccount {
  id: string;
  charges_enabled: boolean;
  details_submitted: boolean;
  [key: string]: unknown;
}

serve(async (req) => {
  // Handle CORS preflight requests
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

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not found");
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Stripe initialized successfully");

    // Fetch platform account information
    const platformAccount = await stripe.accounts.retrieve();

    // Fetch connected accounts
    const connectedAccounts = await stripe.accounts.list({
      limit: 100,
    });

    // Fetch additional details for each connected account
    const enrichedAccounts = await Promise.all(
      connectedAccounts.data.map(async (account: StripeAccount) => {
        try {
          // Get account details
          const accountDetails = await stripe.accounts.retrieve(account.id);

          // Get account balance
          let balance = null;
          try {
            balance = await stripe.accounts.retrieveBalance(account.id);
          } catch (balanceError) {
            console.error(
              `Error fetching balance for account ${account.id}:`,
              balanceError,
            );
          }

          // Get account payouts
          let payouts = null;
          try {
            payouts = await stripe.payouts.list({
              stripeAccount: account.id,
              limit: 5,
            });
          } catch (payoutsError) {
            console.error(
              `Error fetching payouts for account ${account.id}:`,
              payoutsError,
            );
          }

          return {
            ...account,
            details: accountDetails,
            balance,
            recent_payouts: payouts?.data || [],
          };
        } catch (error) {
          console.error(
            `Error fetching details for account ${account.id}:`,
            error,
          );
          return account;
        }
      }),
    );

    const response = {
      platform_account: platformAccount,
      connected_accounts: {
        data: enrichedAccounts,
        has_more: connectedAccounts.has_more,
        total_count: connectedAccounts.total_count,
        url: connectedAccounts.url,
      },
      summary: {
        total_accounts: connectedAccounts.data.length,
        active_accounts: connectedAccounts.data.filter((acc: StripeAccount) =>
          acc.charges_enabled
        ).length,
        pending_accounts: connectedAccounts.data.filter((acc: StripeAccount) =>
          !acc.charges_enabled && acc.details_submitted
        ).length,
        incomplete_accounts:
          connectedAccounts.data.filter((acc: StripeAccount) =>
            !acc.details_submitted
          ).length,
      },
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-connected-accounts' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
