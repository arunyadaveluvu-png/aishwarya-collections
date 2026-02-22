import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    LogOut,
    Home as HomeIcon,
    ChevronRight,
    ShoppingBag,
    Menu,
    X,
    ShieldCheck,
    Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import SessionTimeoutModal from './SessionTimeoutModal';

const AdminLayout = () => {
    const { logout, user, showTimeoutModal, resetTimer } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin-login');
        } catch (err) {
            navigate('/auth-selection');
        }
    };

    const navItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
        { label: 'Admins', path: '/admin/manage-admins', icon: ShieldCheck },
    ];

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div onClick={closeSidebar} style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 200,
                    display: 'none'
                }} className="admin-overlay" />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`} style={{
                width: '260px',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                padding: '2rem 0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 300,
                transition: 'transform 0.3s ease',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '0 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Logo size="small" light={true} />
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '5px', letterSpacing: '2px' }}>ADMIN PANEL</div>
                </div>

                <nav style={{ padding: '2rem 1rem', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                                    <Link
                                        to={item.path}
                                        onClick={closeSidebar}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.8rem 1rem',
                                            color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Icon size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
                                        <span style={{ fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
                                        {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', color: 'white', flexShrink: 0 }}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
                    </div>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '0.8rem 1rem', color: 'var(--accent)', backgroundColor: 'transparent', border: '1px solid var(--accent)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <LogOut size={18} style={{ marginRight: '12px' }} />
                        Log Out
                    </button>
                    <Link to="/" onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 1rem', marginTop: '0.5rem', color: 'white', textDecoration: 'none', fontSize: '0.8rem', opacity: 0.6 }}>
                        <HomeIcon size={14} style={{ marginRight: '8px' }} />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main" style={{ marginLeft: '260px', flex: 1, padding: '2rem', minWidth: 0 }}>
                {/* Mobile Top Bar */}
                <div className="admin-topbar" style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 150,
                    marginBottom: '1.5rem',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '4px' }}>
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Logo size="small" light={true} />
                    </div>
                    <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textDecoration: 'none' }}>
                        <HomeIcon size={20} />
                    </Link>
                </div>

                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="admin-bottom-nav" style={{
                display: 'none',
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                backgroundColor: 'var(--secondary)',
                zIndex: 400,
                padding: '0.5rem 0',
                boxShadow: '0 -2px 12px rgba(0,0,0,0.15)'
            }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            textDecoration: 'none',
                            color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                            fontSize: '0.65rem',
                            fontWeight: isActive ? '600' : '400',
                            flex: 1,
                            padding: '0.5rem 0'
                        }}>
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <SessionTimeoutModal
                isOpen={showTimeoutModal}
                onStay={resetTimer}
                onLogout={logout}
            />
        </div>
    );
};

export default AdminLayout;
