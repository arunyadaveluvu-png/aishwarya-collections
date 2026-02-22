import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { UserPlus, Trash2, Shield, Eye, EyeOff, Users } from 'lucide-react';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [deleting, setDeleting] = useState(null);

    const fetchAdmins = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('admins')
            .select('id, username, created_at')
            .order('created_at', { ascending: false });
        if (!error) setAdmins(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchAdmins(); }, []);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!form.username.trim() || !form.password.trim()) {
            showMsg('error', 'Username and password are required.');
            return;
        }
        if (form.password.length < 6) {
            showMsg('error', 'Password must be at least 6 characters.');
            return;
        }
        setSaving(true);
        try {
            // Check if username already exists
            const { data: existing } = await supabase
                .from('admins')
                .select('id')
                .eq('username', form.username.trim())
                .single();

            if (existing) {
                showMsg('error', 'An admin with that username already exists.');
                setSaving(false);
                return;
            }

            const { error } = await supabase.from('admins').insert({
                username: form.username.trim(),
                password: form.password,
            });
            if (error) throw error;
            showMsg('success', `Admin "${form.username}" added successfully!`);
            setForm({ username: '', password: '' });
            fetchAdmins();
        } catch (err) {
            showMsg('error', err.message || 'Failed to add admin.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Remove admin "${username}"? This cannot be undone.`)) return;
        setDeleting(id);
        const { error } = await supabase.from('admins').delete().eq('id', id);
        if (error) {
            showMsg('error', 'Failed to remove admin.');
        } else {
            showMsg('success', `Admin "${username}" removed.`);
            fetchAdmins();
        }
        setDeleting(null);
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                    <Shield size={28} color="var(--primary)" />
                    <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--secondary)' }}>Manage Admins</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add or remove admin accounts for the store panel.</p>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? '#f0fff4' : '#fff5f5',
                    border: `1px solid ${message.type === 'success' ? '#68d391' : '#fc8181'}`,
                    color: message.type === 'success' ? '#276749' : '#c53030',
                    fontWeight: '500'
                }}>
                    {message.text}
                </div>
            )}

            {/* Add Admin Form */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #eee',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                    <UserPlus size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add New Admin</h3>
                </div>
                <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--secondary)' }}>
                            Username *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. admin2"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                            required
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '8px',
                                border: '1px solid var(--border)', fontSize: '0.95rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--secondary)' }}>
                            Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                                style={{
                                    width: '100%', padding: '10px 42px 10px 14px', borderRadius: '8px',
                                    border: '1px solid var(--border)', fontSize: '0.95rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                            }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '12px', borderRadius: '8px',
                            backgroundColor: 'var(--primary)', color: 'var(--secondary)',
                            border: 'none', fontWeight: '700', fontSize: '0.95rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <UserPlus size={18} />
                        {saving ? 'Adding...' : 'Add Admin'}
                    </button>
                </form>
            </div>

            {/* Admin List */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #eee'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                    <Users size={20} color="var(--secondary)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Current Admins ({admins.length})</h3>
                </div>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading admins...</p>
                ) : admins.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No admins found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {admins.map(admin => (
                            <div key={admin.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', borderRadius: '10px',
                                border: '1px solid #f0f0f0', background: '#fafafa'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        backgroundColor: 'var(--primary)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--secondary)', fontWeight: '700', fontSize: '1rem'
                                    }}>
                                        {admin.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>{admin.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Added {new Date(admin.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(admin.id, admin.username)}
                                    disabled={deleting === admin.id}
                                    style={{
                                        background: 'none', border: '1px solid #fc8181',
                                        borderRadius: '8px', padding: '6px 12px',
                                        cursor: 'pointer', color: '#c53030', fontSize: '0.85rem',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    <Trash2 size={15} />
                                    {deleting === admin.id ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAdmins;
