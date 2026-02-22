import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

const statusColors = {
    Pending: { bg: "#fef9c3", color: "#854d0e" },
    Preparing: { bg: "#dbeafe", color: "#1e40af" },
    Shipped: { bg: "#e0e7ff", color: "#3730a3" },
    Delivered: { bg: "#dcfce7", color: "#166534" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) return;

            const { data } = await supabase
                .from("orders")
                .select("*, order_items(count)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching orders:", err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: "4rem", textAlign: "center" }}>
            <div className="loading-spinner" />
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading your orders...</p>
        </div>
    );

    return (
        <div style={{ padding: "clamp(1.5rem, 4vw, 4rem)", maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                <ShoppingBag size={28} color="var(--primary)" />
                <div>
                    <h2 style={{ margin: 0, fontSize: "clamp(1.3rem, 4vw, 2rem)" }}>My Orders</h2>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "4rem 2rem",
                    background: "#fff", borderRadius: "16px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                }}>
                    <Package size={64} color="#ccc" style={{ marginBottom: "1rem" }} />
                    <h3 style={{ color: "var(--text-muted)" }}>No orders yet</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                        Your order history will appear here after your first purchase.
                    </p>
                    <button className="btn" onClick={() => navigate("/")}>Start Shopping</button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {orders.map(order => {
                        const statusStyle = statusColors[order.status] || { bg: "#f3f4f6", color: "#374151" };
                        const date = new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                        });
                        const shortId = order.id.slice(0, 8).toUpperCase();

                        return (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/account/orders/${order.id}`)}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #f0f0f0",
                                    borderRadius: "14px",
                                    padding: "clamp(1rem, 3vw, 1.5rem)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    transition: "box-shadow 0.2s, transform 0.15s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: "46px", height: "46px", flexShrink: 0,
                                    borderRadius: "12px", background: "rgba(212,175,55,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Package size={22} color="var(--primary)" />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                                            #{shortId}
                                        </span>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: "20px",
                                            fontSize: "0.72rem", fontWeight: "700",
                                            backgroundColor: statusStyle.bg, color: statusStyle.color
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>
                                        {date}
                                    </div>
                                    <div style={{ fontWeight: "700", color: "var(--primary-dark)", marginTop: "4px" }}>
                                        ₹{Number(order.total).toLocaleString("en-IN")}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRight size={20} color="#ccc" style={{ flexShrink: 0 }} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;