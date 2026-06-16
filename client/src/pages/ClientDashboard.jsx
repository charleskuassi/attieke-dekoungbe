import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Truck, Phone } from 'lucide-react';

const ClientDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRes = await api.get('/api/orders/my-orders');
                setOrders(ordersRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    if (loading) return <div className="p-8 text-center dark:text-white">Chargement...</div>;

    const isProfileComplete = user?.phone && user?.address;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold mb-8">Bonjour, {user?.name}</h1>

            {!isProfileComplete && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 mb-8 flex justify-between items-center rounded-r shadow-sm">
                    <div>
                        <p className="font-bold text-orange-700 dark:text-orange-400">Votre profil est incomplet !</p>
                        <p className="text-sm text-orange-600 dark:text-orange-300">Veuillez ajouter votre adresse et numéro de téléphone pour faciliter la livraison.</p>
                    </div>
                    <Link to="/settings" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition text-sm">
                        Compléter mon profil
                    </Link>
                </div>
            )}

            <h2 className="text-2xl font-serif font-bold mb-6">Mes Commandes</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow transition-colors">
                    <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore passé de commande.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors">
                            <div className="flex justify-between items-start border-b dark:border-gray-700 pb-4 mb-4">
                                <div>
                                    <div className="font-bold text-lg dark:text-white">Commande #{order.id}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
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
                                    <div key={product.id} className="flex justify-between text-sm dark:text-gray-300">
                                        <span>{product.OrderItem.quantity}x {product.name}</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{product.OrderItem.price_at_order * product.OrderItem.quantity} FCFA</span>
                                    </div>
                                ))}
                            </div>

                            {/* Driver Assignment Info */}
                            {(order.DeliveryDriver && ['preparing', 'shipping', 'completed', 'paid'].includes(order.status)) && (
                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between animate-pulse-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-full">
                                            <Truck className="text-blue-600 dark:text-blue-400" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-900 dark:text-blue-200">
                                                {order.status === 'completed' ? 'Livré par' :
                                                    order.status === 'shipping' ? 'En cours de livraison !' :
                                                        'Livreur assigné'}
                                            </p>
                                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                                {order.status === 'completed' ? `Commande livrée par ${order.DeliveryDriver.name}` :
                                                    `Votre livreur ${order.DeliveryDriver.name} est en charge.`}
                                            </p>
                                        </div>
                                    </div>
                                    <a href={`tel:${order.DeliveryDriver.phone}`} className="flex items-center gap-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                        <Phone size={18} /> Call
                                    </a>
                                </div>
                            )}

                            {/* Information Frais de Livraison */}
                            {order.delivery_cost > 0 && (
                                <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-700 text-sm flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>📦 Livraison ({order.delivery_zone})</span>
                                    <span className="font-bold text-orange-600">+ {order.delivery_cost} FCFA (Au livreur)</span>
                                </div>
                            )}

                            <div className="mt-2 pt-2 border-t dark:border-gray-700 flex justify-between items-center font-bold text-lg dark:text-white">
                                <span>Total (Payé en ligne)</span>
                                <span className="text-primary">{order.total_price} FCFA</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
