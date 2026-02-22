import React from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import Logo from './Logo';

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

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const handleWishlist = () => {
        console.log('Wishlist icon clicked - placeholder function');
    };

    const handleLogout = async () => {
        console.log('[Header] Logout button clicked');
        setShowProfileMenu(false);
        try {
            await logout();
            console.log('[Header] Logout successful, navigating...');
            navigate('/auth-selection');
        } catch (error) {
            console.error('[Header] Logout failed:', error);
            // Even if it fails, clear the menu
            setShowProfileMenu(false);
        }
    };

    return (
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
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Logo size="medium" />
                </Link>

                {/* Desktop Navigation */}
                <nav style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/?category=Silk" className="nav-link">Silk</Link>
                    <Link to="/?category=Cotton" className="nav-link">Cotton</Link>
                    <Link to="/?category=Designer" className="nav-link">Designer</Link>
                    <Link to="/?category=Wedding" className="nav-link">Wedding</Link>
                    <Link to="/?category=Party%20wear" className="nav-link">Party Wear</Link>
                    <Link to="/?category=Lehenga" className="nav-link">Lehengas</Link>
                    <Link to="/?category=Kurtis%20&%20Suits" className="nav-link">Kurtis</Link>
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
                <div style={{
                    display: 'flex',
                    gap: '1.2rem',
                    alignItems: 'center'
                }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        {showSearch && (
                            <input
                                type="text"
                                placeholder="Search sarees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                style={{
                                    padding: '5px 10px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border)',
                                    marginRight: '10px',
                                    width: '150px',
                                    fontSize: '0.8rem',
                                    animation: 'fadeIn 0.3s ease'
                                }}
                                autoFocus
                            />
                        )}
                        <Search
                            size={20}
                            color="var(--secondary)"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowSearch(!showSearch)}
                        />
                    </div>

                    <Link to="/account/wishlist" style={{ position: 'relative', color: 'inherit', textDecoration: 'none' }}>
                        <Heart
                            size={20}
                            color="var(--secondary)"
                            style={{ cursor: 'pointer' }}
                        />
                        {wishlist && wishlist.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: 'var(--accent)',
                                color: 'white',
                                fontSize: '10px',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>{wishlist.length}</span>
                        )}
                    </Link>

                    {user ? (
                        <div className="user-menu-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                                    {user.email?.split('@')[0] || 'User'}
                                </span>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>
                                    {role}
                                </span>
                            </div>
                            <User
                                size={20}
                                color="var(--primary)"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                title={user.email}
                            />

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '10px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    padding: '0.5rem',
                                    minWidth: '180px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px',
                                    zIndex: 1100,
                                    border: '1px solid var(--border)',
                                    animation: 'slideInDown 0.2s ease'
                                }}>
                                    <Link
                                        to="/account/orders"
                                        style={{
                                            padding: '10px 15px',
                                            textDecoration: 'none',
                                            color: 'var(--secondary)',
                                            fontSize: '0.9rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'background 0.2s'
                                        }}
                                        onClick={() => setShowProfileMenu(false)}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <ShoppingCart size={16} />
                                        My Orders
                                    </Link>
                                    <Link
                                        to="/account/wishlist"
                                        style={{
                                            padding: '10px 15px',
                                            textDecoration: 'none',
                                            color: 'var(--secondary)',
                                            fontSize: '0.9rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'background 0.2s'
                                        }}
                                        onClick={() => setShowProfileMenu(false)}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Heart size={16} />
                                        My Favorites
                                    </Link>
                                    <div style={{ height: '1px', background: 'var(--border)', margin: '5px 0' }}></div>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            padding: '10px 15px',
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            color: 'var(--accent)',
                                            fontSize: '0.9rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth-selection" style={{ textDecoration: 'none', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={20} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Login</span>
                        </Link>
                    )}

                    <Link to="/cart" style={{ position: 'relative', color: 'inherit', textDecoration: 'none' }}>
                        <ShoppingCart size={20} color="var(--secondary)" style={{ cursor: 'pointer' }} />
                        <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            fontSize: '10px',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>{cartCount}</span>
                    </Link>

                    <button
                        style={{ display: 'none' }} // Toggle for mobile
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
