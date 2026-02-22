import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, Key } from 'lucide-react';
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
    const { register, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await register(email, password);
            // After successful signup, move to OTP step
            setStep(2);
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
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border)'
                }}
            >
                <div style={{
                    backgroundColor: 'black',
                    margin: '-3rem -3rem 2.5rem -3rem',
                    padding: '3rem',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Logo size="medium" light={true} />
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '10px' }}>
                        {step === 1 ? 'Create an account to experience luxury' : 'Verify your luxury account'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fff5f5',
                        color: 'var(--accent)',
                        padding: '1rem',
                        borderRadius: '4px',
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
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Full Name</label>
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
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Email Address</label>
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
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem'
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
                                fontSize: '1.1rem'
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
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Almost there! We've sent a 6-digit confirmation code to <strong>{email}</strong>.
                            </p>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Verification Code</label>
                            <div style={{ position: 'relative' }}>
                                <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem'
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
                                fontSize: '1.1rem'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Back to Registration
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                        Sign in here
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
