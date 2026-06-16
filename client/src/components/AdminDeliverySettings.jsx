import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, MapPin } from 'lucide-react';

const AdminDeliverySettings = () => {
    const [zones, setZones] = useState([]);
    const [formData, setFormData] = useState({ name: '', price: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await api.get('/api/zones');
            setZones(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Erreur chargement zones:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return alert("Veuillez remplir le nom et le prix.");

        try {
            await api.post('/api/zones', formData);
            setFormData({ name: '', price: '' });
            fetchZones(); // Refresh list
            alert("Zone ajoutée !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette zone ?")) return;
        try {
            await api.delete(`/api/zones/${id}`);
            setZones(zones.filter(z => z.id !== id));
        } catch (error) {
            console.error(error);
            alert("Erreur de suppression.");
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                <MapPin className="text-orange-600" /> Zones de Livraison
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Gérez ici les tarifs de livraison par zone.</p>

            {/* Formulaire Ajout */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold mb-4 dark:text-gray-200">Ajouter une zone</h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nom de la Zone</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Ex: Cotonou Centre"
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Prix (FCFA)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="1000"
                        />
                    </div>
                    <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2 font-medium">
                        <Plus size={18} /> Ajouter
                    </button>
                </form>
            </div>

            {/* Liste des Zones */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto border border-gray-100 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="p-4 font-semibold">Nom de la Zone</th>
                            <th className="p-4 font-semibold">Tarif Livraison</th>
                            <th className="p-4 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map(zone => (
                            <tr key={zone.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <td className="p-4 font-medium dark:text-gray-200">{zone.name}</td>
                                <td className="p-4 font-bold text-orange-600">{zone.price} FCFA</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(zone.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {zones.length === 0 && (
                            <tr><td colSpan="3" className="p-8 text-center text-gray-500 dark:text-gray-400">Aucune zone configurée.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDeliverySettings;
