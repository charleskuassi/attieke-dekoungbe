import React, { useState } from 'react';
import axios from 'axios';
import { Trash, AlertTriangle, CheckCircle, Shield, Archive } from 'lucide-react';

const MaintenancePanel = () => {
    const [days, setDays] = useState(30);
    const [targets, setTargets] = useState({
        orders: true,
        reservations: false,
        messages: false,
        reviews: false
    });
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleTargetChange = (key) => {
        setTargets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getEnabledTargets = () => Object.keys(targets).filter(key => targets[key]);

    const handleCleanup = async () => {
        const enabledTargets = getEnabledTargets();
        if (enabledTargets.length === 0) {
            alert("Veuillez sélectionner au moins un type d'élément à nettoyer.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/cleanup`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { days, targets: enabledTargets }
            });
            setResult(res.data);
            setShowConfirm(false);
        } catch (error) {
            console.error("Cleanup error:", error);
            alert("Erreur lors du nettoyage : " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="text-primary" /> Maintenance & Nettoyage
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Nettoyage Automatique</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Supprimez les anciennes données pour conserver une base de données performante.
                        <br />
                        <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-1">
                            <Archive size={16} /> Les éléments "Archivés" ne seront JAMAIS supprimés.
                        </span>
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Input Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Supprimer les éléments plus vieux de :
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                value={days}
                                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                                className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none font-bold text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <span className="text-gray-600 dark:text-gray-400">jours</span>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Éléments ciblés :
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${targets.orders ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600'}`}>
                                <input type="checkbox" checked={targets.orders} onChange={() => handleTargetChange('orders')} className="w-5 h-5 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                                <span className="font-medium dark:text-gray-200">Commandes</span>
                            </label>
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${targets.reservations ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600'}`}>
                                <input type="checkbox" checked={targets.reservations} onChange={() => handleTargetChange('reservations')} className="w-5 h-5 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                                <span className="font-medium dark:text-gray-200">Réservations</span>
                            </label>
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${targets.messages ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600'}`}>
                                <input type="checkbox" checked={targets.messages} onChange={() => handleTargetChange('messages')} className="w-5 h-5 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                                <span className="font-medium dark:text-gray-200">Messages</span>
                            </label>
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${targets.reviews ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600'}`}>
                                <input type="checkbox" checked={targets.reviews} onChange={() => handleTargetChange('reviews')} className="w-5 h-5 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                                <span className="font-medium dark:text-gray-200">Avis & Plaintes</span>
                            </label>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={loading || getEnabledTargets().length === 0}
                            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105 ${loading || getEnabledTargets().length === 0 ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            <Trash size={20} />
                            {loading ? 'Nettoyage en cours...' : 'Lancer le nettoyage'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Result Display */}
            {result && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 animate-fade-in">
                    <CheckCircle className="text-green-600 dark:text-green-500 w-10 h-10" />
                    <div className="flex-1">
                        <h4 className="font-bold text-green-900 dark:text-green-100 text-lg">Nettoyage terminé avec succès !</h4>
                        <p className="text-green-700 dark:text-green-200">{result.message}</p>
                        <div className="flex gap-4 mt-2 text-sm text-green-800 dark:text-green-200">
                            {Object.entries(result.details || {}).map(([key, count]) => (
                                count > 0 && <span key={key} className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded"><b>{count}</b> {key}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setResult(null)} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-bold px-4">Fermer</button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 dark:text-white">
                        <div className="bg-red-50 dark:bg-red-900/30 p-6 flex justify-center">
                            <div className="bg-red-100 dark:bg-red-800/50 p-4 rounded-full">
                                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Attention !</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Cette action est <span className="font-bold text-red-600 dark:text-red-400">irréversible</span>.
                                <br />
                                Vous allez supprimer définitivement les éléments sélectionnés plus vieux de <b>{days} jours</b>.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-6 flex items-center gap-2 text-left">
                                <Shield size={16} className="shrink-0" />
                                Les éléments que vous avez marqués comme "Archivés" sont protégés et ne seront pas effacés.
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCleanup}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg"
                                >
                                    Confirmer la suppression
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenancePanel;
