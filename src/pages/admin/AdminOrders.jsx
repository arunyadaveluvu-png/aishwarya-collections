import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    Truck,
    Search,
    Filter,
    User,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [pendingStatus, setPendingStatus] = useState({}); // { orderId: newStatus }
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('orders_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('[Aishwarya Collections] Real-time change detected:', payload);
                fetchOrders(); // Refresh all to ensure join data is correct
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Diagnostic: Log current user email
            const { data: { user } } = await supabase.auth.getUser();
            console.log('[Aishwarya Collections] Current User Email:', user?.email);

            // Fetch orders with items
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*))')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[Aishwarya Collections] Detailed Fetch Error:', error);
                // Try a simpler fetch to see if it's the join failing
                console.log('[Aishwarya Collections] Attempting simplified fetch...');
                const { data: simpleData, error: simpleError } = await supabase
                    .from('orders')
                    .select('*')
                    .limit(5);
                console.log('[Aishwarya Collections] Simplified Fetch Result:', { count: simpleData?.length, error: simpleError });
                throw error;
            }

            console.log('[Aishwarya Collections] Successfully fetched orders:', data?.length || 0);
            if (data && data.length > 0) {
                console.log('[Aishwarya Collections] Data structure check:', {
                    hasItems: !!data[0].order_items,
                    itemsCount: data[0].order_items?.length,
                    hasProduct: !!data[0].order_items?.[0]?.products
                });
            }

            setOrders(data || []);
        } catch (error) {
            console.error('[AdminOrders] Error in fetchOrders:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId) => {
        const newStatus = pendingStatus[orderId];
        if (!newStatus) return;

        try {
            setUpdatingId(orderId);
            console.log('[AdminOrders] Attempting to update order:', orderId, 'to status:', newStatus);

            const { data, error, status: httpStatus } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('[AdminOrders] Supabase Update Error:', error);
                throw error;
            }

            console.log('[AdminOrders] Supabase Response Status:', httpStatus);
            console.log('[AdminOrders] Updated Data result:', data);

            if (!data || data.length === 0) {
                console.warn('[AdminOrders] NO ROWS UPDATED! This is likely an RLS issue or invalid ID.');
                throw new Error('Update failed. You might not have permission to modify this order.');
            }

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            // Clear pending status for this order
            const newPending = { ...pendingStatus };
            delete newPending[orderId];
            setPendingStatus(newPending);

            alert(`Order status successfully updated to ${newStatus}`);
        } catch (error) {
            console.error('[AdminOrders] Update Exception:', error);
            alert('Error updating status: ' + error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = (orderId, status) => {
        setPendingStatus(prev => ({
            ...prev,
            [orderId]: status
        }));
    };

    const filteredOrders = orders.filter(order => {
        const fullCustomerName = `${order.first_name} ${order.last_name}`.toLowerCase();
        const matchesSearch = fullCustomerName.includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#fef3c7', text: '#92400e' };
            case 'preparing': return { bg: '#e0e7ff', text: '#3730a3' };
            case 'shipped': return { bg: '#e0f2fe', text: '#075985' };
            case 'delivered': return { bg: '#dcfce7', text: '#166534' };
            case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)' }}>Order Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track and update customer order statuses.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                    {loading ? 'Refreshing...' : 'Refresh Orders'}
                </button>
            </div>

            {/* Filters */}
            <div className="glass-morphism" style={{
                padding: '1.5rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 2, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by Customer Name or Order ID (#)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 2.5rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            fontSize: '0.9rem',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const style = getStatusColor(order.status);
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div key={order.id} className="glass-morphism" style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid var(--border)'
                            }}>
                                <div
                                    onClick={() => toggleExpand(order.id)}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--secondary)' }}>
                                                #{order.id.slice(0, 8)}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{order.first_name} {order.last_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.city}</div>
                                        </div>

                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{order.total}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.order_items?.length || 0} Items</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            backgroundColor: style.bg,
                                            color: style.text,
                                            textTransform: 'capitalize'
                                        }}>
                                            {order.status || 'Pending'}
                                        </span>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem 0' }}>
                                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-alt)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                                    <Truck size={18} /> DISPATCH SLIP
                                                </h4>
                                                <div style={{ display: 'grid', gap: '0.8rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Name</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--secondary)' }}>{order.first_name} {order.last_name}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Address</div>
                                                        <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', lineHeight: '1.5', fontWeight: '500' }}>
                                                            {order.address}<br />
                                                            {order.city} - {order.pincode}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Method</div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{order.payment_method?.toUpperCase()}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Total</div>
                                                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)' }}>₹{order.total}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Manage Status</h4>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    <select
                                                        value={pendingStatus[order.id] || order.status || 'Pending'}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        disabled={updatingId === order.id}
                                                        style={{
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border)',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: 'white',
                                                            cursor: 'pointer',
                                                            outline: 'none'
                                                        }}
                                                    >
                                                        {['Pending', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'].map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>

                                                    {pendingStatus[order.id] && pendingStatus[order.id] !== order.status && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateOrderStatus(order.id);
                                                            }}
                                                            disabled={updatingId === order.id}
                                                            className="btn"
                                                            style={{
                                                                padding: '8px 16px',
                                                                fontSize: '0.8rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px'
                                                            }}
                                                        >
                                                            {updatingId === order.id ? (
                                                                <div className="loading-spinner" style={{ width: '12px', height: '12px' }}></div>
                                                            ) : 'Confirm'}
                                                        </button>
                                                    )}

                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                        <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                                        Update Status
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ITEM DETAILS</th>
                                                        <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>CATEGORY</th>
                                                        <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>SIZE</th>
                                                        <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>QTY</th>
                                                        <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PRICE</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.order_items?.map((item) => (
                                                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                                            <td style={{ padding: '0.8rem 0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <img
                                                                    src={item.products?.image_url}
                                                                    alt=""
                                                                    style={{ width: '40px', height: '55px', borderRadius: '4px', objectFit: 'cover' }}
                                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                                                />
                                                                <div>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--secondary)' }}>
                                                                        {item.product_name || item.products?.name}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                        ID: {item.product_id ? item.product_id.slice(0, 8) : 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'left', padding: '0.8rem 0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                                                {item.category || item.products?.category || 'Saree'}
                                                            </td>
                                                            <td style={{ textAlign: 'center', padding: '0.8rem 0.5rem' }}>
                                                                <span style={{
                                                                    padding: item.selected_size ? '4px 8px' : '0',
                                                                    backgroundColor: item.selected_size ? 'var(--bg-alt)' : 'transparent',
                                                                    color: 'var(--primary)',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '700'
                                                                }}>
                                                                    {item.selected_size || '-'}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'center', padding: '0.8rem 0.5rem', fontSize: '0.9rem' }}>{item.quantity}</td>
                                                            <td style={{ textAlign: 'right', padding: '0.8rem 0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>₹{item.price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No orders found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
