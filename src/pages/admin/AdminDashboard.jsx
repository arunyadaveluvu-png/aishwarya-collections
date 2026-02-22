import React, { useState, useEffect } from 'react';
import {
    Package,
    Layers,
    TrendingUp,
    Clock,
    PlusCircle,
    ShoppingBag
} from 'lucide-react';
import { supabase } from '../../supabase';
import { Link } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        pendingOrders: 0,
        totalSales: 0,
        recentProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: productCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                const { data: catData } = await supabase
                    .from('categories')
                    .select('id');

                const { count: pendingCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'Pending');

                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('total');

                const totalSales = ordersData?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;

                const { data: recentProducts } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                setStats({
                    totalProducts: productCount || 0,
                    totalCategories: catData?.length || 0,
                    pendingOrders: pendingCount || 0,
                    totalSales,
                    recentProducts: recentProducts || []
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleDownloadReport = async () => {
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, created_at, first_name, last_name, address, city, pincode, total, status, payment_method')
                .gte('created_at', `${startDate}T00:00:00`)
                .lte('created_at', `${endDate}T23:59:59`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!orders || orders.length === 0) {
                alert('No orders found for the selected date range.');
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(122, 0, 0);
            doc.text("AISHWARYA COLLECTIONS - SALES REPORT", 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 33);

            const tableColumn = ["Order ID", "Date", "Customer", "Address", "Payment", "Total"];
            const tableRows = orders.map(o => [
                o.id.substring(0, 8),
                new Date(o.created_at).toLocaleDateString(),
                `${o.first_name} ${o.last_name}`,
                `${o.address}, ${o.city}`,
                o.payment_method,
                `Rs. ${o.total}`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [122, 0, 0], textColor: [255, 255, 255] },
                styles: { fontSize: 8 },
                columnStyles: { 0: { cellWidth: 20 }, 3: { cellWidth: 50 } }
            });

            doc.save(`Aishwarya_Collections_Report_${startDate}_to_${endDate}.pdf`);
            alert('PDF Report downloaded successfully!');
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to generate PDF report: ' + error.message);
        }
    };

    const handleClearCache = async () => {
        if (window.confirm("This will clear your local application state and refresh the dashboard. Continue?")) {
            setLoading(true);
            try {
                localStorage.clear();
                sessionStorage.clear();
                await supabase.auth.signOut();
            } catch (err) {
                console.warn('[AdminDashboard] Cache clear partial error:', err.message);
            } finally {
                window.location.href = '/';
            }
        }
    };

    const statCards = [
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: '#3b82f6' },
        { label: 'Categories', value: stats.totalCategories, icon: Layers, color: '#10b981' },
        { label: 'Pending Orders', value: stats.pendingOrders || 0, icon: Clock, color: '#f59e0b' },
        { label: 'Total Sales', value: `₹${(stats.totalSales || 0).toLocaleString()}`, icon: TrendingUp, color: '#8b5cf6' },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-root">

            {/* ── HEADER ── */}
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--secondary)', margin: 0 }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                        Welcome back to your Aishwarya Collections admin suite.
                    </p>
                </div>

                {/* Date + Report row */}
                <div className="dashboard-actions">
                    <div className="dashboard-date-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>From:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.78rem', flex: 1 }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>To:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.78rem', flex: 1 }}
                            />
                        </div>
                    </div>
                    <Link to="/admin/products/add" className="btn dashboard-add-btn">
                        <PlusCircle size={16} />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="dashboard-stats-grid">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="glass-morphism dashboard-stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '12px',
                                    backgroundColor: `${card.color}20`,
                                    color: card.color,
                                    marginRight: '12px',
                                    flexShrink: 0
                                }}>
                                    <Icon size={22} />
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>{card.label}</span>
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--secondary)' }}>{card.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* ── RECENT SECTION ── */}
            <div className="dashboard-recent-grid">
                {/* Recent Products Table */}
                <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: '20px', overflow: 'hidden' }}>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}>
                        <ShoppingBag size={18} color="var(--primary)" />
                        Recent Products
                    </h3>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>PRODUCT</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>CAT</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>PRICE</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentProducts.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '0.75rem 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img
                                                    src={product.image_url || product.image || 'https://via.placeholder.com/150'}
                                                    alt={product.name}
                                                    style={{ width: '36px', height: '44px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                                />
                                                <span style={{ fontWeight: '500', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0', fontSize: '0.82rem' }}>{product.category}</td>
                                        <td style={{ padding: '0.75rem 0', fontSize: '0.82rem', fontWeight: '600' }}>₹{product.price}</td>
                                        <td style={{ padding: '0.75rem 0' }}>
                                            <span style={{
                                                padding: '3px 9px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                backgroundColor: '#dcfce7',
                                                color: '#166534'
                                            }}>Live</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Link to="/admin/products" style={{
                        display: 'block', textAlign: 'center', marginTop: '1.25rem',
                        color: 'var(--primary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '500'
                    }}>
                        View All Products →
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link to="/admin/products" className="btn-outline" style={{ textAlign: 'center' }}>Manage Inventory</Link>
                        <button onClick={handleDownloadReport} className="btn-outline">Download Report</button>
                        <button onClick={handleClearCache} className="btn-outline">Clear Cache</button>
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.25rem',
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            borderRadius: '12px',
                            border: '1px dashed var(--border)'
                        }}>
                            <h4 style={{ fontSize: '0.88rem', marginBottom: '6px' }}>Store Status</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your store is live and accepting traffic.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
