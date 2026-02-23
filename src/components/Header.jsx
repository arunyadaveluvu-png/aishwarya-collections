import React from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, LogOut, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import Logo from './Logo';

const categories = [
    { label: 'Men', to: '/?category=Men' },
    {
        label: 'Women',
        to: '/?category=Women',
        subcategories: [
            { label: 'Sarees', to: '/?category=Sarees' },
            { label: 'Dresses', to: '/?category=Dresses' },
        ]
    }
];

const navLinks = [
    { to: '/', label: 'Home' },
    ...categories.map(cat => ({ to: cat.to, label: cat.label, subcategories: cat.subcategories })),
];

const Header = ({ cartCount = 0 }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [showSearch, setShowSearch] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const { user, isAdmin, role, logout } = useAuth();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (showProfileMenu && !e.target.closest('.user-menu-container')) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileMenu]);

    // Prevent body scroll when mobile menu is open
    React.useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        setShowProfileMenu(false);
        setIsOpen(false);
        try {
            await logout();
            navigate('/auth-selection');
        } catch (error) {
            console.error('[Header] Logout failed:', error);
        }
    };

    const closeMobileMenu = () => setIsOpen(false);

    return (
        <>
            <header className="glass-morphism" style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                padding: '1rem 0'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none' }} onClick={closeMobileMenu}>
                        <Logo size="medium" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'center'
                    }}>
                        {navLinks.map(link => (
                            <div key={link.label} className="nav-item-container" style={{ position: 'relative' }}>
                                {link.subcategories ? (
                                    <div className="dropdown-trigger" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        padding: '5px 0'
                                    }}>
                                        <Link to={link.to} className="nav-link">{link.label}</Link>
                                        <ChevronDown size={14} className="chevron-icon" />

                                        <div className="dropdown-menu glass-morphism">
                                            {link.subcategories.map(sub => (
                                                <Link key={sub.label} to={sub.to} className="dropdown-item">
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link to={link.to} className="nav-link">{link.label}</Link>
                                )}
                            </div>
                        ))}
                        {isAdmin && (
                            <Link to="/admin" className="nav-link" style={{
                                color: 'var(--primary)',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <ShieldCheck size={16} />
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                        {/* Search */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            {showSearch && (
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    style={{
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        border: '1px solid var(--border)',
                                        marginRight: '10px',
                                        width: '130px',
                                        fontSize: '0.8rem',
                                    }}
                                    autoFocus
                                />
                            )}
                            <Search size={20} color="var(--secondary)" style={{ cursor: 'pointer' }}
                                onClick={() => setShowSearch(!showSearch)} />
                        </div>

                        {/* Wishlist */}
                        <Link to="/account/wishlist" style={{ position: 'relative', color: 'inherit', textDecoration: 'none' }}>
                            <Heart size={20} color="var(--secondary)" style={{ cursor: 'pointer' }} />
                            {wishlist && wishlist.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-8px', right: '-8px',
                                    backgroundColor: 'var(--accent)', color: 'white',
                                    fontSize: '10px', borderRadius: '50%',
                                    width: '16px', height: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{wishlist.length}</span>
                            )}
                        </Link>

                        {/* User */}
                        {user ? (
                            <div className="user-menu-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={20} color="var(--primary)" style={{ cursor: 'pointer' }}
                                    onClick={() => setShowProfileMenu(!showProfileMenu)} />
                                {showProfileMenu && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0,
                                        marginTop: '10px', background: 'white',
                                        borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        padding: '0.5rem', minWidth: '180px',
                                        display: 'flex', flexDirection: 'column', gap: '5px',
                                        zIndex: 1100, border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ padding: '10px 15px', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                                            {user.email?.split('@')[0] || 'User'}
                                        </div>
                                        <Link to="/account/orders" style={{ padding: '10px 15px', textDecoration: 'none', color: 'var(--secondary)', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            onClick={() => setShowProfileMenu(false)}>
                                            <ShoppingCart size={16} /> My Orders
                                        </Link>
                                        <Link to="/account/wishlist" style={{ padding: '10px 15px', textDecoration: 'none', color: 'var(--secondary)', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            onClick={() => setShowProfileMenu(false)}>
                                            <Heart size={16} /> My Favorites
                                        </Link>
                                        <button onClick={handleLogout} style={{
                                            padding: '10px 15px', background: 'none', border: 'none',
                                            textAlign: 'left', color: 'var(--accent)', fontSize: '0.9rem',
                                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                                            gap: '10px', cursor: 'pointer'
                                        }}>
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth-selection" style={{ textDecoration: 'none', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <User size={20} />
                                <span className="login-text" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Login</span>
                            </Link>
                        )}

                        {/* Cart */}
                        <Link to="/cart" style={{ position: 'relative', color: 'inherit', textDecoration: 'none' }}>
                            <ShoppingCart size={20} color="var(--secondary)" style={{ cursor: 'pointer' }} />
                            <span style={{
                                position: 'absolute', top: '-8px', right: '-8px',
                                backgroundColor: 'var(--primary)', color: 'white',
                                fontSize: '10px', borderRadius: '50%',
                                width: '16px', height: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>{cartCount}</span>
                        </Link>

                        {/* Hamburger - mobile only */}
                        <button
                            className="hamburger-btn"
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'none', padding: '4px', color: 'var(--secondary)'
                            }}
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    onClick={closeMobileMenu}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 1200,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Mobile Drawer */}
            <div style={{
                position: 'fixed',
                top: 0, right: 0,
                height: '100vh',
                width: '80%',
                maxWidth: '320px',
                background: 'white',
                zIndex: 1300,
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
            }}>
                {/* Drawer Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.2rem 1.5rem',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <Logo size="small" />
                    <button onClick={closeMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--secondary)" />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div style={{ padding: '1rem 1.5rem', background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signed in as</div>
                        <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>{user.email?.split('@')[0]}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{role}</div>
                    </div>
                )}

                {/* Nav Links */}
                <nav style={{ padding: '1rem 0', flex: 1 }}>
                    <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
                        Shop
                    </div>
                    {navLinks.map(link => (
                        <div key={link.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: '1rem' }}>
                                <Link
                                    to={link.to}
                                    onClick={closeMobileMenu}
                                    style={{
                                        display: 'block',
                                        padding: '0.8rem 1.5rem',
                                        textDecoration: 'none',
                                        color: 'var(--secondary)',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        flex: 1,
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {link.label}
                                </Link>
                                {link.subcategories && (
                                    <div style={{ padding: '0.8rem 1.5rem', cursor: 'pointer' }} onClick={(e) => {
                                        e.preventDefault();
                                        const el = document.getElementById(`sub-${link.label}`);
                                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                    }}>
                                        <ChevronDown size={18} color="var(--text-muted)" />
                                    </div>
                                )}
                            </div>
                            {link.subcategories && (
                                <div id={`sub-${link.label}`} style={{ display: 'none', backgroundColor: '#fafafa', borderLeft: '3px solid var(--primary)', marginLeft: '1.5rem' }}>
                                    {link.subcategories.map(sub => (
                                        <Link
                                            key={sub.label}
                                            to={sub.to}
                                            onClick={closeMobileMenu}
                                            style={{
                                                display: 'block',
                                                padding: '0.6rem 1.5rem',
                                                textDecoration: 'none',
                                                color: 'var(--secondary)',
                                                fontSize: '0.9rem',
                                                borderBottom: '1px solid #eee'
                                            }}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {isAdmin && (
                        <Link to="/admin" onClick={closeMobileMenu} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '0.8rem 1.5rem',
                            textDecoration: 'none',
                            color: 'var(--primary)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderBottom: '1px solid #f5f5f5',
                        }}>
                            <ShieldCheck size={16} /> Admin Panel
                        </Link>
                    )}
                </nav>

                {/* Mobile Account Actions */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {user ? (
                        <>
                            <Link to="/account/orders" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--secondary)', fontSize: '0.95rem' }}>
                                <ShoppingCart size={18} /> My Orders
                            </Link>
                            <Link to="/account/wishlist" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--secondary)', fontSize: '0.95rem' }}>
                                <Heart size={18} /> My Favorites
                            </Link>
                            <button onClick={handleLogout} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--accent)', fontSize: '0.95rem', padding: 0
                            }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/auth-selection" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--secondary)', fontWeight: '600', fontSize: '1rem' }}>
                            <User size={18} /> Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;
