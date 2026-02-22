import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, Key, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const { register, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await register(email, password);
            setStep(2);
            setResendTimer(60); // Set 60s cooldown
        } catch (err) {
            setError(err.message || 'Failed to create an account.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await verifyOtp(email, otp, 'signup');
            alert('Email verified successfully! You can now log in.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Validation failed. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        try {
            setError('');
            await resendOtp(email, 'signup');
            setResendTimer(60);
            alert('A new verification code has been sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend code.');
        }
    };

    return (
        <div className="container" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 0'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    backgroundColor: 'var(--white)',
                    padding: '3rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)'
                }}
            >
                <div style={{
                    backgroundColor: 'black',
                    margin: '-3rem -3rem 2.5rem -3rem',
                    padding: '3rem',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Logo size="medium" light={true} />
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '10px', fontSize: '0.9rem' }}>
                        {step === 1 ? 'Create an account to experience luxury' : 'Verify your account'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fff5f5',
                        color: 'var(--accent)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderLeft: '4px solid var(--accent)'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        background: '#f9fafb'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        background: '#f9fafb'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        background: '#f9fafb'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '1.1rem',
                                borderRadius: '8px'
                            }}
                        >
                            {loading ? 'Creating account...' : (
                                <>
                                    <UserPlus size={20} />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#dcfce7', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1.5rem'
                            }}>
                                <CheckCircle2 size={32} color="#10b981" />
                            </div>
                            <h3 style={{ margin: '0 0 8px', color: 'var(--secondary)' }}>Verify Email</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                We've sent a 6-digit verification code to <br />
                                <strong style={{ color: 'var(--secondary)' }}>{email}</strong>.
                            </p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--secondary)', textAlign: 'center' }}>Enter Code</label>
                            <div style={{ position: 'relative' }}>
                                <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    style={{
                                        width: '100%',
                                        padding: '16px 12px 16px 45px',
                                        borderRadius: '8px',
                                        border: '2px solid var(--border)',
                                        fontSize: '1.5rem',
                                        textAlign: 'center',
                                        letterSpacing: '8px',
                                        fontWeight: '700',
                                        background: '#fff'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '1.1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Complete Registration'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendTimer > 0}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                    fontSize: '0.9rem',
                                    cursor: resendTimer > 0 ? 'default' : 'pointer',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <RefreshCw size={14} className={resendTimer > 0 ? '' : 'spin-on-hover'} />
                                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{
                                width: '100%',
                                marginTop: '1.5rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Use a different email address
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
