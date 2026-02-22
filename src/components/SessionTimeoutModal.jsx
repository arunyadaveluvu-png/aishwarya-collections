import React, { useState, useEffect } from 'react';
import { LogOut, ShieldAlert, Clock } from 'lucide-react';

const SessionTimeoutModal = ({ onStay, onLogout, isOpen }) => {
    const [secondsLeft, setSecondsLeft] = useState(60);

    useEffect(() => {
        let timer;
        if (isOpen) {
            setSecondsLeft(60);
            timer = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, onLogout]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '450px',
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(122, 0, 0, 0.1)',
                animation: 'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <style>
                    {`
                        @keyframes modalSlideIn {
                            from { opacity: 0; transform: translateY(20px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}
                </style>

                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(122, 0, 0, 0.05)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <ShieldAlert size={40} color="var(--primary)" />
                </div>

                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: 'var(--secondary)',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em'
                }}>Session Expiring</h2>

                <p style={{
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    Your session is about to expire due to inactivity. Would you like to stay logged in?
                </p>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '32px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    backgroundColor: 'rgba(122, 0, 0, 0.05)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    width: 'fit-content',
                    margin: '0 auto 32px'
                }}>
                    <Clock size={20} />
                    <span>Logging out in {secondsLeft} seconds</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: '14px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                    <button
                        onClick={onStay}
                        className="btn-primary"
                        style={{
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(122, 0, 0, 0.2)'
                        }}
                    >
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutModal;
