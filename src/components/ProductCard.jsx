import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, addToCart }) => {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isFavorited = isInWishlist(product.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'relative',
                backgroundColor: 'var(--white)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                cursor: 'pointer'
            }}
        >
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                    <img
                        src={product.image_url || product.image}
                        alt={product.name}
                        onError={(e) => {
                            console.warn(`[Aishwarya Collections] Image failed to load for product ${product.id}:`, product.image_url || product.image);
                            e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop';
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'all 0.5s ease',
                            filter: 'brightness(1.05)' // Subtle brightness boost by default
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.filter = 'brightness(1.15)'; // Pop on hover
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.filter = 'brightness(1.05)';
                        }}
                    />
                    {product.isNew && (
                        <span style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            padding: '4px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            borderRadius: '2px'
                        }}>New</span>
                    )}
                </div>
            </Link>

            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                    }}
                    style={{
                        backgroundColor: 'white',
                        padding: '8px',
                        borderRadius: '50%',
                        border: 'none',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Heart
                        size={18}
                        fill={isFavorited ? "var(--accent)" : "none"}
                        color={isFavorited ? "var(--accent)" : "var(--secondary)"}
                    />
                </button>
            </div>

            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
                    <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0', color: 'var(--secondary)' }}>{product.name}</h3>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '1.2rem' }}>₹{product.price}</p>
                </Link>
                <button
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => addToCart(product)}
                >
                    <ShoppingCart size={18} />
                    Add to Cart
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
