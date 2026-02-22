import { createClient } from "supabase";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore: Deno is available in Supabase Edge Runtime
Deno.serve(async (req: Request) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // 2. Setup Admin Supabase Client
    const supabaseAdmin = createClient(
        // @ts-ignore
        Deno.env.get("SUPABASE_URL") ?? "",
        // @ts-ignore
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 3. Security Check
    if (req.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    try {
        // 4. Fetch Auth Users
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });
        if (usersError) throw usersError;

        // 5. Fetch Public Profiles
        const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name");

        // 6. Fetch Order Stats
        const { data: orderStats } = await supabaseAdmin
            .from("orders")
            .select("user_id, total")
            .not("user_id", "is", null);

        // 7. Aggregate Data
        const profilesMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
            profilesMap[p.id] = p.full_name;
        });

        const statsMap: Record<string, { count: number; spent: number }> = {};
        for (const order of (orderStats || [])) {
            const uid = order.user_id as string;
            if (!statsMap[uid]) statsMap[uid] = { count: 0, spent: 0 };
            statsMap[uid].count += 1;
            statsMap[uid].spent += Number(order.total) || 0;
        }

        const customers = users.map((u: any) => ({
            id: u.id,
            email: u.email || "No email",
            name: profilesMap[u.id] || "No name set",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            orders: statsMap[u.id]?.count || 0,
            total_spent: statsMap[u.id]?.spent || 0,
        }));

        return new Response(JSON.stringify({ customers }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
