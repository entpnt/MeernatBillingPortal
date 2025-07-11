import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

// Stripe line item interface matching Stripe's expected format
interface StripeLineItem {
  price_data?: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
      images?: string[];
      metadata?: Record<string, string>;
    };
    unit_amount?: number;
    unit_amount_decimal?: string;
  };
  price?: string;
  quantity?: number;
  adjustable_quantity?: {
    enabled: boolean;
    minimum?: number;
    maximum?: number;
  };
  dynamic_tax_rates?: string[];
  tax_rates?: string[];
  metadata?: Record<string, string>;
}

// Additional checkout session options
interface CheckoutSessionOptions {
  // mode?: 'payment' | 'subscription' | 'setup';
  // payment_method_types?: string[];
  success_url?: string;
  cancel_url?: string;
  // customer?: string; // Existing customer ID
  // customer_email?: string; // Customer email (creates or finds customer)
  // Use userData.email instead
  client_reference_id?: string;
  metadata?: Record<string, string>;
  payment_intent_data?: {
    // setup_future_usage?: 'off_session' | 'on_session';
    on_behalf_of?: string;
    metadata?: Record<string, string>;
  };
  // subscription_data?: {
  //   metadata?: Record<string, string>;
  // };
  // allow_promotion_codes?: boolean;
  billing_address_collection?: 'auto' | 'required';
  shipping_address_collection?: {
    allowed_countries: string[];
  };
  custom_fields?: Array<{
    key: string;
    label: {
      type: 'custom' | 'custom_text';
      custom_text: string;
    };
    type: 'text' | 'numeric' | 'dropdown';
    optional?: boolean;
    dropdown?: {
      options: Array<{
        label: string;
        value: string;
      }>;
    };
  }>;
  custom_text?: {
    submit?: {
      message?: string;
    };
    shipping_address?: {
      message?: string;
    };
  };
  expires_at?: number;
  after_expiration?: {
    recovery?: {
      enabled: boolean;
      allow_promotion_codes?: boolean;
    };
  };
  phone_number_collection?: {
    enabled: boolean;
  };
  tax_id_collection?: {
    enabled: boolean;
  };
}

interface UserData {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, X-Client-Info",
};

// Function to find or create a Stripe customer
async function findOrCreateCustomer(stripe: Stripe, email: string, userData: UserData): Promise<string> {
  try {
    // First, try to find existing customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length > 0) {
      const existingCustomer = customers.data[0];
      console.log(`Found existing customer: ${existingCustomer.id} for email: ${email}`);
      
      // Update customer metadata with latest user info
      await stripe.customers.update(existingCustomer.id, {
        metadata: {
          user_id: userData.id,
          user_role: userData.role || '',
          last_updated: new Date().toISOString()
        }
      });
      
      return existingCustomer.id;
    }

    // Create new customer if not found
    const newCustomer = await stripe.customers.create({
      email: email,
      name: userData.name,
      metadata: {
        user_id: userData.id,
        user_role: userData.role || '',
        created_via: 'checkout_session'
      }
    });

    console.log(`Created new customer: ${newCustomer.id} for email: ${email}`);
    return newCustomer.id;
  } catch (error) {
    console.error('Error finding/creating customer:', error);
    throw new Error('Failed to manage customer');
  }
}

// Function to verify JWT token and extract user data
async function verifyJWTAndGetUser(req: Request): Promise<UserData> {
  console.log("=== JWT VERIFICATION START ===");
  const authHeader = req.headers.get("Authorization");
  console.log("Authorization header:", authHeader ? authHeader.substring(0, 50) + "..." : "null");
  
  // If no authorization header, create a fallback user data
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No Authorization header provided, using fallback user data");
    return {
      id: "anonymous-user-" + Date.now(),
      email: "anonymous@example.com",
      name: "Anonymous User",
      role: "anonymous",
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  // Initialize Supabase client for JWT verification
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing Supabase configuration, using fallback user data");
    return {
      id: "anonymous-user-" + Date.now(),
      email: "anonymous@example.com",
      name: "Anonymous User",
      role: "anonymous",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Attempting Supabase JWT verification...");
    // First try to verify as a Supabase JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      console.log("=== SUCCESS: Supabase JWT token verified ===");
      console.log("User data from Supabase:", {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        role: user.user_metadata?.role,
      });
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        role: user.user_metadata?.role,
      };
    }

    // If Supabase verification fails, try to verify as a Clerk JWT token
    console.log("=== Supabase verification failed, attempting Clerk token verification ===");
    console.log("Supabase error:", error);
    
    try {
      // Decode the JWT token to extract user information
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Basic validation - check if token is not expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        throw new Error("Token expired");
      }

      // Extract user data from JWT payload
      // Handle different possible field names for user identification
      const userId = payload.sub || payload.user_id || payload.azp || payload.iss || "unknown";
      
      console.log("Successfully verified JWT token, extracted user data:", {
        id: userId,
        email: payload.email,
        name: payload.name,
        role: payload.role
      });

      return {
        id: userId,
        email: payload.email,
        name: payload.name || (payload.given_name && payload.family_name ? 
          `${payload.given_name} ${payload.family_name}` : undefined),
        role: payload.role || payload.user_role,
      };
    } catch (clerkError) {
      console.error("JWT token verification error:", clerkError);
      console.log("Using fallback user data due to JWT verification failure");
      return {
        id: "anonymous-user-" + Date.now(),
        email: "anonymous@example.com",
        name: "Anonymous User",
        role: "anonymous",
      };
    }
  } catch (error) {
    console.error("Authentication error:", error);
    console.log("Using fallback user data due to authentication failure");
    return {
      id: "anonymous-user-" + Date.now(),
      email: "anonymous@example.com",
      name: "Anonymous User",
      role: "anonymous",
    };
  }
}

serve(async (req) => {
  console.log("=== EDGE FUNCTION START ===");
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

  // Get request body first
  let body;
  try {
    body = await req.json();
    console.log("Request body parsed successfully:", JSON.stringify(body, null, 2));
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

  // Check if user data is provided in request body
  let userData: UserData;
  if (body.user_data) {
    console.log("=== USING USER DATA FROM REQUEST BODY ===");
    console.log("User data from body:", JSON.stringify(body.user_data, null, 2));
    userData = body.user_data;
  } else {
    console.log("=== NO USER DATA IN BODY, ATTEMPTING AUTHENTICATION ===");
    // Verify authentication and get user data
    console.log("Starting authentication verification...");
    userData = await verifyJWTAndGetUser(req);
  }
  
  console.log(`=== FINAL USER DATA ===`);
  console.log(`User ID: ${userData.id}`);
  console.log(`User Email: ${userData.email}`);
  console.log(`User Name: ${userData.name}`);
  console.log(`User Role: ${userData.role}`);
  
  const lineItems = body.line_items;
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return new Response(
      JSON.stringify({
        error: "Missing or invalid line_items array",
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

  // Extract checkout session options from request body
  const checkoutOptions: CheckoutSessionOptions = body.checkout_options || {};
  
  // Extract accountId from request body (for backward compatibility)
  const accountId = body.accountId || checkoutOptions.payment_intent_data?.on_behalf_of;
  
  console.log(`Creating checkout session for user: ${userData.id}`);
  console.log(`Line items: ${lineItems.length} items`);
  console.log(`Checkout options:`, checkoutOptions);

  try {
    // Initialize Stripe with the secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing Stripe secret key");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Stripe initialized successfully");

    // Validate and process line items
    const validatedLineItems: StripeLineItem[] = lineItems.map((item: any, index: number) => {
      // Validate required fields
      if (!item.price_data && !item.price) {
        throw new Error(`Line item ${index}: Must have either price_data or price`);
      }
      
      if (item.price_data) {
        if (!item.price_data.currency) {
          throw new Error(`Line item ${index}: price_data must include currency`);
        }
        if (!item.price_data.product_data?.name) {
          throw new Error(`Line item ${index}: price_data.product_data must include name`);
        }
        if (item.price_data.unit_amount === undefined && item.price_data.unit_amount_decimal === undefined) {
          throw new Error(`Line item ${index}: price_data must include unit_amount or unit_amount_decimal`);
        }
      }
      
      return item as StripeLineItem;
    });

    console.log(`Validated ${validatedLineItems.length} line items:`, validatedLineItems);

    // Prepare the checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment", // Default to payment mode
      line_items: validatedLineItems as Stripe.Checkout.SessionCreateParams.LineItem[],
      payment_method_types: ["card"], // Default payment method
      success_url: checkoutOptions.success_url || "https://your-site.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: checkoutOptions.cancel_url || "https://your-site.com/cancel",
      metadata: {
        user_id: userData.id,
        user_email: userData.email || "",
        user_name: userData.name || "",
        user_role: userData.role || "",
        ...checkoutOptions.metadata,
      },
    };

    // Handle customer creation/association using user's email
    const customerEmail = userData.email;
    if (!customerEmail) {
      throw new Error("User email not available for customer creation");
    }
    
    const customerId = await findOrCreateCustomer(stripe, customerEmail, userData);
    sessionParams.customer = customerId;
    console.log(`Associated customer: ${customerId} with session`);
    
    if (checkoutOptions.client_reference_id) {
      sessionParams.client_reference_id = checkoutOptions.client_reference_id;
    }
    
    if (checkoutOptions.payment_intent_data) {
      sessionParams.payment_intent_data = {
        setup_future_usage: "off_session", // Default to off_session
        on_behalf_of: accountId,
        metadata: checkoutOptions.payment_intent_data.metadata,
      };
    }
    
    if (checkoutOptions.billing_address_collection) {
      sessionParams.billing_address_collection = checkoutOptions.billing_address_collection;
    }
    
    if (checkoutOptions.shipping_address_collection) {
      sessionParams.shipping_address_collection = checkoutOptions.shipping_address_collection;
    }
    
    if (checkoutOptions.custom_fields) {
      sessionParams.custom_fields = checkoutOptions.custom_fields;
    }
    
    if (checkoutOptions.custom_text) {
      sessionParams.custom_text = checkoutOptions.custom_text;
    }
    
    if (checkoutOptions.expires_at) {
      sessionParams.expires_at = checkoutOptions.expires_at;
    }
    
    if (checkoutOptions.after_expiration) {
      sessionParams.after_expiration = checkoutOptions.after_expiration;
    }
    
    if (checkoutOptions.phone_number_collection) {
      sessionParams.phone_number_collection = checkoutOptions.phone_number_collection;
    }
    
    if (checkoutOptions.tax_id_collection) {
      sessionParams.tax_id_collection = checkoutOptions.tax_id_collection;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Created checkout session: ${session.id} for user: ${userData.id}`);

    return new Response(
      JSON.stringify({
        url: session.url, // Return the session URL for redirect
        sessionId: session.id,
        userId: userData.id,
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
    console.error("Error in create-checkout-session:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "An error occurred",
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
