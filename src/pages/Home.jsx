import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { supabase } from "../supabase";

const Home = ({ addToCart }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryFilter = searchParams.get('category');
    const searchFilter = searchParams.get('search');

    const fetchCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const { data, error: sbError } = await supabase
                .from("categories")
                .select("*")
                .order('name');

            if (sbError) {
                // Ignore lock-related errors for read-only public data
                if (sbError.message?.includes('LockManager') || sbError.message?.includes('this.lock')) {
                    console.warn("[Home] Read ignored lock error for categories");
                    return;
                }
                throw sbError;
            }
            setCategories(data || []);
        } catch (err) {
            console.error("[Home] Category Fetch Error:", err);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setProductsLoading(true);
        setError(null);

        try {
            let query = supabase.from("products").select("*");
            if (categoryFilter && categoryFilter !== 'All') query = query.eq('category', categoryFilter);
            if (searchFilter) query = query.ilike('name', `%${searchFilter}%`);

            const { data, error: sbError } = await query;

            if (sbError) {
                // Ignore lock-related errors for read-only public data
                if (sbError.message?.includes('LockManager') || sbError.message?.includes('this.lock')) {
                    console.warn("[Home] Read ignored lock error for products");
                    return;
                }
                throw sbError;
            }

            setProducts(data || []);
        } catch (err) {
            console.error("[Home] General Fetch Error:", err);
            setError(`Failed to load products: ${err.message || 'Unknown error'}`);
        } finally {
            setProductsLoading(false);
        }
    }, [categoryFilter, searchFilter]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <>
            <Hero />

            <section id="products-section" className="container" style={{ padding: '5rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem' }}>
                        Exquisite Pieces
                    </span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>
                        {categoryFilter
                            ? (['Lehenga', 'Kurtis & Suits'].includes(categoryFilter)
                                ? categoryFilter
                                : `${categoryFilter} Sarees`)
                            : "Featured Sarees"}
                    </h2>
                    <div style={{ width: '60px', height: '2px', background: 'var(--primary)', margin: '1.5rem auto' }}></div>
                    {categoryFilter && (
                        <button
                            onClick={() => setSearchParams({})}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                            }}
                        >
                            Show All Products
                        </button>
                    )}
                </div>

                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                    {productsLoading ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: '1rem' }}>Loading products...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem', color: 'red' }}>
                            <p>Error: {error}</p>
                            <button onClick={fetchProducts}>Try Again</button>
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>
                            <p>No products found in this category.</p>
                            <button onClick={() => setSearchParams({})} className="btn-primary" style={{ marginTop: '1rem' }}>Browse All</button>
                        </div>
                    ) : (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={addToCart}
                            />
                        ))
                    )}
                </div>
            </section>

            <section style={{ backgroundColor: 'var(--bg-alt)', padding: '5rem 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Explore Categories</h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Find the perfect weave for every occasion
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
                        {categoriesLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#eee', margin: '0 auto 1rem' }}></div>
                                    <div style={{ width: '80px', height: '10px', backgroundColor: '#eee', margin: '0 auto' }}></div>
                                </div>
                            ))
                        ) : (
                            categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => {
                                        setSearchParams({ category: cat.name });
                                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    style={{
                                        textAlign: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        position: 'relative',
                                        width: '180px',
                                        height: '180px',
                                        margin: '0 auto 1rem',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: categoryFilter === cat.name ? '4px solid var(--primary)' : '4px solid white',
                                        boxShadow: 'var(--shadow)',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <img
                                            src={cat.image_url}
                                            alt={cat.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>{cat.name}</h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;