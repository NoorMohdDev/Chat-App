import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;