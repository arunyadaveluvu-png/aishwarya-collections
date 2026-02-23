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
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <a href="https://www.instagram.com/aishwaryacollections_2/" target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="https://chat.whatsapp.com/JUedXD0G72mFGioH8TLNCV" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408.001 12.045a11.815 11.815 0 001.591 5.976L0 24l6.146-1.612a11.822 11.822 0 005.904 1.577h.004c6.632 0 12.042-5.408 12.045-12.046a11.811 11.811 0 00-3.417-8.525z" />
                                </svg>
                            </a>
                        </div>
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
