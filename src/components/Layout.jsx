import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import SessionTimeoutModal from './SessionTimeoutModal';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase';
import FloatingContact from './FloatingContact';

const Layout = ({ children, cartCount }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const { showTimeoutModal, resetTimer, logout } = useAuth();
    const [email, setEmail] = React.useState('');
    const [nlStatus, setNlStatus] = React.useState(''); // 'success' | 'error' | 'loading' | 'already'

    const handleNewsletterJoin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            setNlStatus('error');
            return;
        }
        setNlStatus('loading');
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert({ email: email.trim().toLowerCase() });
        if (error) {
            if (error.code === '23505') {
                setNlStatus('already'); // unique violation = already subscribed
            } else {
                setNlStatus('error');
            }
        } else {
            setNlStatus('success');
            setEmail('');
        }
        setTimeout(() => setNlStatus(''), 4000);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {!isAdminRoute && <Header cartCount={cartCount} />}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {!isAdminRoute && <FloatingContact />}

            <SessionTimeoutModal
                isOpen={showTimeoutModal}
                onStay={resetTimer}
                onLogout={logout}
            />
            <footer className="glass-morphism" style={{
                marginTop: '4rem',
                padding: '4rem 0',
                borderTop: '1px solid var(--border)'
            }}>
                <div className="container footer-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
                    gap: '3rem',
                    alignItems: 'start'
                }}>
                    <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <Logo size="large" />
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px' }}>
                            Exquisite hand-woven sarees for the modern woman who appreciates tradition and luxury.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Customer Care</h4>
                        <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Shipping Policy</li>
                            <li>Returns &amp; Exchanges</li>
                            <li>Sizing Guide</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>About</h4>
                        <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <li>Our Story</li>
                            <li>Artisans</li>
                            <li>Heritage</li>
                        </ul>
                    </div>
                    <div className="newsletter-container">
                        <h4 style={{ marginBottom: '1rem' }}>Newsletter</h4>
                        <form onSubmit={handleNewsletterJoin} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={nlStatus === 'loading'}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    flex: 1
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={nlStatus === 'loading'}
                                style={{ padding: '8px 16px', cursor: nlStatus === 'loading' ? 'not-allowed' : 'pointer' }}
                            >
                                {nlStatus === 'loading' ? '...' : 'Join'}
                            </button>
                        </form>
                        {nlStatus === 'success' && (
                            <p style={{ color: '#276749', fontSize: '0.82rem', marginTop: '6px', fontWeight: '500' }}>
                                ✅ You're subscribed! Thank you.
                            </p>
                        )}
                        {nlStatus === 'already' && (
                            <p style={{ color: '#975a16', fontSize: '0.82rem', marginTop: '6px', fontWeight: '500' }}>
                                ℹ️ You're already subscribed.
                            </p>
                        )}
                        {nlStatus === 'error' && (
                            <p style={{ color: '#c53030', fontSize: '0.82rem', marginTop: '6px', fontWeight: '500' }}>
                                ❌ Please enter a valid email.
                            </p>
                        )}
                    </div>
                </div>
                <div className="container" style={{
                    marginTop: '3rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--secondary)',
                    fontWeight: '500',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '5px'
                }}>
                    <span>Copy-right © Arun. Made with <span style={{ color: '#ff4d4d' }}>❤️</span> by</span>
                    <a
                        href="https://showcase-ten-delta.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.2)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                    >
                        Arun Software Solutions
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
