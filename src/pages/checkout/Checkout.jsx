import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { MapPin, Plus, Check, Clock } from 'lucide-react';

const Checkout = ({ cart, setCart }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [fetchingAddresses, setFetchingAddresses] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        paymentMethod: 'upi',
        saveAddress: true
    });

    const fetchAddresses = useCallback(async () => {
        try {
            setFetchingAddresses(true);
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedAddresses(data || []);

            if (data && data.length > 0) {
                const defaultAddr = data.find(a => a.is_default) || data[0];
                setSelectedAddressId(defaultAddr.id);
                setFormData(prev => ({
                    ...prev,
                    firstName: defaultAddr.first_name,
                    lastName: defaultAddr.last_name,
                    address: defaultAddr.address,
                    city: defaultAddr.city,
                    pincode: defaultAddr.pincode
                }));
            } else {
                setIsAddingNew(true);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error.message);
        } finally {
            setFetchingAddresses(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const total = cart.reduce(
        (sum, item) =>
            sum + parseFloat(item.price.toString().replace(/,/g, '')),
        0
    );

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr.id);
        setIsAddingNew(false);
        setFormData(prev => ({
            ...prev,
            firstName: addr.first_name,
            lastName: addr.last_name,
            address: addr.address,
            city: addr.city,
            pincode: addr.pincode
        }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;

            if (!user) {
                alert("Please login first");
                setLoading(false);
                return;
            }

            // Save address if new and requested
            if (isAddingNew && formData.saveAddress) {
                await supabase.from('user_addresses').insert([{
                    user_id: user.id,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    pincode: formData.pincode
                }]);
            }

            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert([{
                    user_id: user.id,
                    total: total,
                    status: "Pending",
                    payment_method: formData.paymentMethod,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    pincode: formData.pincode
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            const items = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: 1,
                price: parseFloat(item.price.toString().replace(/,/g, '')),
                product_name: item.name,
                category: item.category,
                selected_size: item.selectedSize || null
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(items);

            if (itemsError) throw itemsError;

            // Decrement stock for each ordered item directly
            for (const item of items) {
                // Fetch current stock first
                const { data: currentProduct } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.product_id)
                    .single();

                if (currentProduct) {
                    const newStock = Math.max(0, (currentProduct.stock || 0) - item.quantity);
                    await supabase
                        .from('products')
                        .update({ stock: newStock })
                        .eq('id', item.product_id);
                }
            }

            setCart([]);
            navigate("/order-success");

        } catch (error) {
            console.error("Order Error:", error);
            alert("Something went wrong while placing order: " + error.message);
        }

        setLoading(false);
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
                <h2>Your bag is empty</h2>
                <Link to="/" className="btn">Back to Collection</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Checkout</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>

                    {/* LEFT SIDE */}
                    <div style={{
                        background: '#fff',
                        padding: '2.5rem',
                        borderRadius: '18px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }}>

                        {/* STEP 1 - SHIPPING */}
                        {step === 1 && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <MapPin size={24} color="var(--primary)" />
                                    Shipping Information
                                </h3>

                                {fetchingAddresses ? (
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                        <div className="loading-spinner"></div>
                                        <p>Checking for saved addresses...</p>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '2rem' }}>
                                        {savedAddresses.length > 0 && !isAddingNew && (
                                            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose from your saved addresses:</p>
                                                {savedAddresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => handleSelectAddress(addr)}
                                                        style={{
                                                            padding: '1rem',
                                                            borderRadius: '12px',
                                                            border: selectedAddressId === addr.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                            backgroundColor: selectedAddressId === addr.id ? 'rgba(212, 175, 55, 0.05)' : 'white',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontWeight: '600' }}>{addr.first_name} {addr.last_name}</div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                {addr.address}, {addr.city} - {addr.pincode}
                                                            </div>
                                                        </div>
                                                        {selectedAddressId === addr.id && <Check size={20} color="var(--primary)" />}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setIsAddingNew(true);
                                                        setSelectedAddressId(null);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            firstName: '',
                                                            lastName: '',
                                                            address: '',
                                                            city: '',
                                                            pincode: ''
                                                        }));
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: 'var(--primary)',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        marginTop: '0.5rem'
                                                    }}
                                                >
                                                    <Plus size={18} /> Add New Address
                                                </button>
                                            </div>
                                        )}

                                        {(isAddingNew || savedAddresses.length === 0) && (
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {savedAddresses.length > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <p style={{ fontWeight: '600' }}>Adding New Address</p>
                                                        <button
                                                            onClick={fetchAddresses}
                                                            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <input className="checkout-input" required type="text" name="firstName" placeholder="First Name"
                                                        value={formData.firstName} onChange={handleInputChange} />
                                                    <input className="checkout-input" required type="text" name="lastName" placeholder="Last Name"
                                                        value={formData.lastName} onChange={handleInputChange} />
                                                </div>
                                                <textarea className="checkout-input" required name="address" placeholder="Full Address"
                                                    value={formData.address} onChange={handleInputChange} rows="3" />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <input className="checkout-input" required type="text" name="city" placeholder="City"
                                                        value={formData.city} onChange={handleInputChange} />
                                                    <input className="checkout-input" required type="text" name="pincode" placeholder="Pincode"
                                                        value={formData.pincode} onChange={handleInputChange} />
                                                </div>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="saveAddress"
                                                        checked={formData.saveAddress}
                                                        onChange={handleInputChange}
                                                        style={{ accentColor: 'var(--primary)' }}
                                                    />
                                                    Save this address for future orders
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="checkout-btn"
                                    onClick={nextStep}
                                    disabled={!formData.address || !formData.city || !formData.pincode}
                                    style={{ opacity: (!formData.address || !formData.city || !formData.pincode) ? 0.6 : 1 }}
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}

                        {/* STEP 2 - PAYMENT */}
                        {step === 2 && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem' }}>Select Payment Method</h3>


                                <div className="payment-card"
                                    onClick={() => setFormData({ ...formData, paymentMethod: "upi" })}
                                    style={{
                                        border: formData.paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        backgroundColor: formData.paymentMethod === 'upi' ? 'rgba(212, 175, 55, 0.05)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input type="radio" checked={formData.paymentMethod === "upi"} readOnly style={{ accentColor: 'var(--primary)' }} />
                                        <span>UPI (GPay / PhonePe / Paytm)</span>
                                    </div>
                                </div>

                                <div className="payment-card"
                                    onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                                    style={{
                                        border: formData.paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        backgroundColor: formData.paymentMethod === 'cod' ? 'rgba(212, 175, 55, 0.05)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input type="radio" checked={formData.paymentMethod === "cod"} readOnly style={{ accentColor: 'var(--primary)' }} />
                                        <span>Cash On Delivery</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button className="btn-outline" onClick={prevStep} style={{ flex: 1 }}>
                                        Back
                                    </button>
                                    <button className="checkout-btn" onClick={nextStep} style={{ flex: 2 }}>
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 - REVIEW */}
                        {step === 3 && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem' }}>Final Review</h3>

                                <div style={{
                                    padding: '1.5rem',
                                    background: '#f9f9f9',
                                    borderRadius: '12px',
                                    marginBottom: '1.5rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>SHIPPING TO</div>
                                        <strong style={{ fontSize: '1.1rem' }}>{formData.firstName} {formData.lastName}</strong>
                                        <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>
                                            {formData.address}, {formData.city} - {formData.pincode}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>PAYMENT</div>
                                            <p style={{ fontWeight: '600' }}>{formData.paymentMethod.toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>DELIVERY</div>
                                            <p style={{ fontWeight: '600' }}>Standard (3-5 Days)</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn-outline" onClick={prevStep} style={{ flex: 1 }}>
                                        Back
                                    </button>

                                    <button
                                        className="checkout-btn"
                                        onClick={handleSubmitOrder}
                                        disabled={loading}
                                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: 0 }}></div>
                                                Placing Order...
                                            </>
                                        ) : "Confirm & Pay"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE - ORDER SUMMARY */}
                    <div style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '18px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Order Summary</h3>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {cart.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginBottom: '1rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid #f5f5f5'
                                }}>
                                    <img
                                        src={item.image_url || item.image}
                                        alt={item.name}
                                        style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: 1</div>
                                        <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem' }}>₹{item.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <span>Subtotal</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <span>Shipping</span>
                                <span style={{ color: '#059669' }}>Calculated at next step</span>
                            </div>
                            <hr style={{ margin: '0.5rem 0', border: '0', borderTop: '1px solid var(--border)' }} />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: '700',
                                fontSize: '1.2rem',
                                color: 'var(--secondary)',
                                marginTop: '0.5rem'
                            }}>
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Check size={18} color="var(--primary)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure encoded checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
