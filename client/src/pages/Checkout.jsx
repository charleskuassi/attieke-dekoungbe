import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useKKiaPay } from 'kkiapay-react';
import { Loader2, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react';

const Checkout = () => {
    // 1. Récupération des fonctions du panier
    const {
        cart,
        clearCart,
        discount,
        total,
        totalWithDiscount,
        addToCart,
        decreaseQuantity,
        removeFromCart
    } = useCart();

    const { user } = useAuth();
    const navigate = useNavigate();

    // 2. Hook KKiaPay
    const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

    // 3. États locaux
    const [loading, setLoading] = useState(false);
    const [zones, setZones] = useState([]);
    const [deliveryInfo, setDeliveryInfo] = useState({
        address: user?.address || '',
        phone: user?.phone || '',
        name: user?.name || '',
        zoneName: '',
        zonePrice: 0
    });

    useEffect(() => {
        api.get('/api/zones')
            .then(res => setZones(res.data.filter(z => z.isActive)))
            .catch(err => console.error("Erreur chargement zones", err));
    }, []);

    const finalTotal = totalWithDiscount || total;
    // Utilise les variables d'environnement pour la production
    const KKIAPAY_PUBLIC_KEY = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY;
    const IS_SANDBOX = import.meta.env.VITE_KKIAPAY_SANDBOX === 'true';
    
    if (!KKIAPAY_PUBLIC_KEY) console.warn("⚠️ VITE_KKIAPAY_PUBLIC_KEY non définie dans .env");

    // --- LOGIQUE DE RÉFÉRENCE (POUR ÉVITER LE BUG DE DONNÉES VIDES) ---
    const cartRef = useRef(cart);
    const deliveryInfoRef = useRef(deliveryInfo);
    const totalRef = useRef(finalTotal);
    const discountRef = useRef(discount);

    // On met à jour les références à chaque changement
    useEffect(() => {
        cartRef.current = cart;
        deliveryInfoRef.current = deliveryInfo;
        totalRef.current = finalTotal;
        discountRef.current = discount;
    }, [cart, deliveryInfo, finalTotal, discount]);

    // 4. Fonction de succès (déclenchée par KKiaPay)
    const handleSuccess = async (transactionId) => {
        setLoading(true);
        console.log("✅ PAIEMENT RÉUSSI. Transaction:", transactionId);

        try {
            // Lecture depuis les REFS (garantit les données à jour)
            const currentCart = cartRef.current;
            const currentDeliveryInfo = deliveryInfoRef.current;
            const currentTotal = totalRef.current;
            const currentDiscount = discountRef.current;

            // SÉCURITÉ : Vérifier si le panier est vide
            if (!currentCart || currentCart.length === 0) {
                console.warn("⚠️ Tentative d'envoi de commande avec panier vide ! (Annulé)");
                setLoading(false);
                return;
            }

            // Construction objet commande
            const orderData = {
                items: currentCart,
                total: currentTotal,
                discount: currentDiscount,
                deliveryInfo: currentDeliveryInfo,
                paymentMethod: 'KKiaPay',
                transactionId: transactionId,
                status: 'paid'
            };

            console.log("📤 DONNÉES ENVOYÉES AU SERVER:", JSON.stringify(orderData, null, 2));

            // Envoi au Backend
            await api.post('/api/orders', orderData);

            console.log("💾 COMMANDE ENREGISTRÉE !");
            clearCart();
            navigate('/success');

        } catch (error) {
            console.error("❌ ERREUR BACKEND:", error);
            console.error("❌ ERREUR BACKEND:", error);
            const msg = error.response?.data?.message || error.message;
            const details = error.response?.data?.details ? JSON.stringify(error.response.data.details) : '';
            alert(`Paiement réussi mais erreur d'enregistrement : ${msg} ${details}`);
        } finally {
            setLoading(false);
        }
    };

    // 5. Gestionnaire d'événements KKiaPay
    useEffect(() => {
        const onSuccess = (response) => {
            handleSuccess(response.transactionId);
        };
        addKkiapayListener('success', onSuccess);
        return () => removeKkiapayListener('success', onSuccess);
    }, [addKkiapayListener, removeKkiapayListener]);

    const openPayment = () => {
        if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
            alert("Veuillez remplir tous les champs !");
            return;
        }

        if (zones.length > 0 && !deliveryInfo.zoneName) {
            alert("Veuillez sélectionner votre zone de livraison.");
            return;
        }

        // VALIDATION TÉLÉPHONE (Strictement 10 chiffres)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(deliveryInfo.phone)) {
            alert("Le numéro de téléphone doit comporter exactement 10 chiffres.");
            return;
        }

        openKkiapayWidget({
            amount: finalTotal,
            key: KKIAPAY_PUBLIC_KEY,
            sandbox: IS_SANDBOX,
            email: user?.email || "client@dekoungbe.com",
            phone: deliveryInfo.phone,
            name: deliveryInfo.name,
            reason: "Commande Attièkè Dèkoungbé"
        });
    };

    // 7. Rendu si panier vide
    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 text-center dark:bg-gray-900 transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Votre panier est vide</h2>
                <button onClick={() => navigate('/menu')} className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition">Retour au menu</button>
            </div>
        );
    }

    // 8. Rendu Principal
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-orange-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* COLONNE GAUCHE : Formulaire */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-500 font-display text-center md:text-left">Finaliser la commande</h1>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Informations de livraison</h2>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nom complet</label>
                            <input type="text" value={deliveryInfo.name} onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Votre nom" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Téléphone</label>
                            <input type="tel" value={deliveryInfo.phone} onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Votre numéro" />
                        </div>

                        {/* Sélecteur de Zone */}
                        {zones.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Zone de Livraison <span className="text-red-500">*</span></label>
                                <select
                                    value={deliveryInfo.zoneName}
                                    onChange={(e) => {
                                        const selectedZone = zones.find(z => z.name === e.target.value);
                                        setDeliveryInfo({
                                            ...deliveryInfo,
                                            zoneName: e.target.value,
                                            zonePrice: selectedZone ? selectedZone.price : 0
                                        });
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">-- Choisir une zone --</option>
                                    {zones.map(zone => (
                                        <option key={zone.id} value={zone.name}>
                                            {zone.name} (+{zone.price} F)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Précision Adresse <span className="text-red-500">*</span></label>
                            <textarea
                                value={deliveryInfo.address}
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows="3"
                                placeholder="Indication précise (ex: Maison blanche face pharmacie X)"
                            />
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : Résumé Interactif */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2 dark:text-white">Résumé du Panier</h2>

                        {/* Liste des articles avec boutons */}
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                            {cart.map((item) => (
                                <div key={item.id} className="flex flex-col border-b dark:border-gray-700 pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                                        <span className="font-bold text-orange-600 dark:text-orange-400">{(item.price * item.quantity).toLocaleString()} F</span>
                                    </div>

                                    {/* Contrôles Quantité */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                            <button
                                                onClick={() => decreaseQuantity(item.id)}
                                                className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition text-gray-600 dark:text-gray-300"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition text-green-600 dark:text-green-400"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totaux */}
                        <div className="space-y-3 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800">
                            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Sous-total</span>
                                <span>{total.toLocaleString()} FCFA</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                    <span>Remise ({discount}%)</span>
                                    <span>- {(total - finalTotal).toLocaleString()} FCFA</span>
                                </div>
                            )}

                            <div className="border-t border-orange-200 dark:border-orange-700 pt-3 flex justify-between font-bold text-xl text-orange-800 dark:text-orange-400">
                                <span>Total en ligne</span>
                                <span>{finalTotal.toLocaleString()} FCFA</span>
                            </div>

                            {/* Info Livraison */}
                            {deliveryInfo.zonePrice > 0 && (
                                <div className="mt-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded flex justify-between items-center border border-blue-100 dark:border-blue-800">
                                    <span>📦 Livraison (Au livreur) :</span>
                                    <span className="font-bold">+{deliveryInfo.zonePrice} FCFA</span>
                                </div>
                            )}
                        </div>

                        {/* Bouton Paiement */}
                        <div className="mt-6">
    

                            {(!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address || (zones.length > 0 && !deliveryInfo.zoneName)) ? (
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg flex items-center gap-2 text-sm border border-yellow-200 dark:border-yellow-800">
                                    <AlertCircle size={16} />
                                    <p>Remplissez la zone et l'adresse pour commander.</p>
                                </div>
                            ) : (
                                <button
                                    onClick={openPayment}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:scale-[1.02] disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" />}
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-lg">Payer {finalTotal.toLocaleString()} FCFA</span>
                                        {deliveryInfo.zonePrice > 0 && (
                                            <span className="text-xs font-normal opacity-90">+ {deliveryInfo.zonePrice} F Livraison (Cash)</span>
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;