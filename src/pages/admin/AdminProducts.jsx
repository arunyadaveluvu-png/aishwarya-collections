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
    ChevronRight,
    MoreVertical
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
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

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
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)' }}>Products</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your saree inventory and collections.</p>
                </div>
                <Link to="/admin/products/add" className="btn" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.8rem 1.5rem'
                }}>
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Filters & Search */}
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
                    <Search
                        size={18}
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or material..."
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
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            fontSize: '0.9rem',
                            backgroundColor: 'white'
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Showing <strong>{filteredProducts.length}</strong> products
                </div>
            </div>

            {/* Product Table */}
            <div className="glass-morphism" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '600' }}>PRODUCT</th>
                            <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '600' }}>CATEGORY</th>
                            <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '600' }}>PRICE</th>
                            <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '600' }}>STOCK</th>
                            <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '600' }}>MATERIAL</th>
                            <th style={{ textAlign: 'right', padding: '1.2rem 1.5rem', color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '600' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    src={product.image_url || product.image || 'https://via.placeholder.com/150'}
                                                    alt={product.name}
                                                    style={{ width: '48px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)' }}
                                                    onError={(e) => {
                                                        console.warn(`[Aishwarya Collections] Image failed to load in Admin view for product ${product.id}:`, product.image_url || product.image);
                                                        e.target.src = 'https://via.placeholder.com/150';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--secondary)' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {product.id.toString().slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--accent-light)',
                                            color: 'var(--secondary)',
                                            fontWeight: '500'
                                        }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: 'var(--primary)' }}>₹{product.price}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            fontWeight: '700',
                                            color: product.stock < 5 ? '#ef4444' : 'var(--secondary)'
                                        }}>
                                            {product.stock || 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{product.material || 'N/A'}</td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <Link
                                                to={`/product/${product.id}`}
                                                target="_blank"
                                                title="View on Store"
                                                style={{ padding: '8px', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                                            >
                                                <ExternalLink size={18} />
                                            </Link>
                                            <Link
                                                to={`/admin/products/edit/${product.id}`}
                                                title="Edit Product"
                                                style={{ padding: '8px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id, product.name)}
                                                title="Delete Product"
                                                style={{ padding: '8px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No products found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Mock */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
                padding: '0 1rem'
            }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Page 1 of 1
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button disabled style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'not-allowed', opacity: 0.5 }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button disabled style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'not-allowed', opacity: 0.5 }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                .table-row-hover:hover {
                    background-color: rgba(212, 175, 55, 0.03) !important;
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
