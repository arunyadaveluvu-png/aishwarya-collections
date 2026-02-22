import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
    useEffect(() => {
        // Simple confetti effect
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, []);

    return (
        <div className="container" style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div className="glass-morphism" style={{
                padding: '4rem 3rem',
                borderRadius: '32px',
                maxWidth: '600px',
                animation: 'scaleUp 0.6s ease'
            }}>
                <div style={{ color: '#16a34a', marginBottom: '2rem' }}>
                    <CheckCircle2 size={100} strokeWidth={1.5} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>Order Placed!</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.6' }}>
                    Thank you for choosing Aishwarya Collections. Your exquisite saree will be carefully packaged and shipped to you soon.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/" className="btn" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '1.2rem'
                    }}>
                        <ShoppingBag size={20} />
                        Continue Shopping
                    </Link>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: '600',
                        marginTop: '1rem'
                    }}>
                        Track your order
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div style={{
                    marginTop: '4rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                }}>
                    A confirmation email has been sent to your registered address.
                </div>
            </div>

            <style>{`
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default OrderSuccess;
