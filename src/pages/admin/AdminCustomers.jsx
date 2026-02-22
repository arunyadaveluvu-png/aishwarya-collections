import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Users, Mail, ShoppingBag, TrendingUp, Search, Calendar } from 'lucide-react';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get the current admin's access token to authorize the edge function
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const projectUrl = import.meta.env.VITE_SUPABASE_URL;
            const res = await fetch(`${projectUrl}/functions/v1/get-customers`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to fetch customers');

            setCustomers(json.customers || []);
        } catch (err) {
            console.error('Error fetching customers:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = customers.filter(c =>
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
    const activeCustomers = customers.filter(c => c.orders > 0).length;

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
        <div style={{ padding: '0' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)', margin: '0 0 6px' }}>
                    Customers
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                    All registered users from Supabase Auth
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Customers', value: customers.length, icon: Users, color: '#6366f1' },
                    { label: 'Active Buyers', value: activeCustomers, icon: ShoppingBag, color: '#10b981' },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'var(--primary)' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: '#fff', borderRadius: '14px', padding: '1.2rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', gap: '1rem'
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: `${stat.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <stat.icon size={22} color={stat.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        borderRadius: '10px', border: '1px solid var(--border)',
                        fontSize: '0.9rem', outline: 'none'
                    }}
                />
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="loading-spinner" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching customer data...</p>
                </div>
            ) : error ? (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1.5rem', borderRadius: '12px' }}>
                    <strong>Error:</strong> {error}
                    <br />
                    <button onClick={fetchCustomers} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', background: '#991b1b', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Retry
                    </button>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Desktop Table */}
                    <div className="customers-desktop-table">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    {['Customer', 'Joined', 'Last Login', 'Orders', 'Total Spent', 'Status'].map(col => (
                                        <th key={col} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No customers found
                                        </td>
                                    </tr>
                                ) : filtered.map(customer => (
                                    <tr key={customer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '34px', height: '34px', borderRadius: '50%',
                                                    background: 'rgba(212,175,55,0.15)', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)'
                                                }}>
                                                    {(customer.name || customer.email)?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--secondary)' }}>{customer.name || 'Anonymous User'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customer.email || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={13} />
                                                {formatDate(customer.created_at)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {formatTime(customer.last_sign_in_at)}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                            {customer.orders}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: customer.total_spent > 0 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
                                            ₹{customer.total_spent.toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700',
                                                background: customer.orders > 0 ? '#dcfce7' : '#f3f4f6',
                                                color: customer.orders > 0 ? '#166534' : '#6b7280'
                                            }}>
                                                {customer.orders > 0 ? 'Active' : 'Registered'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="customers-mobile-cards">
                        {filtered.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No customers found</p>
                        ) : filtered.map(customer => (
                            <div key={customer.id} style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                        background: 'rgba(212,175,55,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '700', color: 'var(--primary)'
                                    }}>
                                        {customer.email?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {customer.email || '—'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Joined {formatDate(customer.created_at)}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0,
                                        background: customer.orders > 0 ? '#dcfce7' : '#f3f4f6',
                                        color: customer.orders > 0 ? '#166534' : '#6b7280'
                                    }}>
                                        {customer.orders > 0 ? 'Active' : 'Registered'}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--secondary)' }}>{customer.orders}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Orders</div>
                                    </div>
                                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>₹{customer.total_spent.toLocaleString('en-IN')}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Spent</div>
                                    </div>
                                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--secondary)', fontSize: '0.75rem' }}>{formatTime(customer.last_sign_in_at)}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Last Login</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
