import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";

const STEPS = ["Pending", "Preparing", "Shipped", "Delivered"];

const statusColors = {
    Pending: { bg: "#fef9c3", color: "#854d0e" },
    Preparing: { bg: "#dbeafe", color: "#1e40af" },
    Shipped: { bg: "#e0e7ff", color: "#3730a3" },
    Delivered: { bg: "#dcfce7", color: "#166534" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

const stepIcons = ["🕐", "📦", "🚚", "✅"];

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [review, setReview] = useState({ rating: 5, comment: "", image: null });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedItems, setReviewedItems] = useState([]);

    useEffect(() => {
        fetchOrder();
        checkExistingReviews();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);

            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*")
                .eq("id", id)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);

            const { data: itemData, error: itemError } = await supabase
                .from("order_items")
                .select("*, products(name, image_url)")
                .eq("order_id", id);

            if (itemError) throw itemError;
            setItems(itemData || []);
        } catch (err) {
            console.error("Error fetching order:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkExistingReviews = async () => {
        const { data } = await supabase
            .from("product_reviews")
            .select("product_id")
            .eq("order_id", id);
        setReviewedItems(data?.map(r => r.product_id) || []);
    };

    const handleReviewSubmit = async (productId) => {
        try {
            setSubmittingReview(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let imageUrl = null;
            if (review.image) {
                const fileExt = review.image.name.split(".").pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("order-reviews")
                    .upload(`reviews/${fileName}`, review.image);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage
                    .from("order-reviews")
                    .getPublicUrl(`reviews/${fileName}`);
                imageUrl = publicUrl;
            }

            const { error } = await supabase.from("product_reviews").insert([{
                order_id: id,
                product_id: productId,
                user_id: user.id,
                rating: review.rating,
                comment: review.comment,
                image_url: imageUrl
            }]);

            if (error) throw error;
            alert("Thank you for your review!");
            setReviewedItems(prev => [...prev, productId]);
            setReview({ rating: 5, comment: "", image: null });
        } catch (err) {
            alert("Error submitting review: " + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStep = (status) => Math.max(0, STEPS.indexOf(status));

    if (loading) return (
        <div style={{ padding: "4rem", textAlign: "center" }}>
            <div className="loading-spinner" />
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading order details...</p>
        </div>
    );

    if (!order) return (
        <div style={{ padding: "4rem", textAlign: "center" }}>
            <p>Order not found.</p>
            <button className="btn" onClick={() => navigate("/account/orders")}>Back to Orders</button>
        </div>
    );

    const step = getStep(order.status);
    const statusStyle = statusColors[order.status] || { bg: "#f3f4f6", color: "#374151" };
    const shortId = order.id.slice(0, 8).toUpperCase();
    const date = new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
    });

    return (
        <div style={{ padding: "clamp(1rem, 4vw, 4rem)", maxWidth: "900px", margin: "0 auto" }}>

            {/* Back button */}
            <button
                onClick={() => navigate("/account/orders")}
                style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", padding: 0
                }}
            >
                <ArrowLeft size={16} /> Back to Orders
            </button>

            {/* Order Header */}
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "clamp(1rem, 3vw, 1.8rem)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "1.5rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "12px"
            }}>
                <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: "clamp(1.1rem, 3.5vw, 1.5rem)" }}>
                        Order #{shortId}
                    </h2>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Placed on {date}</span>
                </div>
                <span style={{
                    padding: "6px 14px", borderRadius: "20px", fontWeight: "700", fontSize: "0.85rem",
                    backgroundColor: statusStyle.bg, color: statusStyle.color
                }}>
                    {order.status}
                </span>
            </div>

            {/* ── Order Tracking ── */}
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "clamp(1rem, 3vw, 1.8rem)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "1.5rem"
            }}>
                <h4 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Package size={18} color="var(--primary)" /> Order Tracking
                </h4>

                {order.status === "Cancelled" ? (
                    <div style={{
                        textAlign: "center", padding: "1.5rem",
                        background: "#fee2e2", borderRadius: "12px", color: "#991b1b"
                    }}>
                        ❌ This order has been cancelled.
                    </div>
                ) : (
                    <>
                        {/* Stepper — horizontal scrolls on small screens */}
                        <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
                            <div style={{
                                display: "flex",
                                minWidth: "280px",
                                position: "relative",
                            }}>
                                {/* Connecting line behind circles */}
                                <div style={{
                                    position: "absolute",
                                    top: "17px",
                                    left: "calc(12.5%)",
                                    right: "calc(12.5%)",
                                    height: "3px",
                                    background: "#e5e7eb",
                                    zIndex: 0
                                }} />
                                {/* Active progress line */}
                                <div style={{
                                    position: "absolute",
                                    top: "17px",
                                    left: "calc(12.5%)",
                                    width: step > 0
                                        ? `calc(${(step / (STEPS.length - 1)) * 75}%)`
                                        : "0%",
                                    height: "3px",
                                    background: "var(--primary)",
                                    transition: "width 0.5s ease",
                                    zIndex: 1
                                }} />

                                {STEPS.map((label, index) => {
                                    const done = index <= step;
                                    return (
                                        <div key={label} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                                            <div style={{
                                                width: "36px", height: "36px", borderRadius: "50%",
                                                margin: "0 auto",
                                                background: done ? "var(--primary)" : "#e5e7eb",
                                                color: done ? "#fff" : "#9ca3af",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "1rem",
                                                border: done ? "none" : "2px solid #e5e7eb",
                                                transition: "background 0.3s ease",
                                                boxShadow: index === step ? "0 0 0 4px rgba(212,175,55,0.2)" : "none"
                                            }}>
                                                {stepIcons[index]}
                                            </div>
                                            <p style={{
                                                fontSize: "clamp(0.65rem, 2vw, 0.75rem)",
                                                marginTop: "8px",
                                                fontWeight: index === step ? "700" : "400",
                                                color: done ? "var(--secondary)" : "#9ca3af",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Current status label */}
                        <p style={{
                            textAlign: "center", marginTop: "1.2rem",
                            fontSize: "0.9rem", color: "var(--text-muted)"
                        }}>
                            {order.status === "Pending" && "We've received your order and are confirming payment."}
                            {order.status === "Preparing" && "Your order is being carefully packed."}
                            {order.status === "Shipped" && "Your order is on its way! Estimated delivery: 3-5 days."}
                            {order.status === "Delivered" && "Your order has been delivered. Enjoy your purchase! ✨"}
                        </p>
                    </>
                )}
            </div>

            {/* ── Delivery Address ── */}
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "clamp(1rem, 3vw, 1.8rem)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "1.5rem",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem"
            }}
                className="order-info-grid"
            >
                <div>
                    <h5 style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                        <MapPin size={14} /> Delivery Address
                    </h5>
                    <p style={{ fontWeight: "700", margin: "0 0 4px" }}>{order.first_name} {order.last_name}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>{order.address}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>{order.city} — {order.pincode}</p>
                </div>
                <div>
                    <h5 style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
                        <CreditCard size={14} /> Payment
                    </h5>
                    <p style={{ fontWeight: "700", margin: "0 0 4px", textTransform: "uppercase" }}>{order.payment_method}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 4px" }}>
                        Total: <strong style={{ color: "var(--primary-dark)" }}>₹{Number(order.total).toLocaleString("en-IN")}</strong>
                    </p>
                </div>
            </div>

            {/* ── Ordered Items ── */}
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "clamp(1rem, 3vw, 1.8rem)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
            }}>
                <h4 style={{ marginBottom: "1.2rem" }}>Ordered Items</h4>

                {items.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No items found.</p>
                ) : (
                    items.map(item => (
                        <div key={item.id} style={{
                            borderBottom: "1px solid #f3f4f6", paddingBottom: "1.5rem", marginBottom: "1.5rem"
                        }}>
                            {/* Item Row */}
                            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <img
                                    src={item.products?.image_url}
                                    alt={item.products?.name}
                                    style={{
                                        width: "clamp(70px, 15vw, 90px)",
                                        height: "clamp(85px, 18vw, 110px)",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                        flexShrink: 0
                                    }}
                                    onError={e => e.target.src = "https://placehold.co/90x110?text=No+Image"}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: "700", margin: "0 0 6px", fontSize: "clamp(0.9rem, 2.5vw, 1rem)" }}>
                                        {item.products?.name || item.product_name}
                                    </p>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 4px" }}>
                                        Qty: {item.quantity}
                                    </p>
                                    <p style={{ color: "var(--primary-dark)", fontWeight: "700", margin: 0 }}>
                                        ₹{Number(item.price).toLocaleString("en-IN")}
                                    </p>
                                    {item.selected_size && (
                                        <span style={{
                                            display: "inline-block", marginTop: "6px",
                                            padding: "2px 8px", borderRadius: "4px",
                                            background: "#f3f4f6", fontSize: "0.75rem", color: "#6b7280"
                                        }}>
                                            Size: {item.selected_size}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Review section — only for delivered items not yet reviewed */}
                            {order.status === "Delivered" && !reviewedItems.includes(item.product_id) && (
                                <div style={{
                                    marginTop: "1rem", padding: "1.2rem",
                                    background: "#f9fafb", borderRadius: "12px",
                                    border: "1px solid #e5e7eb"
                                }}>
                                    <h5 style={{ margin: "0 0 12px", fontSize: "0.95rem" }}>⭐ Rate & Review</h5>

                                    {/* Stars */}
                                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                                                style={{
                                                    background: "none", border: "none",
                                                    cursor: "pointer", fontSize: "1.4rem", padding: "0 2px",
                                                    color: star <= review.rating ? "#f59e0b" : "#d1d5db"
                                                }}
                                            >★</button>
                                        ))}
                                    </div>

                                    <textarea
                                        placeholder="Tell us what you liked about this saree..."
                                        value={review.comment}
                                        onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "10px", boxSizing: "border-box",
                                            borderRadius: "8px", border: "1px solid #d1d5db",
                                            height: "70px", resize: "vertical", fontSize: "0.9rem"
                                        }}
                                    />

                                    <button
                                        className="btn"
                                        disabled={submittingReview}
                                        onClick={() => handleReviewSubmit(item.product_id)}
                                        style={{ marginTop: "10px", width: "100%" }}
                                    >
                                        {submittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </div>
                            )}

                            {reviewedItems.includes(item.product_id) && (
                                <p style={{ color: "#10b981", fontSize: "0.9rem", marginTop: "10px", fontWeight: "600" }}>
                                    ✓ You've reviewed this item
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderDetails;