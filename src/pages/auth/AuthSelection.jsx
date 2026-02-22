import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';

const AuthSelection = () => {
    return (
        <div className="container" style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="glass-morphism" style={{
                padding: '4rem 3rem',
                borderRadius: '32px',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <Logo size="medium" />
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Please select your login type to continue your journey.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '1.2rem'
                        }}>
                            <User size={22} />
                            Continue as Customer
                        </button>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                    </div>

                    <Link to="/admin-login" style={{ textDecoration: 'none' }}>
                        <button className="btn-outline" style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '1.2rem',
                            borderColor: 'var(--secondary)',
                            color: 'var(--secondary)'
                        }}>
                            <ShieldCheck size={22} />
                            Administrator Access
                        </button>
                    </Link>
                </div>

                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    marginTop: '2.5rem'
                }}>
                    <ArrowLeft size={16} />
                    Back to Store
                </Link>
            </div>
        </div>
    );
};

export default AuthSelection;
