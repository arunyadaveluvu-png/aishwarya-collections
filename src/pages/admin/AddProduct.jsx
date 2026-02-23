import React, { useState } from 'react';
import { supabase } from '../../supabase';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    UploadCloud,
    CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        category: '', // Starts empty
        price: '',
        discount_price: '',
        stock: 10,
        image_url: '',
        description: ''
    });
    const [parentCategory, setParentCategory] = useState(''); // 'Men' or 'Women'

    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            // Create a preview URL
            const previewUrl = URL.createObjectURL(file);
            setProduct(prev => ({ ...prev, image_url: previewUrl }));
        }
    };

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            let finalImageUrl = product.image_url;

            // If a file was selected, upload it first
            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            // Clean price (remove commas if any)
            const cleanProduct = {
                ...product,
                image_url: finalImageUrl,
                price: parseFloat(product.price.toString().replace(/,/g, '')),
                discount_price: product.discount_price ? parseFloat(product.discount_price.toString().replace(/,/g, '')) : null,
                stock: parseInt(product.stock, 10) || 0
            };

            const { error } = await supabase
                .from('products')
                .insert([cleanProduct]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (error) {
            alert('Error adding product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        'Sarees',
        'Dresses',
        'Men',
        'Women'
    ];

    if (success) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                textAlign: 'center'
            }}>
                <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                    <CheckCircle2 size={80} />
                </div>
                <h2 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Product Added!</h2>
                <p style={{ color: 'var(--text-muted)' }}>The new saree has been successfully added to the collection.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--text-muted)' }}>Redirecting to inventory...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/admin/products" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    <ArrowLeft size={16} />
                    Back to Products
                </Link>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)' }}>Add New Product</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column: Details */}
                <div className="glass-morphism" style={{ padding: '2rem', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Royal Banarasi Silk Saree"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Parent Category</label>
                                <select
                                    value={parentCategory}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setParentCategory(val);
                                        if (val === 'Men' || val === 'Cosmetics') {
                                            setProduct(prev => ({ ...prev, category: val }));
                                        } else {
                                            setProduct(prev => ({ ...prev, category: '' }));
                                        }
                                    }}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'white' }}
                                >
                                    <option value="">Select Parent</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Cosmetics">Cosmetics</option>
                                </select>
                            </div>
                            {parentCategory === 'Women' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Sub-Category</label>
                                    <select
                                        name="category"
                                        value={product.category}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'white' }}
                                    >
                                        <option value="">Select Sub</option>
                                        <option value="Sarees">Sarees</option>
                                        <option value="Dresses">Dresses</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={product.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="2499"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Discount Price (₹) <span style={{ fontWeight: '400', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span></label>
                                <input
                                    type="number"
                                    name="discount_price"
                                    value={product.discount_price}
                                    onChange={handleChange}
                                    placeholder="1999"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={product.stock}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 10"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                            <textarea
                                name="description"
                                value={product.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Describe the saree's weave, work, and elegance..."
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', resize: 'vertical' }}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-morphism" style={{ padding: '2rem', borderRadius: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>Product Image</label>

                        <div
                            onClick={() => document.getElementById('product-image-upload').click()}
                            style={{
                                width: '100%',
                                aspectRatio: '3/4',
                                borderRadius: '12px',
                                border: '2px dashed var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                id="product-image-upload"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {product.image_url ? (
                                <>
                                    <img
                                        src={product.image_url}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProduct(prev => ({ ...prev, image_url: '' }));
                                            setImageFile(null);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            padding: '5px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <ImageIcon size={48} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.8rem' }}>Click to take photo or upload</p>
                                    <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>{imageFile ? imageFile.name : ''}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or Paste Image URL</label>
                            <div style={{ position: 'relative' }}>
                                <UploadCloud size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="image_url"
                                    value={imageFile ? '' : (product.image_url || '')}
                                    onChange={handleChange}
                                    placeholder="Paste image link here..."
                                    style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="btn-outline"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loading ? (
                                <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWeight: '2px' }}></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
};

export default AddProduct;
