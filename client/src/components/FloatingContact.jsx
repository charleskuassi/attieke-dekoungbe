import React from 'react';
import { Phone, Calendar, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FloatingContact = () => {
    const navigate = useNavigate();
    const { count } = useCart();

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 items-end">
            {/* Cart Button (Only if items exist) */}
            {count > 0 && (
                <button
                    onClick={() => navigate('/checkout')}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-xl transition transform hover:scale-110 flex items-center justify-center relative animate-bounce-subtle"
                    title="Voir le panier"
                >
                    <ShoppingBag size={28} />
                    <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-red-600">
                        {count}
                    </span>
                </button>
            )}



            {/* Contact Button */}
            <button
                onClick={() => navigate('/contact')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
                title="Contactez-nous"
            >
                <Phone size={28} />
            </button>
        </div>
    );
};

export default FloatingContact;
