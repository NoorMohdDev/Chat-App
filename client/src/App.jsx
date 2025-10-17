import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ChatDashboard from './pages/ChatDashboard.jsx';

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
    const { loading } = useAuth();
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            {/* The Toaster component provides global notifications */}
            <Toaster 
                position="top-right" 
                toastOptions={{
                    style: {
                        background: 'var(--surface-2)',
                        color: 'var(--text-primary)',
                    },
                }}
            />
            <Routes>
                {/* --- Public Routes --- */}
                {/* These routes are only accessible to non-authenticated users. */}
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/signup" 
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    } 
                />

                {/* --- Protected Routes --- */}
                {/* This is the main dashboard, accessible only to authenticated users. */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <ChatDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* --- Catch-all Route --- */}
                {/* Redirects any unknown URL to the main page. */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default App;