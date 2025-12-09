import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Truck, Phone } from 'lucide-react';

const ClientDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const [ordersRes, reservationsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/reservations/my-history`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setOrders(ordersRes.data);
                setReservations(reservationsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    const isProfileComplete = user?.phone && user?.address;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold mb-8">Bonjour, {user?.name}</h1>

            {!isProfileComplete && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 flex justify-between items-center rounded-r shadow-sm">
                    <div>
                        <p className="font-bold text-orange-700">Votre profil est incomplet !</p>
                        <p className="text-sm text-orange-600">Veuillez ajouter votre adresse et numéro de téléphone pour faciliter la livraison.</p>
                    </div>
                    <a href="/settings" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition text-sm">
                        Compléter mon profil
                    </a>
                </div>
            )}

            <h2 className="text-2xl font-serif font-bold mb-6">Mes Commandes</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-500">Vous n'avez pas encore passé de commande.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-start border-b pb-4 mb-4">
                                <div>
                                    <div className="font-bold text-lg">Commande #{order.id}</div>
                                    <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {order.Products.map(product => (
                                    <div key={product.id} className="flex justify-between text-sm">
                                        <span>{product.OrderItem.quantity}x {product.name}</span>
                                        <span className="font-bold">{product.OrderItem.price_at_order * product.OrderItem.quantity} FCFA</span>
                                    </div>
                                ))}
                            </div>

                            {/* Driver Assignment Info */}
                            {(order.DeliveryDriver && ['preparing', 'shipping', 'completed', 'paid'].includes(order.status)) && (
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between animate-pulse-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Truck className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-900">
                                                {order.status === 'completed' ? 'Livré par' :
                                                    order.status === 'shipping' ? 'En cours de livraison !' :
                                                        'Livreur assigné'}
                                            </p>
                                            <p className="text-sm text-blue-800">
                                                {order.status === 'completed' ? `Commande livrée par ${order.DeliveryDriver.name}` :
                                                    `Votre livreur ${order.DeliveryDriver.name} est en charge.`}
                                            </p>
                                        </div>
                                    </div>
                                    <a href={`tel:${order.DeliveryDriver.phone}`} className="flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50">
                                        <Phone size={18} /> Call
                                    </a>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">{order.total_price} FCFA</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <h2 className="text-2xl font-serif font-bold mb-6 mt-12">Mes Réservations</h2>
            {reservations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-500">Aucune réservation à venir.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Heure</th>
                                <th className="p-4 font-semibold">Couverts</th>
                                <th className="p-4 font-semibold">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {reservations.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50">
                                    <td className="p-4">{new Date(res.date).toLocaleDateString()}</td>
                                    <td className="p-4">{res.time}</td>
                                    <td className="p-4">{res.guests} pers.</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {res.status === 'pending' ? 'En attente' : res.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
