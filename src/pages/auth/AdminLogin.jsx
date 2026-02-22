import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, Smartphone, CheckCircle } from 'lucide-react';
import Logo from '../../components/Logo';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mfaStep, setMfaStep] = useState('login'); // login, enroll, verify
    const [factorId, setFactorId] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [qrCode, setQrCode] = useState('');
    const navigate = useNavigate();
    const { login, refreshProfile } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Verify credentials against the dedicated admins table first
            // This is what the user provided: admin@aishwaryacollections.com / admin123
            const { data: adminRecord, error: adminQueryError } = await supabase
                .from('admins')
                .select('*')
                .eq('username', email)
                .eq('password', password)
                .single();

            if (adminQueryError || !adminRecord) {
                throw new Error('Invalid admin credentials. Please check your username and password.');
            }

            // 2. Credentials are valid in our custom table. Now ensure they have a Supabase Auth account.
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            let activeUser = signInData?.user;

            // 3. If login fails because the user doesn't exist in Supabase Auth, create them!
            if (signInError) {
                console.log("[AdminLogin] Auth Login failed, attempting auto-registration...");
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { role: 'admin' }
                    }
                });

                if (signUpError) throw signUpError;
                activeUser = signUpData.user;

                if (!activeUser) {
                    throw new Error('Verification required. Please check your email to activate your admin account.');
                }
            }

            // 4. Ensure the profile has the 'admin' role for RLS policies to work
            if (activeUser) {
                await supabase.from('profiles').upsert({
                    id: activeUser.id,
                    name: 'Administrator',
                    role: 'admin'
                });

                // 4b. CRITICAL: Refresh the AuthContext profile so ProtectedAdminRoute knows we are admin!
                await refreshProfile(activeUser.id, activeUser.email);
            }

            // 5. Navigate to dashboard
            navigate('/admin');
        } catch (err) {
            console.error('[AdminLogin] Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: totpCode
            });

            if (verifyError) throw verifyError;

            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: totpCode
            });

            if (verifyError) throw verifyError;

            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="glass-morphism" style={{
                padding: '3.5rem',
                borderRadius: '32px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    backgroundColor: 'black',
                    margin: '-3.5rem -3.5rem 2.5rem -3.5rem',
                    padding: '3rem',
                    borderRadius: '32px 32px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Logo size="medium" light={true} />
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '10px' }}>
                        {mfaStep === 'login' ? 'Secure management portal for Aishwarya Collections staff.' : (mfaStep === 'enroll' ? 'Scan the QR code with your authenticator app.' : 'Enter the 6-digit code from your app.')}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: '1px solid #fecaca'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {mfaStep === 'login' && (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your-email@aishwaryacollections.com"
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Security Key</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn"
                            style={{
                                marginTop: '1rem',
                                padding: '1.2rem',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {loading ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : 'Enter Dashboard'}
                        </button>
                    </form>
                )}

                {(mfaStep === 'enroll' || mfaStep === 'verify') && (
                    <form onSubmit={mfaStep === 'enroll' ? handleEnroll : handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                        {mfaStep === 'enroll' && qrCode && (
                            <div style={{ margin: '0 auto 1.5rem', backgroundColor: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
                                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>Authentication Code</label>
                            <input
                                type="text"
                                required
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '10px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || totpCode.length < 6}
                            className="btn"
                            style={{
                                marginTop: '1rem',
                                padding: '1.2rem',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {loading ? <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div> : (mfaStep === 'enroll' ? 'Enroll & Verify' : 'Verify Code')}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <Link to="/auth-selection" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} />
                        Back to Selection
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
