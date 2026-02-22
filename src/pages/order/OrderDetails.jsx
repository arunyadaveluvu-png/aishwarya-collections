import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useParams } from "react-router-dom";

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [review, setReview] = useState({ rating: 5, comment: '', image: null });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewedItems, setReviewedItems] = useState([]);

    useEffect(() => {
        fetchOrder();
        checkExistingReviews();
    }, [id]);

    const checkExistingReviews = async () => {
        const { data } = await supabase
            .from('product_reviews')
            .select('product_id')
            .eq('order_id', id);
        setReviewedItems(data?.map(r => r.product_id) || []);
    };

    const handleReviewSubmit = async (productId) => {
        try {
            setSubmittingReview(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let imageUrl = null;
            if (review.image) {
                const fileExt = review.image.name.split('.').pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                const filePath = `reviews/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('order-reviews')
                    .upload(filePath, review.image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('order-reviews')
                    .getPublicUrl(filePath);
                imageUrl = publicUrl;
            }

            const { error } = await supabase
                .from('product_reviews')
                .insert([{
                    order_id: id,
                    product_id: productId,
                    user_id: user.id,
                    rating: review.rating,
                    comment: review.comment,
                    image_url: imageUrl
                }]);

            if (error) throw error;

            alert('Thank you for your review!');
            setReviewedItems([...reviewedItems, productId]);
            setReview({ rating: 5, comment: '', image: null });
        } catch (err) {
            alert('Error submitting review: ' + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStep = (status) => {
        if (status === "Pending") return 1;
        if (status === "Preparing") return 2;
        if (status === "Shipped") return 3;
        if (status === "Delivered") return 4;
        return 1;
    };

    if (loading) return <p style={{ padding: "4rem" }}>Loading...</p>;
    if (!order) return <p style={{ padding: "4rem" }}>Order not found</p>;

    const step = getStep(order.status);

    return (
        <div className="container" style={{ padding: "4rem 0", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ marginBottom: "2rem" }}>Order Details</h2>

            {/* Tracking Section */}
            <div style={{
                marginBottom: "30px",
                padding: "20px",
                borderRadius: "12px",
                background: "#fff",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
            }}>
                <h4>Order Tracking</h4>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                    {["Pending", "Preparing", "Shipped", "Delivered"].map((label, index) => (
                        <div key={label} style={{ textAlign: "center", flex: 1 }}>
                            <div
                                style={{
                                    width: "35px",
                                    height: "35px",
                                    borderRadius: "50%",
                                    margin: "0 auto",
                                    background: index + 1 <= step ? "#7a0000" : "#ccc",
                                    transition: "0.3s ease"
                                }}
                            ></div>
                            <p style={{ fontSize: "12px", marginTop: "8px" }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Address Section */}
            <div style={{
                background: "#f9f9f9",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "30px"
            }}>
                <h4>Delivery Address</h4>
                <p><strong>{order.first_name} {order.last_name}</strong></p>
                <p>{order.address}</p>
                <p>{order.city} - {order.pincode}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>
                <p><strong>Status:</strong> {order.status}</p>
            </div>

            {/* Ordered Items */}
            <h4>Ordered Items</h4>

            {items.map(item => (
                <div key={item.id} style={{
                    borderBottom: "1px solid #ddd",
                    padding: "20px 0"
                }}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "15px" }}>
                        <img
                            src={item.products?.image_url}
                            alt=""
                            width="80"
                            style={{ borderRadius: "8px" }}
                        />
                        <div>
                            <p><strong>{item.products?.name}</strong></p>
                            <p>Price: ₹{item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    </div>

                    {/* Rate & Review Section (Only for Delivered Items) */}
                    {order.status === "Delivered" && !reviewedItems.includes(item.product_id) && (
                        <div className="glass-morphism" style={{ padding: "1.5rem", marginTop: "1rem", borderRadius: "12px" }}>
                            <h5 style={{ marginBottom: "10px" }}>Rate & Review</h5>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                                <div style={{ flex: 1, minWidth: "200px" }}>
                                    <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "5px" }}>Rating</label>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setReview({ ...review, rating: star })}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    fontSize: "1.2rem",
                                                    color: star <= review.rating ? "#f59e0b" : "#ccc"
                                                }}
                                            >★</button>
                                        ))}
                                    </div>
                                    <textarea
                                        placeholder="Tell us what you liked about this saree..."
                                        value={review.comment}
                                        onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                        style={{ width: "100%", marginTop: "10px", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", height: "60px" }}
                                    />
                                </div>
                                <div style={{ width: "150px" }}>
                                    <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "5px" }}>Add Photo</label>
                                    <div
                                        onClick={() => document.getElementById(`review-upload-${item.id}`).click()}
                                        style={{
                                            width: "100%", height: "100px", borderRadius: "8px", border: "1px dashed #ccc",
                                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden"
                                        }}
                                    >
                                        <input
                                            id={`review-upload-${item.id}`}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => setReview({ ...review, image: e.target.files[0] })}
                                            style={{ display: "none" }}
                                        />
                                        {review.image ? (
                                            <img src={URL.createObjectURL(review.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ fontSize: "1.5rem", color: "#ccc" }}>+</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn"
                                disabled={submittingReview}
                                onClick={() => handleReviewSubmit(item.product_id)}
                                style={{ marginTop: "15px", width: "100%" }}
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    )}

                    {reviewedItems.includes(item.product_id) && (
                        <p style={{ color: "#10b981", fontSize: "0.9rem", marginTop: "10px", fontWeight: "600" }}>✓ You've reviewed this item</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OrderDetails;