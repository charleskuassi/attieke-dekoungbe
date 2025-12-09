import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminReservations = () => {
    const [reservations, setReservations] = useState([]);
    const { token } = useAuth(); // Assuming useAuth exposes token, or getting it from local storage

    const fetchReservations = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reservations`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setReservations(res.data);
        } catch (error) {
            console.error("Fetch reservations error:", error);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/reservations/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            fetchReservations(); // Refresh
        } catch (error) {
            console.error("Update status error:", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Confirmé</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">Annulé</span>;
            default: return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">En attente</span>;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-primary" /> Réservations
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <th className="p-4">Date / Heure</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Couverts</th>
                            <th className="p-4">Message</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reservations.map((res) => (
                            <tr key={res.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{res.date}</div>
                                    <div className="text-sm text-gray-500">{res.time}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">{res.name}</div>
                                    <a href={`tel:${res.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                                        <Phone size={12} /> {res.phone}
                                    </a>
                                </td>
                                <td className="p-4">
                                    <span className="font-bold text-lg">{res.guests}</span> pers.
                                </td>
                                <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                    {res.message || '-'}
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(res.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {res.status !== 'confirmed' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                                className="bg-green-100 p-2 rounded text-green-600 hover:bg-green-200" title="Confirmer">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {res.status !== 'cancelled' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                                                className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200" title="Annuler">
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reservations.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Aucune réservation pour le moment.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReservations;
