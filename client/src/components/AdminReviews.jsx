import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Star, AlertTriangle, CheckCircle, MessageSquare, Phone } from 'lucide-react';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/api/reviews');
            setReviews(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/api/reviews/${id}/read`);
            // Update local state
            setReviews(reviews.map(r => r.id === id ? { ...r, status: 'read' } : r));
        } catch (error) {
            console.error("Error marking as read:", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    if (loading) return <div className="text-center p-8 dark:text-white">Chargement des avis...</div>;

    const complaints = reviews.filter(r => r.type === 'plainte');
    const positiveReviews = reviews.filter(r => r.type === 'avis');

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Gestion des Avis & Plaintes</h2>

            {/* Complaints Section - Urgent */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-500 flex items-center gap-2">
                    <AlertTriangle /> Plaintes & Réclamations
                </h3>
                {complaints.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">Aucune plainte à traiter. Super !</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {complaints.map(review => (
                            <div key={review.id} className={`bg-white dark:bg-gray-800 border-l-4 rounded-r-xl shadow-sm p-4 transition-colors ${review.status === 'new'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-lg dark:text-white">{review.User?.name}</span>
                                            <a href={`tel:${review.User?.phone}`} className="flex items-center gap-1 text-sm bg-white dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600 shadow-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                                <Phone size={14} /> {review.User?.phone}
                                            </a>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200">{review.message}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {review.status === 'new' ? (
                                            <button
                                                onClick={() => handleMarkAsRead(review.id)}
                                                className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white text-sm font-bold rounded hover:bg-red-700 dark:hover:bg-red-600 transition"
                                            >
                                                Marquer Traité
                                            </button>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded font-medium">Traité</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="space-y-4 pt-8 border-t dark:border-gray-700">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-500 flex items-center gap-2">
                    <MessageSquare /> Avis Clients
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positiveReviews.map(review => (
                        <div key={review.id} className="bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30 rounded-xl shadow-sm p-4 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold dark:text-white">{review.User?.name}</span>
                                    <div className="flex text-yellow-400">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 italic">"{review.message}"</p>
                            {review.status === 'new' && (
                                <button
                                    onClick={() => handleMarkAsRead(review.id)}
                                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Marquer comme lu
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
