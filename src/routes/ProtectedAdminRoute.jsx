import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedAdminRoute = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin-login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }}>403</h1>
                <h2>Unauthorized Access</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You do not have the required permissions to view this page.</p>
                <Navigate to="/" replace />
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
