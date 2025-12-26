import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // 1. Store Token
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // 2. Fetch User Data
            // Use fallback URL logic just in case
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            axios.get(`${apiUrl}/api/auth/me`)
                .then(res => {
                    const user = res.data;
                    localStorage.setItem('user', JSON.stringify(user));

                    // Update context directly
                    if (updateUser) updateUser(user);
                    
                    // Force full reload to home to ensure auth state is clean
                    window.location.href = '/';
                })
                .catch(err => {
                    console.error("Failed to fetch profile", err);
                    navigate('/login?error=profile_fetch_failed');
                });

        } else {
            navigate('/login?error=no_token');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-orange-500 mb-4"></div>
            <h2 className="text-xl font-serif text-primary dark:text-orange-500">Connexion avec Google...</h2>
        </div>
    );
};

export default GoogleCallback;
