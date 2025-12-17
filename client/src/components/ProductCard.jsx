import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 flex flex-col h-full ring-1 ring-gray-100 dark:ring-gray-700">
            <div className="h-48 overflow-hidden relative">
                <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                />
                {product.is_popular && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        Populaire
                    </span>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold font-serif text-gray-800 dark:text-gray-100 leading-tight">{product.name}</h3>
                    <span className="text-lg font-bold text-primary dark:text-primary-light whitespace-nowrap ml-2">{product.price} FCFA</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-2">{product.description}</p>
                <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-secondary hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition active:scale-95"
                >
                    <Plus size={18} className="mr-2" /> Ajouter
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
