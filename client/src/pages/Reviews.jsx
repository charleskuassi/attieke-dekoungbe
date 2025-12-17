import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, AlertTriangle, Send } from 'lucide-react';

const Reviews = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'avis', // 'avis' or 'plainte'
        rating: 5,
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Vous devez être connecté pour donner votre avis.");
                navigate('/login');
                return;
            }

            await api.post('/api/reviews', formData);

            setSuccessMessage(formData.type === 'avis' ? "Merci pour votre avis ! 😊" : "Votre plainte a été reçue. Nous vous recontacterons rapidement.");
            setFormData({ type: 'avis', rating: 5, message: '' }); // Reset form
        } catch (error) {
            console.error("Review Error:", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (successMessage) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center transition-colors">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Envoyé !</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{successMessage}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-orange-700 transition"
                    >
                        Retour à l'accueil
                    </button>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                    >
                        Envoyer un autre message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-8 transition-colors">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-primary dark:text-orange-500">Votre Avis Compte</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Aidez-nous à améliorer Attièkè Dèkoungbé</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selector */}
                    <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'avis' })}
                            className={`flex-1 flex items-center justify-center py-2 rounded-md font-bold transition ${formData.type === 'avis' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <MessageSquare className="mr-2" size={18} /> Avis Positif
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'plainte' })}
                            className={`flex-1 flex items-center justify-center py-2 rounded-md font-bold transition ${formData.type === 'plainte' ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <AlertTriangle className="mr-2" size={18} /> Réclamation
                        </button>
                    </div>

                    {/* Rating (Only for Avis) */}
                    {formData.type === 'avis' && (
                        <div className="flex justify-center space-x-2 py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className={`transition transform hover:scale-110 focus:outline-none ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                >
                                    <Star size={32} fill={star <= formData.rating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Message Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {formData.type === 'avis' ? "Qu'avez-vous apprécié ?" : "Dites-nous quel est le problème"}
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder={formData.type === 'avis' ? "C'était délicieux..." : "Je n'ai pas reçu ma commande..."}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                    >
                        {loading ? 'Envoi...' : (
                            <>
                                <Send className="mr-2" size={18} /> Envoyer
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Reviews;
