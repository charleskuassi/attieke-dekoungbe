import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (token) {
                // Ensure Axios has the token
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error("Stored user parse error", e);
                        localStorage.removeItem('user');
                    }
                } else {
                    // Token exists but no user data (e.g. fresh Google Login)
                    // We must fetch the user profile
                    try {
                        const res = await api.get('/api/auth/me');
                        setUser(res.data);
                        localStorage.setItem('user', JSON.stringify(res.data));
                        console.log("User profile fetched via token on init");
                    } catch (err) {
                        console.error("Failed to fetch user with stored token", err);
                        // If token is invalid, clear it
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/api/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // Clear cart on logout
        setUser(null);
        setUser(null);
        // Navigate or simple state update is enough usually 
        window.location.href = '/login';
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const loginWithData = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithData, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
