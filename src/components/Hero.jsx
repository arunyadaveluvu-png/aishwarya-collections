import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    const scrollToShop = () => {
        const section = document.getElementById('products-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section" style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#fdf5e6',
            background: 'linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url("https://www.palamsilk.com/cdn/shop/products/DSC_9089.jpg?v=1668645651") center/cover no-repeat'
        }}>
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ maxWidth: '600px', color: 'white' }}
                >
                    <span style={{
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        fontSize: '0.8rem',
                        color: 'var(--primary)',
                        fontWeight: 'bold',
                        display: 'block',
                        marginBottom: '1rem'
                    }}>New Collection 2026</span>
                    <h1 className="hero-title" style={{
                        fontSize: '4.5rem',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        color: 'white'
                    }}>
                        The Art of <br />
                        <span style={{ fontStyle: 'italic', fontWeight: '300' }}>Timeless Elegance</span>
                    </h1>
                    <p className="hero-subtitle" style={{ fontSize: '1.1rem', marginBottom: '2.5rem', opacity: 0.9 }}>
                        Discover our curated collection of hand-woven masterpieces, where every thread tells a story of heritage and luxury.
                    </p>
                    <div className="hero-buttons" style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem' }} onClick={scrollToShop}>Shop Now</button>
                        <button style={{
                            padding: '16px 32px',
                            fontSize: '1rem',
                            color: 'white',
                            border: '1px solid white',
                            borderRadius: '4px'
                        }}>Explore Heritage</button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative vertical badge */}
            <div style={{
                position: 'absolute',
                right: '5%',
                bottom: '10%',
                writingMode: 'vertical-rl',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                letterSpacing: '8px',
                textTransform: 'uppercase',
                borderLeft: '1px solid var(--primary)',
                paddingLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <span>Est. 2026</span>
                <div style={{ width: '1px', height: '100px', backgroundColor: 'var(--primary)' }}></div>
                <span>Aishwarya Collections Luxury</span>
            </div>
        </section>
    );
};

export default Hero;
