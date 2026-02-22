import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../supabase';

const Wishlist = ({ addToCart }) => {
    const { wishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (wishlist.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', wishlist);

                if (error) throw error;
                setProducts(data);
            } catch (error) {
                console.error('Error fetching wishlist products:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [wishlist]);

    if (loading || wishlistLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--secondary)', fontWeight: '500' }}>Loading your favorites...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '4rem 0', minHeight: '70vh' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '0.5rem' }}>My Wishlist</h1>
                <p style={{ color: '#666' }}>Your curated collection of favorite sarees</p>
            </motion.div>

            {products.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: '#f9f9f9',
                        borderRadius: '20px',
                        border: '2px dashed var(--border)'
                    }}
                >
                    <Heart size={48} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Your wishlist is empty</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>You haven't saved any sarees yet. Browse our collection and heart the ones you love!</p>
                    <Link to="/" className="btn-primary" style={{ padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        Browse Collection <ArrowRight size={18} />
                    </Link>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    <AnimatePresence>
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="wishlist-card"
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        />
                                    </Link>
                                    <button
                                        onClick={() => toggleWishlist(product.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '15px',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '35px',
                                            height: '35px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'var(--accent)'
                                        }}
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', marginBottom: '1rem' }}>₹{product.price}</p>
                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="btn-primary"
                                            style={{ flex: 1, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <ShoppingCart size={18} /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
