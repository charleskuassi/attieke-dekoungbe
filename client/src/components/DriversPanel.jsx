import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Truck, Plus, Trash2, User, Phone } from 'lucide-react';

const DriversPanel = () => {
    const [drivers, setDrivers] = useState([]);
    const [newDriver, setNewDriver] = useState({ name: '', phone: '' });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await api.get('/api/drivers');
            setDrivers(res.data);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/drivers', newDriver);
            setNewDriver({ name: '', phone: '' });
            fetchDrivers();
            alert("Livreur ajouté !");
        } catch (error) {
            console.error("Error adding driver:", error);
            alert("Erreur ajout livreur");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce livreur ?")) return;
        try {
            await api.delete(`/api/drivers/${id}`);
            fetchDrivers();
        } catch (error) {
            console.error("Error deleting driver:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                <Truck className="text-primary" /> Gestion des Livreurs
            </h2>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors">
                <h3 className="font-bold mb-4 dark:text-white">Ajouter un livreur</h3>
                <form onSubmit={handleAdd} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Nom complet"
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newDriver.name}
                            onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Téléphone"
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newDriver.phone}
                            onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-700 transition">
                        <Plus size={20} /> Ajouter
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="p-4">Nom</th>
                            <th className="p-4">Téléphone</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {drivers.map(driver => (
                            <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                                        <User size={16} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="font-bold dark:text-white">{driver.name}</span>
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <Phone size={14} /> {driver.phone}
                                </td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-bold uppercase">
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(driver.id)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {drivers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">Aucun livreur enregistré</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DriversPanel;
