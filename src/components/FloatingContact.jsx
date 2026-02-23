import React, { useState } from 'react';
import { Mail, Instagram, Phone, MessageCircle, X, MessageSquare } from 'lucide-react';

const FloatingContact = () => {
    const [isOpen, setIsOpen] = useState(false);

    const contactMethods = [
        {
            icon: <Mail size={20} />,
            label: 'Email',
            href: 'mailto:contactprofixer.com@gmail.com',
            color: '#EA4335'
        },
        {
            icon: <Instagram size={20} />,
            label: 'Instagram',
            href: '#', // In future will connect
            color: '#E4405F'
        },
        {
            icon: <MessageCircle size={20} />,
            label: 'WhatsApp',
            href: '#', // In future will connect
            color: '#25D366'
        },
        {
            icon: <Phone size={20} />,
            label: 'Phone',
            href: '#', // In future will connect
            color: '#34A853'
        }
    ];

    return (
        <div className="floating-contact-container" style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1rem'
        }}>
            {/* Popover Menu */}
            {isOpen && (
                <div className="contact-menu glass-morphism" style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '0.5rem',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {contactMethods.map((method, index) => (
                        <a
                            key={index}
                            href={method.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textDecoration: 'none',
                                color: 'var(--secondary)',
                                padding: '10px 15px',
                                borderRadius: '10px',
                                transition: 'all 0.2s ease',
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateX(-5px)';
                                e.currentTarget.style.color = method.color;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.color = 'var(--secondary)';
                            }}
                        >
                            <span style={{ color: method.color }}>{method.icon}</span>
                            {method.label}
                        </a>
                    ))}
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = isOpen ? 'rotate(90deg) scale(1.1)' : 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = isOpen ? 'rotate(90deg)' : 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    .floating-contact-container {
                        bottom: 1.5rem;
                        right: 1.5rem;
                    }
                    .contact-menu {
                        padding: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default FloatingContact;
