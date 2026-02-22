import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    LogOut,
    Home as HomeIcon,
    ChevronRight,
    Search,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import SessionTimeoutModal from './SessionTimeoutModal';

const AdminLayout = () => {
    const { logout, user, showTimeoutModal, resetTimer } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        console.log('[AdminLayout] Admin logout clicked');
        try {
            await logout();
            console.log('[AdminLayout] Admin logout successful');
            navigate('/admin-login');
        } catch (err) {
            console.error('[AdminLayout] Admin logout failed:', err);
            navigate('/auth-selection');
        }
    };

    const navItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Manage Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                padding: '2rem 0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ padding: '0 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Logo size="small" light={true} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>ADMIN PANEL</div>
                </div>

                <nav style={{ padding: '2rem 1rem', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                                    <Link
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.8rem 1rem',
                                            color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <Icon size={20} style={{ marginRight: '12px' }} />
                                        <span style={{ fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
                                        {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.8rem 1rem',
                        marginBottom: '1rem',
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.6)'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            color: 'white'
                        }}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.8rem 1rem',
                            color: 'var(--accent)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--accent)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <LogOut size={18} style={{ marginRight: '12px' }} />
                        Log Out
                    </button>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.8rem 1rem',
                        marginTop: '1rem',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        opacity: 0.6
                    }}>
                        <HomeIcon size={14} style={{ marginRight: '8px' }} />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '2rem' }}>
                <Outlet />
            </main>

            <SessionTimeoutModal
                isOpen={showTimeoutModal}
                onStay={resetTimer}
                onLogout={logout}
            />
        </div>
    );
};

export default AdminLayout;
