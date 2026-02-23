import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    UploadCloud,
    CheckCircle2,
    Loader2,
    Camera,
    FolderOpen
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
        category: '',
        price: '',
        discount_price: '',
        stock: 0,
        image_url: '',
        description: '',
        sizes: []
    });
    const [parentCategory, setParentCategory] = useState(''); // 'Men' or 'Women'

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
                        price: data.price.toString(),
                        discount_price: data.discount_price ? data.discount_price.toString() : '',
                        sizes: data.sizes || []
                    });
                    // Determine parent category
                    if (data.category === 'Men') {
                        setParentCategory('Men');
                    } else if (data.category === 'Cosmetics') {
                        setParentCategory('Cosmetics');
                    } else {
                        setParentCategory('Women');
                    }
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

            // Clean data
            const cleanProduct = {
                name: product.name,
                category: product.category,
                price: parseFloat(product.price.toString().replace(/,/g, '')),
                discount_price: product.discount_price ? parseFloat(product.discount_price.toString().replace(/,/g, '')) : null,
                stock: parseInt(product.stock, 10) || 0,
                image_url: finalImageUrl,
                description: product.description,
                sizes: product.sizes
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
                                                setProduct(prev => ({ ...prev, category: val, sizes: [] }));
                                            } else {
                                                setProduct(prev => ({ ...prev, category: '', sizes: [] }));
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
                                                setProduct(prev => ({ ...prev, category: val, sizes: [] }));
                                            }}
                                            required
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'white' }}
                                        >
                                            <option value="">Select Sub</option>
                                            <option value="Sarees">Sarees</option>
                                            <option value="Dresses">Dresses</option>
                                            <option value="Silk">Silk</option>
                                            <option value="Cotton">Cotton</option>
                                            <option value="Designer">Designer</option>
                                            <option value="Wedding">Wedding</option>
                                            <option value="Lehenga">Lehenga</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sizes Section */}
                    {(parentCategory === 'Men' || product.category === 'Dresses') && (
                        <div className="glass-morphism" style={{ padding: '2rem', borderRadius: '20px', backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)' }}>Select Available Sizes</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                                    const isSelected = product.sizes.includes(size);
                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => {
                                                setProduct(prev => {
                                                    const newSizes = isSelected
                                                        ? prev.sizes.filter(s => s !== size)
                                                        : [...prev.sizes, size];
                                                    return { ...prev, sizes: newSizes };
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
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {size}
                                        </button>
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
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                            <textarea
                                name="description"
                                value={product.description || ''}
                                onChange={handleChange}
                                rows="4"
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
                                id="camera-upload-edit"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('camera-upload-edit').click()}
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
                                id="file-upload-edit"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('file-upload-edit').click()}
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
