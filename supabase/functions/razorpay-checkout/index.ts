import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const keyId = Deno.env.get("RAZORPAY_KEY_ID");
        const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

        if (!keyId || !keySecret) {
            console.error("Missing Razorpay API keys in environment variables");
            return new Response(
                JSON.stringify({ error: "Server Configuration Error: Razorpay keys not found" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        const { action, amount, currency = "INR", receipt, paymentDetails } = await req.json();
        const auth = btoa(`${keyId}:${keySecret}`);

        // 1. Create Order
        if (action === "create-order") {
            console.log(`Creating Razorpay order for amount: ${amount}`);

            const response = await fetch("https://api.razorpay.com/v1/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${auth}`
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    currency,
                    receipt
                })
            });

            const orderData = await response.json();

            if (!response.ok) {
                console.error("Razorpay Order Creation Failed:", orderData);
                return new Response(
                    JSON.stringify({ error: orderData.error?.description || "Razorpay API Error" }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
                );
            }

            return new Response(JSON.stringify(orderData), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // 2. Verify Payment
        if (action === "verify-payment") {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(keySecret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
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
        console.error("Edge Function Exception:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
