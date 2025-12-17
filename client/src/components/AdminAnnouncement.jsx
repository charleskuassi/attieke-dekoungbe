import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Megaphone, Save, CheckCircle } from 'lucide-react';

const AdminAnnouncement = () => {
    const [formData, setFormData] = useState({
        message: '',
        isActive: false
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await api.get('/api/announcement');
                setFormData({
                    message: data.message || '',
                    isActive: data.isActive || false
                });
            } catch (error) {
                console.error("Failed to fetch announcement", error);
            }
        };
        fetchAnnouncement();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await api.post('/api/announcement', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update announcement", error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-2xl transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <Megaphone className="text-primary" /> Configuration Annonce
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Afficher la barre d'annonce</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Visible en haut de toutes les pages.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message de l'annonce</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows="3"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: Fermeture exceptionnelle ce mardi..."
                    ></textarea>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : <><Save size={18} /> Enregistrer</>}
                    </button>

                    {success && (
                        <span className="text-green-600 flex items-center gap-2 font-medium animate-fade-in">
                            <CheckCircle size={18} /> Mis à jour avec succès !
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncement;
