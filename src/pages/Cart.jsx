import React from 'react';
import { Trash2, ArrowLeft, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = ({ cart, removeFromCart, clearCart }) => {
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price.toString().replace(/,/g, '')), 0);

    return (
        <div className="container" style={{ padding: '5rem 0', minHeight: '60vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Your Shopping Cart</h2>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                    <ArrowLeft size={18} />
                    Back to Collection
                </Link>
            </div>

            {cart.length === 0 ? (
                <div style={{ padding: '2rem', backgroundColor: 'var(--white)', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your cart is currently empty.</p>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1.5rem', backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', alignItems: 'center' }}>
                                <img
                                    src={item.image_url || item.image}
                                    alt={item.name}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6113c?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                    style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {item.category}{item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                                    </p>
                                </div>
                                <p style={{ fontWeight: 'bold', color: 'var(--primary-dark)', margin: '0 1rem' }}>₹{item.price}</p>
                                <button
                                    onClick={() => removeFromCart(index)}
                                    style={{ color: 'var(--accent)', padding: '8px', borderRadius: '4px' }}
                                    title="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '8px', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span>Subtotal ({cart.length} items)</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span>Shipping</span>
                            <span style={{ color: 'green' }}>FREE</span>
                        </div>
                        <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary-dark)' }}>₹{total.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/checkout" className="btn-primary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>Proceed to Checkout</Link>
                            <button
                                onClick={clearCart}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'transparent',
                                    color: 'var(--accent)',
                                    border: '1px solid var(--accent)',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <XCircle size={18} />
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
