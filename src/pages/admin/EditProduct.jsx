import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    UploadCloud,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        category: 'Silk',
        price: '',
        stock: 0,
        image_url: '',
        description: ''
    });

    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    setProduct({
                        ...data,
                        price: data.price.toString()
                    });
                }
            } catch (error) {
                console.error('Error fetching product:', error.message);
                alert('Error loading product details: ' + error.message);
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

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
            setSaving(true);

            let finalImageUrl = product.image_url;

            // If a new file was selected, upload it
            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            // Clean price and ensure stock is an integer
            const cleanProduct = {
                ...product,
                image_url: finalImageUrl,
                price: parseFloat(product.price.toString().replace(/,/g, '')),
                stock: parseInt(product.stock, 10) || 0
            };

            const { error } = await supabase
                .from('products')
                .update(cleanProduct)
                .eq('id', id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (error) {
            alert('Error updating product: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        'Silk',
        'Cotton',
        'Designer',
        'Wedding',
        'Chiffon',
        'Georgette',
        'Banarasi',
        'Kanjivaram',
        'Pattu',
        'Ready-to-Wear',
        'Party Wear',
        'Daily Wear',
        'Handloom',
        'Lehenga',
        'Kurtis & Suits'
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

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
                <h2 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Product Updated!</h2>
                <p style={{ color: 'var(--text-muted)' }}>The product changes have been successfully saved.</p>
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
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--secondary)' }}>Edit Product</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modifying: <strong>{product.name}</strong></p>
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
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Category</label>
                                <select
                                    name="category"
                                    value={product.category}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'white' }}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
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


                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                            <textarea
                                name="description"
                                value={product.description || ''}
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
                            onClick={() => document.getElementById('product-image-edit').click()}
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
                                id="product-image-edit"
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
                            disabled={saving}
                            className="btn"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
