import api from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, ShieldCheck, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Testimonials from '../components/Testimonials';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageHelper';

const Home = () => {
    const [stars, setStars] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const res = await api.get('/api/products');
                const plats = res.data.filter(p => p.category && p.category.toLowerCase() === 'plats');
                const shuffled = plats.sort(() => 0.5 - Math.random()).slice(0, 6);
                setStars(shuffled);
            } catch (error) {
                console.error("Error fetching stars:", error);
            }
        };
        fetchStars();
    }, []);

    useEffect(() => {
        if (stars.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stars.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [stars]);

    const getVisibleItems = () => {
        if (stars.length === 0) return [];
        const items = [];
        for (let i = 0; i < 3; i++) {
            items.push(stars[(currentIndex + i) % stars.length]);
        }
        return items;
    };

    return (
        <div className="flex flex-col">
            <SEO 
                title="Le Meilleur de la Gastronomie Ivoirienne" 
                description="Commandez l'authentique Attièkè Dèkoungbé. Poisson braisé, Aloco et saveurs ivoiriennes livrés chauds chez vous. Le fast-food ivoirien de référence."
            />

            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("/images/delivery_packaging.jpg")' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-serif font-extrabold mb-6 leading-[1.1] drop-shadow-2xl"
                    >
                        Attièkè <span className="italic">Dèkoungbé</span> <br /> 
                        <span className="text-4xl md:text-6xl font-light block mt-4">100% Chaud – Chaud</span>
                        <span className="text-3xl md:text-5xl font-light block mt-1 text-primary-light/90 italic">Fait maison</span>
                    </motion.h1>
                    <p className="text-xl md:text-2xl mb-10 font-light text-gray-100 drop-shadow-md max-w-2xl mx-auto">
                        Le premier Fast-Food Ivoirien spécialisé dans l'excellence. Chaud, rapide et livré partout à votre porte.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/menu" className="inline-flex items-center bg-primary hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-full text-xl transition transform hover:scale-105 shadow-2xl">
                            Savourez l'authentique <ArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features / Intro */}
            <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="container mx-auto text-center max-w-5xl">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Notre Promesse</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-text dark:text-white mb-8">Plus qu'un repas, une expérience ivoirienne</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        Chez Attièkè Dèkoungbé, nous sublimons le fast-food ivoirien. Chaque graine d'attiéké, chaque pièce de poisson braisé est sélectionnée avec rigueur pour honorer notre héritage culinaire.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-primary mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Service Express</h3>
                            <p className="text-gray-500">Votre commande prête et expédiée dans les records.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Fraîcheur Garantie</h3>
                            <p className="text-gray-500">Produits locaux sélectionnés chaque matin au marché.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Livraison Partout</h3>
                            <p className="text-gray-500">Nous livrons dans toute la zone avec soin et rapidité.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Preview (Dynamic Carousel) */}
            <section className="py-20 px-4 bg-orange-50 dark:bg-gray-800/50 overflow-hidden transition-colors duration-300">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-text dark:text-white mb-2">Nos Best-Sellers</h2>
                            <p className="text-gray-500 dark:text-gray-400">Les plats favoris de la communauté Dèkoungbé</p>
                        </div>
                        <Link to="/menu" className="group flex items-center gap-2 bg-white dark:bg-gray-700 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition text-primary font-bold">
                            Voir la carte complète <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                        </Link>
                    </div>

                    {stars.length > 0 ? (
                        <div className="relative min-h-[450px]">
                            <AnimatePresence mode='popLayout'>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 absolute w-full">
                                    {getVisibleItems().map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${currentIndex}-${index}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.5 }}
                                            className={`bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-xl group hover:shadow-2xl transition-all duration-300 ${index > 0 ? 'hidden md:block' : ''}`}
                                        >
                                            <div 
                                                className="h-64 overflow-hidden relative cursor-zoom-in"
                                                onClick={() => setSelectedProduct(item)}
                                            >
                                                <img
                                                    src={getImageUrl(item.image_url)}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                </div>
                                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-primary">
                                                    {item.price} FCFA
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <h3 className="text-2xl font-bold mb-3 font-serif truncate dark:text-white">{item.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 h-12">{item.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <Link to="/menu" className="w-full text-center bg-secondary hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition">
                                                        Je craque !
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-32">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                            <p className="mt-4 text-gray-500">Mise en place de nos spécialités...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <div id="testimonials" className="scroll-mt-28">
                <Testimonials />
            </div>

            {/* Service Livraison Section */}
            <section className="py-24 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 text-left space-y-8">
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary dark:text-orange-500 leading-tight">
                                L'Attièkè Chaud <br /> <span className="text-gray-900 dark:text-white">Livré chez vous.</span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                                Plus besoin de sortir pour déguster le meilleur du terroir. Nos livreurs motorisés traversent la ville pour vous apporter une box encore fumante.
                            </p>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-lg">
                                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Livraison Express</span>
                                </div>
                                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Emballage Isotherme</span>
                                </div>
                            </div>
                            <Link to="/menu" className="inline-flex items-center gap-3 bg-primary hover:bg-orange-700 text-white font-extrabold py-5 px-10 rounded-2xl shadow-xl transition transform hover:-translate-y-2 text-lg">
                                Je commande mon festin <ArrowRight />
                            </Link>
                        </div>
                        <div className="order-1 md:order-2 relative group">
                            <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl group-hover:bg-primary/20 transition duration-1000"></div>
                            <img
                                src="/images/delivery_packaging.jpg"
                                alt="Livraison Repas Ivoirien Attièkè Dèkoungbé"
                                loading="lazy"
                                className="relative z-10 w-full h-[500px] rounded-[2.5rem] shadow-2xl object-cover transform rotate-1 group-hover:rotate-0 transition duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Zoom Modal (Shared with ProductCard logic) */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative z-10 max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={getImageUrl(selectedProduct.image_url)}
                                    alt={selectedProduct.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="p-6 md:p-8 text-left">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl md:text-3xl font-serif font-bold dark:text-white">{selectedProduct.name}</h2>
                                    <span className="text-2xl font-bold text-primary">{selectedProduct.price} FCFA</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                                    {selectedProduct.description}
                                </p>
                                <Link
                                    to="/menu"
                                    onClick={() => setSelectedProduct(null)}
                                    className="inline-block w-full text-center bg-primary hover:bg-orange-700 text-white font-bold py-4 rounded-xl text-xl transition"
                                >
                                    Commander ce délice
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;

