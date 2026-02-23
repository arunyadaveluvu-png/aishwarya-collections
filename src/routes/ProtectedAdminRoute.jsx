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
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
