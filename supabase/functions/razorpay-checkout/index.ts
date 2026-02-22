import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2.9.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const razorpay = new Razorpay({
            key_id: Deno.env.get("RAZORPAY_KEY_ID") || "",
            key_secret: Deno.env.get("RAZORPAY_KEY_SECRET") || "",
        });

        const { action, amount, currency = "INR", receipt, paymentDetails } = await req.json();

        // 1. Create Order
        if (action === "create-order") {
            const options = {
                amount: Math.round(amount * 100), // Razorpay expects amount in paise
                currency,
                receipt,
            };

            const order = await razorpay.orders.create(options);
            return new Response(JSON.stringify(order), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // 2. Verify Payment
        if (action === "verify-payment") {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;

            // Verification logic (Razorpay provides a utility, but we can also do it standardly)
            const secret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(body)
            );

            const expectedSignature = Array.from(new Uint8Array(signature))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");

            if (expectedSignature === razorpay_signature) {
                return new Response(JSON.stringify({ status: "success" }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                });
            } else {
                return new Response(JSON.stringify({ status: "failure", message: "Invalid signature" }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 400,
                });
            }
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
