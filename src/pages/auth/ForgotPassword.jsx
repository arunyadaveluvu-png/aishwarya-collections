import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Lock, Key, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const { sendPasswordResetOtp, verifyOtp, updatePassword, resendOtp } = useAuth();
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await sendPasswordResetOtp(email);
            setStep(2);
            setResendTimer(60);
        } catch (err) {
            setError(err.message || 'Error sending reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        try {
            setError('');
            await resendOtp(email, 'recovery');
            setResendTimer(60);
            alert('A new reset code has been sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to resend code.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        setError('');
        try {
            // Step 1: Verify OTP (this logs the user in)
            await verifyOtp(email, otp, 'recovery');
            // Step 2: Update Password
            await updatePassword(password);

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Error updating password. The code might be incorrect or expired.');
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
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '1rem' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {step === 1 ? 'Enter your email to receive a recovery code' : 'Enter the code from your email'}
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

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '1rem 0' }}
                        >
                            <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                                <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', fontSize: '1.5rem' }}>Success!</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Your password has been reset. Redirecting to login...
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key={step}>
                            {step === 1 ? (
                                <form onSubmit={handleSendOtp}>
                                    <div style={{ marginBottom: '2rem' }}>
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
                                        {loading ? 'Sending...' : 'Send Reset Code'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleResetPassword}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Verification Code</label>
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
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '1rem',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 45px 12px 40px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '1rem',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Confirm Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repeat password"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 45px 12px 40px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '1rem',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
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
                                            borderRadius: '8px',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>

                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={resendTimer > 0}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                                fontSize: '0.85rem',
                                                cursor: resendTimer > 0 ? 'default' : 'pointer',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <RefreshCw size={12} />
                                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{
                                            width: '100%',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Back to email
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <Link to="/login" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: 'var(--text-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            <ArrowLeft size={16} />
                            Back to sign in
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
