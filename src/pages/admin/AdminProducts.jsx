import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ExternalLink,
    Filter,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                setProducts(products.filter(p => p.id !== id));
                alert('Product deleted successfully');
            } catch (error) {
                alert('Error deleting product: ' + error.message);
            }
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--secondary)', margin: 0 }}>Products</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Manage your saree inventory.</p>
                </div>
                <Link
                    to="/admin/products/add"
                    className="btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.2rem', fontSize: '0.9rem' }}
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-morphism" style={{
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 0.8rem 0.7rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', backgroundColor: 'white' }}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    <strong>{filteredProducts.length}</strong> products
                </div>
            </div>

            {/* ── DESKTOP TABLE (hidden on mobile via CSS) ── */}
            <div className="admin-products-desktop glass-morphism" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '600' }}>PRODUCT</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '600' }}>CATEGORY</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '600' }}>PRICE</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '600' }}>STOCK</th>
                                <th style={{ textAlign: 'right', padding: '1rem 1.25rem', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '600' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '0.9rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img
                                                    src={product.image_url || product.image || 'https://via.placeholder.com/150'}
                                                    alt={product.name}
                                                    style={{ width: '44px', height: '55px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--secondary)' }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {product.id.toString().slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.9rem 1.25rem' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', backgroundColor: 'rgba(212,175,55,0.12)', color: 'var(--secondary)', fontWeight: '500' }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--primary)' }}>₹{product.price}</td>
                                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: product.stock < 5 ? '#ef4444' : 'var(--secondary)' }}>{product.stock || 0}</td>
                                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <Link to={`/product/${product.id}`} target="_blank" title="View on Store" style={{ padding: '7px', color: 'var(--text-muted)' }}>
                                                    <ExternalLink size={17} />
                                                </Link>
                                                <Link to={`/admin/products/edit/${product.id}`} title="Edit" style={{ padding: '7px', color: '#3b82f6' }}>
                                                    <Edit size={17} />
                                                </Link>
                                                <button onClick={() => handleDelete(product.id, product.name)} title="Delete" style={{ padding: '7px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No products found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MOBILE CARDS (hidden on desktop via CSS) ── */}
            <div className="admin-products-mobile">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="glass-morphism" style={{
                            borderRadius: '14px',
                            padding: '1rem',
                            marginBottom: '0.85rem',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            {/* Product image */}
                            <img
                                src={product.image_url || product.image || 'https://via.placeholder.com/150'}
                                alt={product.name}
                                style={{ width: '60px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            />

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {product.name}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '0.72rem', backgroundColor: 'rgba(212,175,55,0.15)', color: 'var(--secondary)', fontWeight: '500' }}>
                                        {product.category}
                                    </span>
                                    <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '0.72rem', backgroundColor: product.stock < 5 ? '#fee2e2' : '#dcfce7', color: product.stock < 5 ? '#991b1b' : '#166534', fontWeight: '600' }}>
                                        Stock: {product.stock || 0}
                                    </span>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)', marginBottom: '10px' }}>₹{product.price}</div>

                                {/* Action Buttons — always visible */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link
                                        to={`/admin/products/edit/${product.id}`}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '7px 14px', borderRadius: '8px',
                                            backgroundColor: '#eff6ff', color: '#2563eb',
                                            fontSize: '0.82rem', fontWeight: '600',
                                            textDecoration: 'none', flex: 1, justifyContent: 'center'
                                        }}
                                    >
                                        <Edit size={15} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '7px 14px', borderRadius: '8px',
                                            backgroundColor: '#fef2f2', color: '#dc2626',
                                            fontSize: '0.82rem', fontWeight: '600',
                                            border: 'none', cursor: 'pointer', flex: 1, justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                    <Link
                                        to={`/product/${product.id}`}
                                        target="_blank"
                                        style={{
                                            display: 'flex', alignItems: 'center',
                                            padding: '7px 10px', borderRadius: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <ExternalLink size={15} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-morphism" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '14px', color: 'var(--text-muted)' }}>
                        No products found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page 1 of 1</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button disabled style={{ padding: '7px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', opacity: 0.5 }}><ChevronLeft size={17} /></button>
                    <button disabled style={{ padding: '7px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', opacity: 0.5 }}><ChevronRight size={17} /></button>
                </div>
            </div>

            <style>{`
                .table-row-hover:hover { background-color: rgba(212, 175, 55, 0.03) !important; }
                /* Desktop: show table, hide cards */
                .admin-products-desktop { display: block; }
                .admin-products-mobile  { display: none; }
                /* Mobile: hide table, show cards */
                @media (max-width: 768px) {
                    .admin-products-desktop { display: none !important; }
                    .admin-products-mobile  { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
