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
            console.log("Token received in callback, saving and reloading...");
            // 1. Store Token immediately
            localStorage.setItem('token', token);
            
            // 2. Force HARD RELOAD to root immediately
            // We skip fetching /me here because AuthContext will do it on app init
            // This avoids race conditions and double-fetching issues
            window.location.href = '/'; 
        } else {
            console.error("No token found in callback URL");
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
