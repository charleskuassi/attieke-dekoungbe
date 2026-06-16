import React, { useState } from 'react';
import { Plus, X, Maximize2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 flex flex-col h-full ring-1 ring-gray-100 dark:ring-gray-700 group">
                <div 
                    className="h-48 overflow-hidden relative cursor-zoom-in"
                    onClick={() => setIsZoomed(true)}
                >
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={`Plat d'Attièkè : ${product.name} - Spécialité Dèkoungbé`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
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

            {/* Zoom Modal */}
            <AnimatePresence>
                {isZoomed && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsZoomed(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative z-10 max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <button
                                onClick={() => setIsZoomed(false)}
                                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={getImageUrl(product.image_url)}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl md:text-3xl font-serif font-bold dark:text-white">{product.name}</h2>
                                    <span className="text-2xl font-bold text-primary">{product.price} FCFA</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                                    {product.description}
                                </p>
                                <button
                                    onClick={() => {
                                        addToCart(product);
                                        setIsZoomed(false);
                                    }}
                                    className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-4 rounded-xl text-xl flex items-center justify-center transition"
                                >
                                    Commander ce délice
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductCard;

