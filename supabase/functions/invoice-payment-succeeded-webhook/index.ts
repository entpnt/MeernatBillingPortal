import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

interface RevenueShareConfig {
  platformFeePercentage: number; // Platform's cut (e.g., 0.40 for 40%)
  fixedAccountPercentage: number; // Fixed account's cut (e.g., 0.30 for 30%)
  connectedAccountPercentage: number; // Connected account's cut (e.g., 0.30 for 30%)
  minimumTransferAmount: number; // Minimum amount to transfer (in cents)
  transferDescription: string; // Description for the transfer
  fixedAccountId: string; // Fixed account to transfer to
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info",
};

serve(async (req) => {
  console.log("=== WEBHOOK REQUEST START ===");
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Request headers:`, Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    console.log(`Invalid method: ${req.method}`);
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

  try {
    const body = await req.json();
    const event = body;

    console.log("=== WEBHOOK EVENT DATA ===");
    console.log(`Event type: ${event.type}`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Event created: ${event.created}`);
    console.log(`Event API version: ${event.api_version}`);
    console.log(`Event livemode: ${event.livemode}`);
    console.log("Full event data:", JSON.stringify(event, null, 2));

    // Handle invoice payment succeeded
    if (event.type === "invoice.payment_succeeded") {
      console.log("=== PROCESSING INVOICE PAYMENT SUCCEEDED ===");
      const invoice = event.data.object as Stripe.Invoice;

      console.log("=== INVOICE DETAILS ===");
      console.log(`Invoice ID: ${invoice.id}`);
      console.log(`Invoice amount paid: ${invoice.amount_paid} cents`);
      console.log(`Invoice currency: ${invoice.currency}`);
      console.log(`Invoice status: ${invoice.status}`);
      console.log(`Invoice subscription: ${invoice.subscription}`);
      console.log(`Invoice customer: ${invoice.customer}`);
      console.log(`Invoice created: ${invoice.created}`);
      console.log(`Invoice due date: ${invoice.due_date}`);
      console.log("Full invoice data:", JSON.stringify(invoice, null, 2));

      // Check for subscription ID in multiple locations
      let subscriptionId = invoice.subscription;

      // If not found directly, check in parent.subscription_details
      if (
        !subscriptionId && invoice.parent?.subscription_details?.subscription
      ) {
        subscriptionId = invoice.parent.subscription_details.subscription;
        console.log(
          `Found subscription ID in parent.subscription_details: ${subscriptionId}`,
        );
      }

      // Only process subscription invoices (not one-time payments)
      if (subscriptionId) {
        console.log("Processing subscription invoice");
        await handleSubscriptionPayment(invoice, subscriptionId);
      } else {
        console.log(
          "Skipping non-subscription invoice - no subscription ID found",
        );
      }
    } else {
      console.log(
        `Skipping event type: ${event.type} - not invoice.payment_succeeded`,
      );
    }

    console.log("=== WEBHOOK PROCESSING COMPLETE ===");
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error type:", typeof err);
    console.error("Error constructor:", err?.constructor?.name);
    console.error(
      "Error message:",
      err instanceof Error ? err.message : "Unknown error",
    );
    console.error(
      "Error stack:",
      err instanceof Error ? err.stack : "No stack trace",
    );
    console.error(
      "Full error object:",
      JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
    );

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "An error occurred",
        details: err instanceof Error ? err.stack : "No details available",
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
});

async function handleSubscriptionPayment(
  invoice: Stripe.Invoice,
  subscriptionId: string,
) {
  console.log("=== HANDLING SUBSCRIPTION PAYMENT ===");
  console.log(`Invoice ID: ${invoice.id}`);
  console.log(`Subscription ID: ${subscriptionId}`);

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    console.error("Missing Stripe secret key in environment variables");
    throw new Error("Missing Stripe secret key");
  }
  console.log("Stripe secret key found (length):", stripeSecretKey.length);

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });
  console.log("Stripe client initialized");

  try {
    // Get the subscription to find the connected account
    console.log("=== RETRIEVING SUBSCRIPTION ===");
    console.log(`Fetching subscription: ${subscriptionId}`);

    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId,
      { expand: ["items.data.price.product"] },
    );

    console.log("=== SUBSCRIPTION DETAILS ===");
    console.log(`Subscription ID: ${subscription.id}`);
    console.log(`Subscription status: ${subscription.status}`);
    console.log(`Subscription customer: ${subscription.customer}`);
    console.log(`Subscription items count: ${subscription.items.data.length}`);
    console.log(
      "Full subscription data:",
      JSON.stringify(subscription, null, 2),
    );

    // Find the connected account ID from the subscription items
    let connectedAccountId: string | null = null;

    console.log("=== SEARCHING FOR CONNECTED ACCOUNT ===");
    for (const item of subscription.items.data) {
      console.log(`Processing subscription item: ${item.id}`);
      console.log(`Item price ID: ${item.price.id}`);
      console.log(`Item quantity: ${item.quantity}`);

      const product = item.price.product as Stripe.Product;
      console.log(`Product ID: ${product.id}`);
      console.log(`Product name: ${product.name}`);
      console.log(`Product metadata:`, product.metadata);

      if (product.metadata?.connected_account_id) {
        connectedAccountId = product.metadata.connected_account_id;
        console.log(`Found connected account ID: ${connectedAccountId}`);
        break;
      } else {
        console.log("No connected_account_id in product metadata");
      }
    }

    if (!connectedAccountId) {
      console.log("=== NO CONNECTED ACCOUNT FOUND ===");
      console.log(
        `No connected account found for subscription ${subscription.id}`,
      );
      console.log("Available subscription items:");
      subscription.items.data.forEach(
        (item: Stripe.SubscriptionItem, index: number) => {
          const product = item.price.product as Stripe.Product;
          console.log(
            `  Item ${index + 1}: Product ${product.id} - ${product.name}`,
          );
          console.log(`    Metadata:`, product.metadata);
        },
      );
      return;
    }

    console.log(`=== CONNECTED ACCOUNT FOUND ===`);
    console.log(`Connected account ID: ${connectedAccountId}`);

    // Calculate revenue sharing
    console.log("=== CALCULATING REVENUE SHARE ===");
    const revenueShare = await calculateRevenueShare(invoice);
    revenueShare.connectedAccountId = connectedAccountId; // Set the connected account ID

    console.log("=== REVENUE SHARE CALCULATION COMPLETE ===");
    console.log("Revenue share object:", JSON.stringify(revenueShare, null, 2));

    // Create transfers if amounts are greater than 0
    if (revenueShare.fixedAccountAmount > 0) {
      console.log("=== CREATING FIXED ACCOUNT TRANSFER ===");
      console.log(`Amount: ${revenueShare.fixedAccountAmount} cents`);
      console.log(`Destination: ${revenueShare.fixedAccountId}`);

      try {
        await createTransfer({
          amountToTransfer: revenueShare.fixedAccountAmount,
          description: "Fixed account revenue share from subscription payment",
          destinationAccountId: revenueShare.fixedAccountId,
          metadata: {
            type: "revenue_share",
            source: "subscription_payment",
            account_type: "fixed",
            total_amount: revenueShare.totalAmount.toString(),
            invoice_id: invoice.id,
            subscription_id: subscription.id,
          },
        }, stripe);
        console.log("Fixed account transfer created successfully");
      } catch (transferError) {
        console.error("=== FIXED ACCOUNT TRANSFER ERROR ===");
        console.error("Transfer error:", transferError);
        throw transferError;
      }
    } else {
      console.log("=== SKIPPING FIXED ACCOUNT TRANSFER ===");
      console.log(
        `Amount is ${revenueShare.fixedAccountAmount}, which is not greater than 0`,
      );
    }

    if (revenueShare.connectedAccountAmount > 0) {
      console.log("=== CREATING CONNECTED ACCOUNT TRANSFER ===");
      console.log(`Amount: ${revenueShare.connectedAccountAmount} cents`);
      console.log(`Destination: ${revenueShare.connectedAccountId}`);

      try {
        await createTransfer({
          amountToTransfer: revenueShare.connectedAccountAmount,
          description:
            "Connected account revenue share from subscription payment",
          destinationAccountId: revenueShare.connectedAccountId,
          metadata: {
            type: "revenue_share",
            source: "subscription_payment",
            account_type: "connected",
            total_amount: revenueShare.totalAmount.toString(),
            invoice_id: invoice.id,
            subscription_id: subscription.id,
          },
        }, stripe);
        console.log("Connected account transfer created successfully");
      } catch (transferError) {
        console.error("=== CONNECTED ACCOUNT TRANSFER ERROR ===");
        console.error("Transfer error:", transferError);
        throw transferError;
      }
    } else {
      console.log("=== SKIPPING CONNECTED ACCOUNT TRANSFER ===");
      console.log(
        `Amount is ${revenueShare.connectedAccountAmount}, which is not greater than 0`,
      );
    }

    console.log(`=== REVENUE SHARING COMPLETED ===`);
    console.log(`Successfully processed invoice ${invoice.id}`);
    console.log(`Total amount: ${revenueShare.totalAmount} cents`);
    console.log(
      `Fixed account transfer: ${revenueShare.fixedAccountAmount} cents`,
    );
    console.log(
      `Connected account transfer: ${revenueShare.connectedAccountAmount} cents`,
    );
    console.log(`Platform fee: ${revenueShare.platformFee} cents`);
  } catch (error) {
    console.error("=== SUBSCRIPTION PAYMENT PROCESSING ERROR ===");
    console.error(
      `Error processing subscription payment for invoice ${invoice.id}:`,
    );
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error",
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    console.error(
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    );
    throw error;
  }
}

async function calculateRevenueShare(
  invoice: Stripe.Invoice,
): Promise<
  {
    fixedAccountAmount: number;
    connectedAccountAmount: number;
    platformFee: number;
    totalAmount: number;
    fixedAccountId: string;
    connectedAccountId: string;
  }
> {
  console.log("=== CALCULATING REVENUE SHARE ===");
  console.log(`Invoice ID: ${invoice.id}`);
  console.log(`Invoice amount paid: ${invoice.amount_paid} cents`);

  // Configuration - you can make this dynamic based on account or product
  const config: RevenueShareConfig = {
    platformFeePercentage: 0.40, // 40% platform fee
    fixedAccountPercentage: 0.30, // 30% to fixed account
    connectedAccountPercentage: 0.30, // 30% to connected account
    minimumTransferAmount: 50, // 50 cents minimum
    transferDescription: "Revenue share from subscription payment",
    fixedAccountId: "acct_1RbOFAFMw8JL5icU", // Fixed account ID
  };

  console.log("=== REVENUE SHARE CONFIGURATION ===");
  console.log("Config object:", JSON.stringify(config, null, 2));

  const totalAmount = invoice.amount_paid;
  const platformFee = Math.round(totalAmount * config.platformFeePercentage);
  const fixedAccountAmount = Math.round(
    totalAmount * config.fixedAccountPercentage,
  );
  const connectedAccountAmount = Math.round(
    totalAmount * config.connectedAccountPercentage,
  );

  console.log("=== REVENUE SHARE CALCULATIONS ===");
  console.log(`Total amount: ${totalAmount} cents`);
  console.log(
    `Platform fee percentage: ${config.platformFeePercentage * 100}%`,
  );
  console.log(`Platform fee: ${platformFee} cents`);
  console.log(
    `Fixed account percentage: ${config.fixedAccountPercentage * 100}%`,
  );
  console.log(`Fixed account amount: ${fixedAccountAmount} cents`);
  console.log(
    `Connected account percentage: ${config.connectedAccountPercentage * 100}%`,
  );
  console.log(`Connected account amount: ${connectedAccountAmount} cents`);

  // Apply minimum transfer amounts
  const finalFixedAccountAmount = Math.max(
    fixedAccountAmount,
    config.minimumTransferAmount,
  );
  const finalConnectedAccountAmount = Math.max(
    connectedAccountAmount,
    config.minimumTransferAmount,
  );

  console.log("=== FINAL AMOUNTS AFTER MINIMUM ADJUSTMENT ===");
  console.log(`Minimum transfer amount: ${config.minimumTransferAmount} cents`);
  console.log(`Final fixed account amount: ${finalFixedAccountAmount} cents`);
  console.log(
    `Final connected account amount: ${finalConnectedAccountAmount} cents`,
  );

  const result = {
    fixedAccountAmount: finalFixedAccountAmount,
    connectedAccountAmount: finalConnectedAccountAmount,
    platformFee,
    totalAmount,
    fixedAccountId: config.fixedAccountId,
    connectedAccountId: "", // This will be set by the calling function
  };

  console.log("=== REVENUE SHARE RESULT ===");
  console.log("Result object:", JSON.stringify(result, null, 2));

  return result;
}

async function createTransfer(
  transferData: {
    amountToTransfer: number;
    description: string;
    destinationAccountId: string;
    metadata: Record<string, string>;
  },
  stripe: Stripe,
) {
  console.log("=== CREATING TRANSFER ===");
  console.log("Transfer data:", JSON.stringify(transferData, null, 2));

  try {
    // Create transfer to destination account
    console.log("Calling Stripe transfers.create...");
    const transfer = await stripe.transfers.create({
      amount: transferData.amountToTransfer,
      currency: "usd",
      destination: transferData.destinationAccountId,
      description: transferData.description,
      metadata: transferData.metadata,
    });

    console.log("=== TRANSFER CREATED SUCCESSFULLY ===");
    console.log(`Transfer ID: ${transfer.id}`);
    console.log(`Transfer amount: ${transfer.amount} cents`);
    console.log(`Transfer destination: ${transfer.destination}`);
    console.log(`Transfer status: ${transfer.status}`);
    console.log(`Transfer created: ${transfer.created}`);
    console.log("Full transfer object:", JSON.stringify(transfer, null, 2));

    return transfer;
  } catch (error) {
    console.error("=== TRANSFER CREATION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error",
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    if (error && typeof error === "object" && "type" in error) {
      const stripeError = error as {
        type?: string;
        code?: string;
        param?: string;
        decline_code?: string;
      };
      console.error("Stripe error type:", stripeError.type);
      console.error("Stripe error code:", stripeError.code);
      console.error("Stripe error param:", stripeError.param);
      console.error("Stripe error decline_code:", stripeError.decline_code);
    }

    console.error(
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    );
    throw error;
  }
}
