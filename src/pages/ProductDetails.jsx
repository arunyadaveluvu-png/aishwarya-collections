import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ShoppingCart, Heart, ArrowLeft, Star, MessageSquare, Send, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = ({ addToCart }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isFavorited = id ? isInWishlist(id) : false;
    const [selectedSize, setSelectedSize] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [currentUser, setCurrentUser] = useState(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [checkPurchaseLoading, setCheckPurchaseLoading] = useState(true);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (err) {
            console.error("Error fetching product:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchReviews = useCallback(async () => {
        try {
            setReviewsLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url)
                `)
                .eq('product_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err.message);
        } finally {
            setReviewsLoading(false);
        }
    }, [id]);

    const checkUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user) {
            checkPurchaseStatus(user.id);
        } else {
            setCheckPurchaseLoading(false);
        }
    }, [id]);

    const checkPurchaseStatus = async (userId) => {
        try {
            setCheckPurchaseLoading(true);
            // Check if user has a delivered order containing this product
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    order_items!inner(product_id)
                `)
                .eq('user_id', userId)
                .eq('status', 'Delivered')
                .eq('order_items.product_id', id);

            if (error) throw error;
            setHasPurchased(data && data.length > 0);
        } catch (err) {
            console.error("Error checking purchase status:", err.message);
        } finally {
            setCheckPurchaseLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please login to leave a review.');
            return;
        }

        if (!newReview.comment.trim()) {
            alert('Please write a comment.');
            return;
        }

        try {
            setSubmittingReview(true);
            const { error } = await supabase
                .from('reviews')
                .insert([{
                    product_id: id,
                    user_id: currentUser.id,
                    rating: newReview.rating,
                    comment: newReview.comment
                }]);

            if (error) throw error;

            setNewReview({ rating: 5, comment: '' });
            fetchReviews(); // Refresh reviews
            alert('Review submitted successfully!');
        } catch (err) {
            alert('Error submitting review: ' + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        checkUser();

        // Subscribe to live stock updates for this product
        const channel = supabase
            .channel(`product-stock-${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                    filter: `id=eq.${id}`
                },
                (payload) => {
                    // Update only the changed fields (especially stock) without a full refetch
                    setProduct(prev => prev ? { ...prev, ...payload.new } : payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProduct, id]);

    if (loading) return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>Weaving the details for you...</p>
        </div>
    );

    if (error || !product) return (
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent)' }}>Product Not Found</h2>
            <p style={{ margin: '1rem 0' }}>{error || "The saree you're looking for might have moved."}</p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-block' }}>Back to Collection</Link>
        </div>
    );

    return (
        <div className="container" style={{ padding: '5rem 0' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '2rem', textDecoration: 'none' }}>
                <ArrowLeft size={18} />
                Back to Collection
            </Link>

            <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    <img
                        src={product.image_url || product.image}
                        alt={product.name}
                        onError={(e) => {
                            console.warn(`[Aishwarya Collections] Image failed to load for product ${product.id}:`, product.image_url || product.image);
                            e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop';
                        }}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    {product.isNew && (
                        <span style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            borderRadius: '4px'
                        }}>New Arrival</span>
                    )}
                </div>

                <div>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>{product.category}</span>
                    <h1 className="product-details-title" style={{ fontSize: '3rem', margin: '1rem 0', lineHeight: '1.2' }}>{product.name}</h1>
                    <p className="product-details-price" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>₹{product.price}</p>

                    {/* Stock Availability Badge */}
                    {(() => {
                        const stock = product.stock ?? product.quantity ?? null;
                        if (stock === null) return null;
                        if (stock === 0) return (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                    ❌ Out of Stock
                                </span>
                            </div>
                        );
                        if (stock <= 5) return (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                    ⚠️ Only {stock} pieces left — Order soon!
                                </span>
                            </div>
                        );
                        return (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534' }}>
                                    ✅ In Stock ({stock} available)
                                </span>
                            </div>
                        );
                    })()}

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Description</h4>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                            {product.description || "This exquisite hand-woven saree represents the pinnacle of Indian craftsmanship. Made with the finest threads, it features intricate patterns that carry centuries of heritage. Perfect for weddings, formal occasions, and celebrations."}
                        </p>
                    </div>

                    {!['Silk', 'Cotton', 'Designer', 'Wedding'].includes(product.category) && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Select Size</h4>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['S', 'M', 'XL', 'XXL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '4px',
                                            border: selectedSize === size ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            backgroundColor: selectedSize === size ? 'var(--bg-alt)' : 'white',
                                            color: selectedSize === size ? 'var(--primary)' : 'var(--secondary)',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-primary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}
                            onClick={() => {
                                if (!['Silk', 'Cotton', 'Designer', 'Wedding'].includes(product.category) && !selectedSize) {
                                    alert('Please select a size first!');
                                    return;
                                }
                                addToCart(product, selectedSize);
                            }}
                        >
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            style={{
                                padding: '16px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                background: 'white',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <Heart
                                size={20}
                                fill={isFavorited ? "var(--accent)" : "none"}
                                color={isFavorited ? "var(--accent)" : "var(--secondary)"}
                            />
                        </button>
                    </div>

                    <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>Material & Care</h5>
                                <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', color: 'var(--text)' }}>
                                    <li>100% Hand-woven {product.category}</li>
                                    <li>Dry clean only</li>
                                    <li>Store in a cool, dry place</li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>Shipping</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                                    Complimentary shipping across India. Expected delivery in 5-7 business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', backgroundColor: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '4px', borderLeft: '4px solid var(--primary)' }}>
                        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Styling Tip</h5>
                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Pair this {product.name} with traditional gold jewelry and a contrasting blouse for a timeless, regal look.
                        </p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem' }} className="reviews-grid">
                    {/* Review Form */}
                    <div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'serif' }}>Customer Reviews</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', color: 'var(--accent)' }}>
                                {[1, 2, 3, 4, 5].map(star => {
                                    const average = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
                                    return <Star key={star} size={20} fill={star <= average ? "var(--accent)" : "none"} />;
                                })}
                            </div>
                            <span style={{ fontWeight: '600' }}>
                                {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'No reviews yet'}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>({reviews.length} reviews)</span>
                        </div>

                        {currentUser ? (
                            checkPurchaseLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <div className="loading-spinner"></div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Verifying purchase...</p>
                                </div>
                            ) : hasPurchased ? (
                                <form onSubmit={handleReviewSubmit} className="glass-morphism" style={{ padding: '2rem', borderRadius: '12px' }}>
                                    <h4 style={{ marginBottom: '1.5rem' }}>Write a Review</h4>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Rating</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <Star
                                                        size={24}
                                                        fill={star <= newReview.rating ? "var(--accent)" : "none"}
                                                        color={star <= newReview.rating ? "var(--accent)" : "#cbd5e1"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Comment</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                            rows="4"
                                            placeholder="Share your thoughts about this saree..."
                                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'vertical' }}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="btn-primary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        {submittingReview ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : (
                                            <>
                                                <Send size={18} />
                                                Submit Review
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-alt)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                    <Truck size={32} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <h5 style={{ marginBottom: '0.5rem' }}>Not Purchased Yet?</h5>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Only customers who have bought and received this saree can leave a review. This ensures all reviews are from real owners!</p>
                                </div>
                            )
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-alt)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                <MessageSquare size={32} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Only logged-in customers who purchased this can leave a review.</p>
                                <Link to="/login" className="btn-outline" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none', fontSize: '0.8rem' }}>Log In to Review</Link>
                            </div>
                        )}
                    </div>

                    {/* Review List */}
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {reviewsLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {review.profiles?.avatar_url ? (
                                                        <img src={review.profiles.avatar_url} alt={review.profiles.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <User size={20} color="var(--text-muted)" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{review.profiles?.full_name || 'Verified Customer'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', color: 'var(--accent)' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={14} fill={star <= review.rating ? "var(--accent)" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '0.95rem' }}>{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-alt)', borderRadius: '12px' }}>
                                    <Star size={40} color="var(--border)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <h4>No reviews yet</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to share your experience with this saree.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
