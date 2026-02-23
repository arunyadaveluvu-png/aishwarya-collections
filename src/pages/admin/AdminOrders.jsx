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
    ChevronUp,
    Printer
} from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [pendingStatus, setPendingStatus] = useState({}); // { orderId: newStatus }
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);

    useEffect(() => {
        fetchOrders();

        const subscription = supabase
            .channel('orders_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*))')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('[AdminOrders] Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const printableIds = filteredOrders
                .filter(o => o.status !== 'Delivered')
                .map(o => o.id);
            setSelectedOrders(printableIds);
        } else {
            setSelectedOrders([]);
        }
    };

    const handlePrintSlips = (singleOrder = null) => {
        const orderIdsToPrint = singleOrder ? [singleOrder.id] : selectedOrders;
        if (orderIdsToPrint.length === 0) return;

        // Custom print triggering
        const printStyles = document.createElement('style');
        printStyles.id = 'print-dispatch-styles';
        printStyles.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                .dispatch-slip-printable, .dispatch-slip-printable * { visibility: visible; }
                .dispatch-slip-printable { 
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    display: block !important;
                }
                .no-print { display: none !important; }
            }
        `;
        document.head.appendChild(printStyles);

        window.print();

        setTimeout(() => {
            const styleElement = document.getElementById('print-dispatch-styles');
            if (styleElement) styleElement.remove();
        }, 500);
    };

    const updateOrderStatus = async (orderId) => {
        const newStatus = pendingStatus[orderId];
        if (!newStatus) return;

        try {
            setUpdatingId(orderId);
            const { data, error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
                .select();

            if (error) throw error;

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            const newPending = { ...pendingStatus };
            delete newPending[orderId];
            setPendingStatus(newPending);

            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            alert('Error updating status: ' + error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = (orderId, status) => {
        setPendingStatus(prev => ({ ...prev, [orderId]: status }));
    };

    const filteredOrders = orders.filter(order => {
        const fullCustomerName = `${order.first_name} ${order.last_name}`.toLowerCase();
        const matchesSearch = fullCustomerName.includes(searchTerm.toLowerCase()) || order.id.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="admin-orders-page">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)' }}>Order Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track and update customer order statuses.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedOrders.length > 0 && (
                        <button
                            onClick={() => handlePrintSlips()}
                            className="btn-primary"
                            style={{
                                padding: '0.5rem 1.2rem',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#2d3748'
                            }}
                        >
                            <Printer size={16} /> Print {selectedOrders.length} Slips
                        </button>
                    )}
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="btn-outline"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Orders'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-morphism no-print" style={{
                padding: '1.5rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
                    <input
                        type="checkbox"
                        id="select-all"
                        onChange={handleSelectAll}
                        checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.filter(o => o.status !== 'Delivered').length}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="select-all" style={{ fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Select All</label>
                </div>

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
                        const isPrintable = order.status !== 'Delivered';
                        const isSelected = selectedOrders.includes(order.id);

                        return (
                            <React.Fragment key={order.id}>
                                {/* Printable Slip (Hidden on screen) */}
                                {(isSelected || (expandedOrder === order.id && isPrintable)) && (
                                    <div className="dispatch-slip-printable" style={{ display: 'none' }}>
                                        <div style={{ padding: '40px', border: '1px solid #000', margin: '20px', backgroundColor: 'white' }}>
                                            <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '15px', marginBottom: '20px' }}>
                                                <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px' }}>AISHWARYA COLLECTIONS</h1>
                                                <p style={{ margin: '5px 0', fontSize: '12px' }}>DISPATCH SLIP</p>
                                            </div>
                                            <div style={{ marginBottom: '25px' }}>
                                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #ddd' }}>Ship To:</h3>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{order.first_name} {order.last_name}</div>
                                                <div style={{ fontSize: '16px', lineHeight: '1.4', marginTop: '5px' }}>
                                                    {order.address}<br />
                                                    {order.city} - {order.pincode}
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px' }}>
                                                <div>
                                                    <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>Order ID</div>
                                                    <div style={{ fontWeight: 'bold' }}>#{order.id.slice(0, 12).toUpperCase()}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>Date</div>
                                                    <div style={{ fontWeight: 'bold' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>Payment Mode</div>
                                                    <div style={{ fontWeight: 'bold' }}>{order.payment_method?.toUpperCase()}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>Total Amount</div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{order.total}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '15px', textAlign: 'center', fontSize: '10px' }}>
                                                Professional Dispatch System - Aishwarya Collections
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* On-Screen List Item */}
                                <div className="glass-morphism no-print" style={{
                                    borderRadius: '16px',
                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            disabled={!isPrintable}
                                            checked={isSelected}
                                            onChange={() => handleSelectOrder(order.id)}
                                            style={{ width: '20px', height: '20px', cursor: isPrintable ? 'pointer' : 'not-allowed' }}
                                        />
                                        <div onClick={() => toggleExpand(order.id)} style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--secondary)' }}>#{order.id.slice(0, 8)}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{order.first_name} {order.last_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.city}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{order.total}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.order_items?.length || 0} Items</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: style.bg, color: style.text }}>
                                                    {order.status || 'Pending'}
                                                </span>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                                <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed var(--primary)', position: 'relative' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', margin: 0 }}><Truck size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> DISPATCH SLIP</h4>
                                                        {isPrintable && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handlePrintSlips(order); }}
                                                                className="btn-outline"
                                                                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                            >
                                                                <Printer size={14} /> Print Slip
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        <div style={{ marginBottom: '10px' }}>
                                                            <strong>{order.first_name} {order.last_name}</strong><br />
                                                            {order.address}<br />
                                                            {order.city} - {order.pincode}
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                                            <span>Payment: <strong>{order.payment_method?.toUpperCase()}</strong></span>
                                                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{order.total}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Manage Status</h4>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <select
                                                            value={pendingStatus[order.id] || order.status || 'Pending'}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                                                        >
                                                            {['Pending', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'].map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                        {pendingStatus[order.id] && pendingStatus[order.id] !== order.status && (
                                                            <button onClick={() => updateOrderStatus(order.id)} className="btn-primary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Confirm</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '1.5rem', backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                                            <th style={{ textAlign: 'left', padding: '10px' }}>ITEM</th>
                                                            <th style={{ textAlign: 'center' }}>SIZE</th>
                                                            <th style={{ textAlign: 'center' }}>QTY</th>
                                                            <th style={{ textAlign: 'right', padding: '10px' }}>PRICE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.order_items?.map((item) => (
                                                            <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                                <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <img src={item.products?.image_url} alt="" style={{ width: '30px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
                                                                    <span>{item.product_name || item.products?.name}</span>
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>{item.selected_size || '-'}</td>
                                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                                <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>₹{item.price}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <ShoppingBag size={48} style={{ opacity: 0.2 }} />
                        <p>No orders found.</p>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    .admin-orders-page > *:not(.dispatch-slip-printable) {
                        display: none !important;
                    }
                    .dispatch-slip-printable {
                        display: block !important;
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminOrders;
