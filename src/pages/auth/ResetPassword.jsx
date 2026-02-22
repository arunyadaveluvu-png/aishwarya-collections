import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
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
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Error updating password. The reset link might be expired.');
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
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>New Password</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Secure your account with a new password</p>
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
                        <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Password Updated!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Your password has been reset successfully. Redirecting you to login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
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
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
