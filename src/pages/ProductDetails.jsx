import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ShoppingCart, Heart, ArrowLeft, Truck, CheckCircle } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = ({ addToCart }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isFavorited = id ? isInWishlist(id) : false;
    const [selectedSize, setSelectedSize] = useState(null);
    const [pincode, setPincode] = useState('');
    const [estimation, setEstimation] = useState(null);

    const handleCheckDelivery = () => {
        if (pincode.length !== 6) {
            alert('Please enter a valid 6-digit pincode');
            return;
        }

        const date = new Date();
        const options = { month: 'short', day: 'numeric' };

        if (pincode === '515701') {
            // Local: 2-3 days
            const minDate = new Date(); minDate.setDate(date.getDate() + 2);
            const maxDate = new Date(); maxDate.setDate(date.getDate() + 3);
            setEstimation(`Estimated delivery by ${minDate.toLocaleDateString('en-IN', options)} - ${maxDate.toLocaleDateString('en-IN', options)}`);
        } else if (['51', '52', '53', '56', '57', '58', '59', '60', '61', '62', '63', '64'].some(p => pincode.startsWith(p))) {
            // South India (simplified check for 51-53, 56-64 prefixes)
            const minDate = new Date(); minDate.setDate(date.getDate() + 4);
            const maxDate = new Date(); maxDate.setDate(date.getDate() + 6);
            setEstimation(`Estimated delivery by ${minDate.toLocaleDateString('en-IN', options)} - ${maxDate.toLocaleDateString('en-IN', options)}`);
        } else {
            // Rest of India: 8-10 days
            const minDate = new Date(); minDate.setDate(date.getDate() + 8);
            const maxDate = new Date(); maxDate.setDate(date.getDate() + 10);
            setEstimation(`Estimated delivery by ${minDate.toLocaleDateString('en-IN', options)} - ${maxDate.toLocaleDateString('en-IN', options)}`);
        }
    };

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

    useEffect(() => {
        fetchProduct();

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

                    {/* Sizes Section - Dynamic from DB */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Select Size</h4>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {product.sizes.map(size => (
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
                                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
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

                    {/* Delivery Estimation Section */}
                    <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={18} color="var(--primary)" /> Check Delivery Estimates
                        </h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                maxLength={6}
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                style={{
                                    flex: 1,
                                    padding: '10px 15px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleCheckDelivery}
                                className="btn-outline"
                                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                            >
                                Check
                            </button>
                        </div>

                        {estimation && (
                            <div style={{ marginTop: '1rem', color: 'var(--secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={16} color="#166534" />
                                <span>{estimation}</span>
                            </div>
                        )}
                        {!estimation && (
                            <p style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Enter pincode to see actual delivery date for your location.
                            </p>
                        )}
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
        </div>
    );
};

export default ProductDetails;
