import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import GoogleButton from '../components/GoogleButton';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '', password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(formData.email, formData.password);
        if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from === '/login' ? '/' : from);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-orange-50 dark:bg-gray-900 px-4 py-12 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md transition-colors">
                <h1 className="text-3xl font-serif font-bold text-center mb-6 text-primary dark:text-orange-500">
                    Connexion
                </h1>
                {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Email</label>
                        <input type="email" name="email" required className="w-full border dark:border-gray-600 rounded p-2 dark:bg-gray-700 dark:text-white" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Mot de passe</label>
                        <input type="password" name="password" required className="w-full border dark:border-gray-600 rounded p-2 dark:bg-gray-700 dark:text-white" onChange={handleChange} />
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-primary dark:text-orange-400 hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition">
                        Se connecter
                    </button>
                </form>

                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">OU</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <GoogleButton text="Se connecter avec Google" />

                <div className="mt-4 text-center">
                    <Link
                        to="/register"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-orange-400 underline"
                    >
                        Pas de compte ? Créer un compte
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
