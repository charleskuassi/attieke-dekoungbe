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
        <div className="min-h-[80vh] flex items-center justify-center bg-orange-50 px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-serif font-bold text-center mb-6 text-primary">
                    Connexion
                </h1>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Email</label>
                        <input type="email" name="email" required className="w-full border rounded p-2" onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Mot de passe</label>
                        <input type="password" name="password" required className="w-full border rounded p-2" onChange={handleChange} />
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition">
                        Se connecter
                    </button>
                </form>

                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">OU</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <GoogleButton text="Se connecter avec Google" />

                <div className="mt-4 text-center">
                    <Link
                        to="/register"
                        className="text-sm text-gray-600 hover:text-primary underline"
                    >
                        Pas de compte ? Créer un compte
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
