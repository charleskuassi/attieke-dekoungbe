import api from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Testimonials from '../components/Testimonials';

const Home = () => {
    const [stars, setStars] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const res = await api.get('/api/products');
                // Filter for 'Mats' (case insensitive) to show as stars
                const plats = res.data.filter(p => p.category && p.category.toLowerCase() === 'plats');
                // Shuffle and pick 6 items for variety
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
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, [stars]);

    // Helper to get 3 visible items (panorama effect)
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
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("/images/delivery_packaging.jpg")' }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 text-center text-white px-4 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-lg">
                        100% Chaud - Chaud <br /> <span className="text-primary-light">chez nous</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 font-light text-gray-100 drop-shadow-md">
                        Découvrez les saveurs de la Côte d'Ivoire. Attiéké, Poisson braisé, Aloco... préparés avec passion.
                    </p>
                    <Link to="/menu" className="inline-flex items-center bg-primary hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg">
                        Commander maintenant <ArrowRight className="ml-2" />
                    </Link>
                </div>
            </section>

            {/* Features / Intro */}
            <section className="py-16 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="container mx-auto text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-text dark:text-white mb-6">Une tradition culinaire</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Chez Attièkè Dèkoungbé, nous sélectionnons les meilleurs ingrédients pour vous offrir une expérience gustative inoubliable. Nos plats sont préparés à la commande pour garantir une fraîcheur absolue.
                    </p>
                </div>
            </section>

            {/* Popular Preview (Dynamic Carousel) */}
            <section className="py-16 px-4 bg-orange-50 dark:bg-gray-800 overflow-hidden transition-colors duration-300">
                <div className="container mx-auto">
                    <div className="flex justify-between items-end mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-text dark:text-white">Nos Stars</h2>
                        <Link to="/menu" className="text-primary dark:text-orange-400 font-bold hover:underline hidden md:block">Voir tout le menu</Link>
                    </div>

                    {stars.length > 0 ? (
                        <div className="relative h-[400px]">
                            <AnimatePresence mode='popLayout'>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 absolute w-full">
                                    {getVisibleItems().map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${currentIndex}-${index}`}
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.5 }} // Faster transition
                                            className={`bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition group ${index > 0 ? 'hidden md:block' : ''}`}
                                        >
                                            <div className="h-64 overflow-hidden">
                                                <img
                                                    src={
                                                        !item.image_url
                                                            ? "https://via.placeholder.com/400"
                                                            : item.image_url.startsWith('http') || item.image_url.startsWith('/images/')
                                                                ? item.image_url
                                                                : `${import.meta.env.VITE_API_URL}${item.image_url}`
                                                    }
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold mb-2 font-serif truncate dark:text-white">{item.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{item.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold text-primary dark:text-orange-400">{item.price} FCFA</span>
                                                    <Link to="/menu" className="text-secondary dark:text-green-400 font-bold hover:text-green-700 dark:hover:text-green-300">Commander</Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">Chargement des stars...</div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/menu" className="btn-primary inline-block bg-primary text-white py-3 px-6 rounded-full font-bold">Voir tout le menu</Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <div id="testimonials" className="scroll-mt-28">
                <Testimonials />
            </div>

            {/* Service Livraison Section */}
            <section className="py-16 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 text-left space-y-6">
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary dark:text-orange-500 leading-tight">
                                L'Authenticité livrée <br /> <span className="text-gray-900 dark:text-white">chez vous.</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                Profitez de nos délicieux plats sans bouger de chez vous. Nos emballages soignés et résistants gardent votre Attiéké chaud et savoureux jusqu'à votre porte.
                            </p>
                            <div className="flex items-center gap-4 text-primary dark:text-orange-400 font-bold">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary dark:bg-orange-400"></div> Rapide</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary dark:bg-orange-400"></div> Chaud</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary dark:bg-orange-400"></div> Soigné</span>
                            </div>
                            <Link to="/menu" className="inline-block bg-primary hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1">
                                Commander pour livraison
                            </Link>
                        </div>
                        <div className="order-1 md:order-2 relative">
                            <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/30 rounded-2xl transform rotate-3 scale-95 z-0"></div>
                            <img
                                src="/images/delivery_packaging.jpg"
                                alt="Livraison Attiéké Dékoungbé"
                                className="relative z-10 w-full h-auto rounded-2xl shadow-xl transform -rotate-2 hover:rotate-0 transition duration-500 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
