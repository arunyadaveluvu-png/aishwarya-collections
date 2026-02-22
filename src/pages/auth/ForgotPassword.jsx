import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Error sending reset link. Please try again.');
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
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your email to receive a recovery link</p>
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

                {success ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                            <CheckCircle2 size={60} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Email Sent!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            A password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
                        </p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: '100%' }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '2rem' }}>
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
                            {loading ? 'Sending link...' : 'Send Reset Link'}
                        </button>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Link to="/login" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: 'var(--text-muted)',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
