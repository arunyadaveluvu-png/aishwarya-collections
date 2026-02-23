import React, { useState } from 'react';
import { Mail, Instagram, Phone, X, Headset } from 'lucide-react';

const WhatsAppIcon = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408.001 12.045a11.815 11.815 0 001.591 5.976L0 24l6.146-1.612a11.822 11.822 0 005.904 1.577h.004c6.632 0 12.042-5.408 12.045-12.046a11.811 11.811 0 00-3.417-8.525z" />
    </svg>
);

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
            href: 'https://www.instagram.com/aishwaryacollections_2/',
            color: '#E4405F'
        },
        {
            icon: <WhatsAppIcon size={20} />,
            label: 'WhatsApp',
            href: 'https://chat.whatsapp.com/JUedXD0G72mFGioH8TLNCV',
            color: '#25D366'
        },
        {
            icon: <Phone size={20} />,
            label: 'Phone',
            href: 'tel:+919876543210',
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
                            target="_blank"
                            rel="noopener noreferrer"
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
                            <span style={{ color: method.color, display: 'flex', alignItems: 'center' }}>{method.icon}</span>
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
                title="Customer Care"
            >
                {isOpen ? <X size={28} /> : <Headset size={28} />}
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
