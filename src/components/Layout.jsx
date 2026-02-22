import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import SessionTimeoutModal from './SessionTimeoutModal';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children, cartCount }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const { showTimeoutModal, resetTimer, logout } = useAuth();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {!isAdminRoute && <Header cartCount={cartCount} />}
            <main style={{ flex: 1 }}>
                {children}
            </main>

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
                            <li>Returns & Exchanges</li>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    flex: 1
                                }}
                            />
                            <button className="btn-primary" style={{ padding: '8px 16px' }}>Join</button>
                        </div>
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
                    gap: '5px'
                }}>
                    Copy-right © Arun. Made with <span style={{ color: '#ff4d4d' }}>❤️</span> by Arun Software Solutions.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
