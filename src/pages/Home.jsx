import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { supabase } from "../supabase";

const Home = ({ addToCart }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryFilter = searchParams.get('category');
    const searchFilter = searchParams.get('search');

    // Navigation state logic
    // Level 1: Home (no filter, show Men/Women)
    // Level 2: Sub-categories (Women filter, show Sarees/Dresses) OR Product List (Men/Sarees/Dresses filter)

    const currentView = searchFilter ? 'search'
        : (categoryFilter === 'Women' ? 'women_sub'
            : (categoryFilter ? 'products' : 'top_level'));

    const fetchCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const { data, error: sbError } = await supabase
                .from("categories")
                .select("*")
                .order('name');

            if (sbError) throw sbError;
            setCategories(data || []);
        } catch (err) {
            console.error("[Home] Category Fetch Error:", err);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        if (currentView === 'top_level' || currentView === 'women_sub') {
            setProducts([]);
            return;
        }

        setProductsLoading(true);
        setError(null);

        try {
            let query = supabase.from("products").select("*");

            if (categoryFilter && categoryFilter !== 'All') {
                if (categoryFilter === 'Women') {
                    // Women shows everything from the sub-categories
                    query = query.in('category', ['Silk', 'Cotton', 'Designer', 'Wedding', 'Kurtis & Suits', 'Lehenga', 'Sarees', 'Dresses']);
                } else if (categoryFilter === 'Sarees') {
                    query = query.in('category', ['Silk', 'Cotton', 'Designer', 'Wedding', 'Sarees']);
                } else if (categoryFilter === 'Dresses') {
                    query = query.in('category', ['Kurtis & Suits', 'Lehenga', 'Dresses']);
                } else {
                    query = query.eq('category', categoryFilter);
                }
            }

            if (searchFilter) query = query.ilike('name', `%${searchFilter}%`);

            const { data, error: sbError } = await query;

            if (sbError) throw sbError;
            setProducts(data || []);
        } catch (err) {
            console.error("[Home] General Fetch Error:", err);
            setError(`Failed to load products: ${err.message || 'Unknown error'}`);
        } finally {
            setProductsLoading(false);
        }
    }, [categoryFilter, searchFilter, currentView]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleBack = () => {
        if (currentView === 'women_sub') {
            setSearchParams({});
        } else if (currentView === 'products' && categoryFilter !== 'Men') {
            setSearchParams({ category: 'Women' });
        } else {
            setSearchParams({});
        }
    };

    const renderCategories = (catList) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            {catList.map((cat) => (
                <div
                    key={cat.id}
                    onClick={() => {
                        setSearchParams({ category: cat.name });
                        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                    <div className="category-circle-wrapper" style={{
                        position: 'relative',
                        width: '240px',
                        height: '240px',
                        margin: '0 auto 1.5rem',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid white',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <img
                            src={cat.image_url}
                            alt={cat.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5))',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '2rem'
                        }}>
                            <h3 style={{ fontSize: '1.8rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0 }}>{cat.name}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const staticCategories = [
        { id: 'men', name: 'Men', image_url: 'https://cityvibes.in/cdn/shop/files/CITYVIBESF14442.jpg?v=1762339076&width=2638' },
        { id: 'women', name: 'Women', image_url: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tZW4lMjBjbG90aGluZ3xlbnwwfHwwfHx8MA%3D%3D' },
        { id: 'sarees', name: 'Sarees', image_url: 'https://mykaladhar.com/cdn/shop/articles/Kaladhar___October_Blog_Image.jpg?v=1698919472' },
        { id: 'dresses', name: 'Dresses', image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGmODoC975mc0ZmYnfbqj1r82ZSNECmKKz5w&s' }
    ];

    const filteredCats = currentView === 'top_level'
        ? staticCategories.filter(c => ['Men', 'Women'].includes(c.name))
        : currentView === 'women_sub'
            ? staticCategories.filter(c => ['Sarees', 'Dresses'].includes(c.name))
            : [];

    return (
        <>
            <Hero />

            <section id="explore-section" style={{ minHeight: '60vh', padding: '5rem 0', backgroundColor: 'var(--bg-alt)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            {currentView === 'top_level' ? "Select Your Preference"
                                : currentView === 'women_sub' ? "Women's Collection"
                                    : (categoryFilter || "Featured Collection")}
                        </h2>
                        <div style={{ width: '60px', height: '2px', background: 'var(--primary)', margin: '1.5rem auto' }}></div>
                    </div>

                    {(currentView === 'top_level' || currentView === 'women_sub') ? (
                        categoriesLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : renderCategories(filteredCats)
                    ) : (
                        /* Product Grid View */
                        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                            {productsLoading ? (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>
                                    <div className="loading-spinner"></div>
                                    <p style={{ marginTop: '1rem' }}>Bringing you the finest pieces...</p>
                                </div>
                            ) : error ? (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>
                                    <p style={{ color: 'red' }}>{error}</p>
                                    <button onClick={fetchProducts} className="btn-primary" style={{ marginTop: '1rem' }}>Try Again</button>
                                </div>
                            ) : products.length === 0 ? (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '3rem' }}>
                                    <p>No products found in this category yet.</p>
                                    <button onClick={handleBack} className="btn-outline" style={{ marginTop: '1rem' }}>Go Back</button>
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
                    )}

                    {currentView !== 'top_level' && (
                        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                            <button
                                onClick={handleBack}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '12px',
                                    background: 'none', border: '2px solid var(--primary)',
                                    color: 'var(--primary)', padding: '12px 32px', borderRadius: '40px',
                                    cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.1)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.1)';
                                }}
                            >
                                ← Back to Categories
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Home;