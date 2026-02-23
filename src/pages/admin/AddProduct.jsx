import React, { useState } from 'react';
import { supabase } from '../../supabase';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    UploadCloud,
    CheckCircle2,
    Camera,
    FolderOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        discount_price: '',
        stock: 10,
        image_url: '',
        description: '',
        sizes: {} // Changed to object for { "S": 10, "M": 5 }
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

            // Clean data
            const cleanProduct = {
                ...product,
                image_url: finalImageUrl,
                price: parseFloat(product.price.toString().replace(/,/g, '')),
                discount_price: product.discount_price ? parseFloat(product.discount_price.toString().replace(/,/g, '')) : null,
                stock: parseInt(product.stock, 10) || 0,
                sizes: product.sizes // This is now an object
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
                <p style={{ color: 'var(--text-muted)' }}>The product has been successfully added to the collection.</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                    placeholder="e.g. Royal Silk Dress"
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
                                                setProduct(prev => ({ ...prev, category: val, sizes: {} }));
                                            } else {
                                                setProduct(prev => ({ ...prev, category: '', sizes: {} }));
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
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setProduct(prev => ({ ...prev, category: val, sizes: {} }));
                                            }}
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
                        </div>
                    </div>

                    {/* Sizes Section */}
                    {(parentCategory === 'Men' || product.category === 'Dresses') && (
                        <div className="glass-morphism" style={{ padding: '2rem', borderRadius: '20px', backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)' }}>Available Sizes & Quantities</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                                    const isSelected = product.sizes.hasOwnProperty(size);
                                    return (
                                        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    setProduct(prev => {
                                                        const newSizes = { ...prev.sizes };
                                                        if (isSelected) {
                                                            delete newSizes[size];
                                                        } else {
                                                            newSizes[size] = 10; // Default quantity
                                                        }

                                                        // Auto-calculate total stock
                                                        const totalStock = Object.values(newSizes).reduce((a, b) => a + (parseInt(b) || 0), 0);

                                                        return { ...prev, sizes: newSizes, stock: totalStock || prev.stock };
                                                    });
                                                }}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                                    backgroundColor: isSelected ? 'var(--primary)' : 'white',
                                                    color: isSelected ? 'white' : 'var(--secondary)',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    minWidth: '70px'
                                                }}
                                            >
                                                {size}
                                            </button>

                                            {isSelected && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity:</span>
                                                    <input
                                                        type="number"
                                                        value={product.sizes[size]}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            setProduct(prev => {
                                                                const newSizes = { ...prev.sizes, [size]: val };
                                                                const totalStock = Object.values(newSizes).reduce((a, b) => a + (parseInt(b) || 0), 0);
                                                                return { ...prev, sizes: newSizes, stock: totalStock };
                                                            });
                                                        }}
                                                        style={{
                                                            width: '80px',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--border)',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="glass-morphism" style={{ padding: '2rem', borderRadius: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
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
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Discount Price (₹)</label>
                                <input
                                    type="number"
                                    name="discount_price"
                                    value={product.discount_price}
                                    onChange={handleChange}
                                    placeholder="1999"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                            <textarea
                                name="description"
                                value={product.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Details about material, design, and care..."
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
                                backgroundColor: 'white'
                            }}
                        >
                            {product.image_url ? (
                                <>
                                    <img
                                        src={product.image_url}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProduct(prev => ({ ...prev, image_url: '' }));
                                            setImageFile(null);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            padding: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                                    <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>No image selected</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1.5rem' }}>
                            <input
                                id="camera-upload"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('camera-upload').click()}
                                className="btn-outline"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 5px',
                                    fontSize: '0.75rem',
                                    borderColor: 'var(--primary-light)',
                                    color: 'var(--primary)'
                                }}
                            >
                                <Camera size={20} />
                                Take Photo
                            </button>

                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('file-upload').click()}
                                className="btn-outline"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 5px',
                                    fontSize: '0.75rem',
                                    borderColor: 'var(--primary-light)',
                                    color: 'var(--primary)'
                                }}
                            >
                                <FolderOpen size={20} />
                                Choose File
                            </button>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or Image URL</label>
                            <input
                                type="text"
                                name="image_url"
                                value={imageFile ? '' : (product.image_url || '')}
                                onChange={handleChange}
                                placeholder="Paste link..."
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                            />
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
                                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
