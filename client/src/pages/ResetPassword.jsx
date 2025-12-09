import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Les mots de passe ne correspondent pas');
        }

        setLoading(true);
        setError('');

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
            setMessage('Mot de passe réinitialisé avec succès ! Redirection...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lien invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-orange-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-serif font-bold text-center mb-6 text-gray-800">
                    Nouveau mot de passe
                </h1>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Nouveau mot de passe</label>
                        <input
                            type="password"
                            required
                            className="w-full border rounded p-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Confirmer</label>
                        <input
                            type="password"
                            required
                            className="w-full border rounded p-2"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50">
                        {loading ? 'Modification...' : 'Changer le mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
