import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios.js';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUserSession = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                    const response = await api.get('/users/current-user');
                    const storedUser = JSON.parse(localStorage.getItem("user"));
                    setUser(storedUser);
                    setToken(storedToken);

                } catch (error) {
                    console.error("Session verification failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyUserSession();
    }, []);

    const login = (userData, authToken) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};