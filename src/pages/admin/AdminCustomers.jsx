import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Users, Mail, ShoppingBag, TrendingUp, Search, Calendar, Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ email: '', password: '', name: '' });
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const projectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyoidkfzbwsolaonpddk.supabase.co';

            const res = await fetch(`${projectUrl}/functions/v1/get-customers`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                    'apikey': 'sb_publishable_eEy_5GM0aN7PKnu2QNae3w_ioMyX5Vw'
                }
            });

            // Improved error handling for non-JSON or server errors
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || `Server Error: ${res.status}`);
                setCustomers(json.customers || []);
            } else {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                throw new Error(`Invalid response from server. Check if Edge Function is deployed and URL is correct. ${res.status}`);
            }
        } catch (err) {
            console.error('Error fetching customers:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            setAdding(true);
            const { data: { session } } = await supabase.auth.getSession();
            const projectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyoidkfzbwsolaonpddk.supabase.co';

            const res = await fetch(`${projectUrl}/functions/v1/get-customers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                    'apikey': 'sb_publishable_eEy_5GM0aN7PKnu2QNae3w_ioMyX5Vw'
                },
                body: JSON.stringify(addForm)
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to add customer');

            setCustomers(prev => [json.user, ...prev]);
            setShowAddModal(false);
            setAddForm({ email: '', password: '', name: '' });
            alert('Customer added successfully!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteId) return;
        try {
            setDeleting(true);
            const { data: { session } } = await supabase.auth.getSession();
            const projectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyoidkfzbwsolaonpddk.supabase.co';

            const res = await fetch(`${projectUrl}/functions/v1/get-customers?id=${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                    'apikey': 'sb_publishable_eEy_5GM0aN7PKnu2QNae3w_ioMyX5Vw'
                }
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to delete user');

            setCustomers(prev => prev.filter(c => c.id !== deleteId));
            setDeleteId(null);
            alert('User credentials deleted successfully.');
        } catch (err) {
            console.error('Delete error:', err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const filtered = customers.filter(c =>
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const activeCustomers = customers.filter(c => (c.orders || 0) > 0).length;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'Never';
        const d = new Date(dateStr);
        const diff = Date.now() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div style={{ padding: '0', position: 'relative' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)', margin: '0 0 6px' }}>
                        Customers
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        All registered users from Supabase Auth
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                    style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Users size={18} />
                    Add Customer
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Customers', value: customers.length, icon: Users, color: '#6366f1' },
                    { label: 'Active Buyers', value: activeCustomers, icon: ShoppingBag, color: '#10b981' },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'var(--primary)' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: '#fff', borderRadius: '14px', padding: '1.5rem',
                        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: '1.2rem'
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: `${stat.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <stat.icon size={24} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: 1.2 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search/Actions Bar */}
            <div style={{ position: 'relative', marginBottom: '1.5rem', display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '0.9rem 1rem 0.9rem 3rem',
                            borderRadius: '12px', border: '1px solid var(--border)',
                            fontSize: '1rem', outline: 'none', background: '#fff',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                </div>
                <button onClick={fetchCustomers} className="btn-secondary" style={{ padding: '0 1.5rem', borderRadius: '12px' }}>
                    Refresh
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ background: '#fff1f1', border: '1px solid #fee2e2', color: '#991b1b', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <AlertTriangle size={20} />
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>Data Fetch Error</strong>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{error}</p>
                        </div>
                    </div>
                    <button onClick={fetchCustomers} style={{ alignSelf: 'flex-start', padding: '8px 20px', borderRadius: '8px', background: '#991b1b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                        Try Again
                    </button>
                </div>
            )}

            {/* Content List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1.5rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading customer profiles...</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                                    {['Customer', 'Joined', 'Last Login', 'Stats', 'Status', 'Actions'].map(col => (
                                        <th key={col} style={{ padding: '1.2rem 1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: '700' }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                                <Users size={40} opacity={0.3} />
                                                <p style={{ margin: 0, fontSize: '1.1rem' }}>No customers match your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(customer => (
                                    <tr key={customer.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: 'var(--primary-light)', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '700', fontSize: '1rem', color: 'var(--primary)'
                                                }}>
                                                    {(customer.name || customer.email)?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--secondary)' }}>{customer.name || 'Anonymous User'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customer.email || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} />
                                                {formatDate(customer.created_at)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {formatTime(customer.last_sign_in_at)}
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)' }}>{customer.orders} Orders</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: '600' }}>₹{customer.total_spent.toLocaleString('en-IN')}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                                background: customer.orders > 0 ? '#dcfce7' : '#f3f4f6',
                                                color: customer.orders > 0 ? '#166534' : '#6b7280',
                                                display: 'inline-block', border: `1px solid ${customer.orders > 0 ? '#bbf7d0' : '#e5e7eb'}`
                                            }}>
                                                {customer.orders > 0 ? 'Active Buyer' : 'Lead'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <button
                                                onClick={() => setDeleteId(customer.id)}
                                                style={{
                                                    background: 'transparent', border: 'none', color: '#ef4444',
                                                    cursor: 'pointer', padding: '8px', borderRadius: '8px',
                                                    transition: 'background 0.2s'
                                                }}
                                                className="btn-icon-hover"
                                                title="Delete User Credentials"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Customer Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '20px'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '16px', padding: '2rem',
                                maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary)' }}>Add New Customer</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--secondary)' }}>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={addForm.name}
                                        onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--secondary)' }}>Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="customer@example.com"
                                        value={addForm.email}
                                        onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--secondary)' }}>Password *</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Min. 6 characters"
                                        value={addForm.password}
                                        onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="btn-primary"
                                        style={{ padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        {adding ? 'Creating...' : 'Create Customer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deletion Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '20px'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#fff', borderRadius: '16px', padding: '2rem',
                                maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem'
                                }}>
                                    <Trash2 size={28} color="#ef4444" />
                                </div>
                                <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary)' }}>Delete User Credentials?</h3>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    This will permanently remove the user's authentication credentials. The user will be logged out and cannot log back in.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleting}
                                    style={{
                                        padding: '12px', borderRadius: '10px', border: '1px solid var(--border)',
                                        background: '#fff', color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={deleting}
                                    style={{
                                        padding: '12px', borderRadius: '10px', border: 'none',
                                        background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCustomers;
