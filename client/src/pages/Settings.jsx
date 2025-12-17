import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Save, User, Phone, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        // Validation Phone (8 digits)
        const phoneRegex = /^\d{8}$/;
        const cleanPhone = formData.phone.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            setError('Le numéro de téléphone doit comporter 8 chiffres.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.put(
                '/api/auth/profile',
                { ...formData, phone: cleanPhone }
            );

            updateUser(res.data.user);
            setMessage('Profil mis à jour avec succès !');
        } catch (err) {
            console.error("Profile update error:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour.';
            const errorStatus = err.response?.status ? `(${err.response.status})` : '';
            setError(`Erreur: ${errorMsg} ${errorStatus}`);

            // Auto-logout if 401 (Unauthorized) or 404 (User not found)
            if (err.response?.status === 401 || err.response?.status === 404) {
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-3xl font-serif font-bold mb-8 text-center text-gray-900 dark:text-white">Paramètres du Compte</h1>

            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-colors">
                {message && (
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4 flex items-center">
                        <CheckCircle className="mr-2" size={20} /> {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 flex items-center">
                        <AlertCircle className="mr-2" size={20} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <User size={16} className="mr-2" /> Nom Complet
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <Phone size={16} className="mr-2" /> Téléphone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            placeholder="97000000"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format : 8 chiffres</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <MapPin size={16} className="mr-2" /> Adresse de livraison par défaut
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow transition transform active:scale-95 disabled:opacity-70 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Enregistrer</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
