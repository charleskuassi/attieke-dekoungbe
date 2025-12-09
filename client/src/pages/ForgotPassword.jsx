import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
            setMessage('Si cet email existe, un lien de réinitialisation vous a été envoyé.');
        } catch (err) {
            setError('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-orange-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-serif font-bold text-center mb-6 text-gray-800">
                    Mot de passe oublié
                </h1>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Votre Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border rounded p-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50">
                        {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-primary underline">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
