import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GoogleCallback = () => {
    const { loginWithToken } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            console.log("Nouveau jeton Google reçu... Nettoyage et connexion.");
            
            const handleTokenLogin = async () => {
                // 1. On nettoie tout avant de mettre le nouveau compte
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                try {
                    const res = await loginWithToken(token);
                    if (res.success) {
                        // 2. Redirection fluide vers l'accueil
                        navigate('/', { replace: true });
                    } else {
                        navigate('/login?error=auth_failed');
                    }
                } catch (err) {
                    console.error("Erreur Callback:", err);
                    navigate('/login?error=system_error');
                }
            };
            
            handleTokenLogin();
        } else {
            console.error("Aucun jeton trouvé dans l'URL");
            navigate('/login');
        }
    }, [searchParams, navigate, loginWithToken]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-orange-500 mb-4"></div>
            <h2 className="text-xl font-serif text-primary dark:text-orange-500">Connexion avec Google...</h2>
        </div>
    );
};

export default GoogleCallback;
