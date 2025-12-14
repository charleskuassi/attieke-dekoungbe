import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/api/auth/forgot-password', { email });
            setMessage('Si cet email existe, un lien de réinitialisation vous a été envoyé.');
        } catch (err) {
            console.error(err);
            setError('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-orange-50 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md transition-colors">
                <h1 className="text-2xl font-serif font-bold text-center mb-6 text-gray-800 dark:text-white">
                    Mot de passe oublié
                </h1>

                {message && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Votre Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border dark:border-gray-600 rounded p-2 dark:bg-gray-700 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
                        {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-orange-400 underline">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
