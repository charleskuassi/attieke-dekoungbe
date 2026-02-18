import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Loader2, Search, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';


const Menu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // FALLBACK si .env mal configuré
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                console.log("Fetching Products from:", apiUrl);

                const response = await axios.get(`${apiUrl}/api/products`);

                if (Array.isArray(response.data)) {
                    console.log(`Loaded ${response.data.length} products`);
                    setProducts(response.data);
                } else {
                    console.error("Format de données invalide reçu (HTML au lieu de JSON ?):", response.data);
                    setError("Erreur de configuration API (Format invalide)");
                    setProducts([]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch products", err);
                // Fallback mock data
                setProducts([
                    { id: 1, name: "Attiéké Poisson", description: "Attiéké frais, poisson capitaine braisé.", price: 3500, image_url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop", category: "Plats", is_popular: true },
                    { id: 2, name: "Poulet Braisé", description: "Poulet fermier mariné et grillé.", price: 4000, image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop", category: "Plats", is_popular: true },
                    { id: 4, name: "Garba", description: "Attiéké, thon frit, piment.", price: 1500, image_url: "https://images.unsplash.com/photo-1606459882370-16886e84a752?q=80&w=800&auto=format&fit=crop", category: "Plats", is_popular: true },
                    { id: 5, name: "Jus de Bissap", description: "Boisson rafraîchissante.", price: 1000, image_url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=800&auto=format&fit=crop", category: "Boissons", is_popular: false },
                ]);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = Array.from(new Set(['All', 'Plats', 'Boissons', 'Jus', 'Yahourt', 'Vins', 'Whiskys', 'Champagnes', ...products.map(p => p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Autre')]));

    const filteredProducts = products.filter(p => {
        const productCategory = p.category ? p.category.toLowerCase() : '';
        const matchesCategory = category === 'All' || productCategory === category.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900 transition-colors duration-300">
            <Loader2 className="animate-spin text-primary dark:text-orange-500 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">On coupe les oignons...</p>
        </div>
    );

    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
            <SEO 
                title="Menu & Livraison : L'Attiéké Authentique" 
                description="Consultez notre menu de fast-food ivoirien. Garba, Poisson braisé, Attiéké fumant et boissons locales. Commandez en ligne pour une livraison rapide."
            />
            <div className="text-center mb-12">
                <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Dôkoungbé Selection</span>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white">Le Menu Dêkoungbé</h1>
                <p className="text-gray-500 mt-4 max-w-xl mx-auto italic">Le goût du pays, là où vous êtes.</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher un plat (ex: Garba, Poulet...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
            </div>

            {/* Category Filter */}
            <div className="sticky top-[88px] z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-4 mb-8 -mx-4 px-4 shadow-sm transition-colors duration-300 flex justify-start md:justify-center overflow-x-auto no-scrollbar">
                <div className="flex space-x-4 min-w-max">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategory(cat);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap ${category === cat
                                ? 'bg-primary dark:bg-orange-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700'
                                }`}
                        >
                            {cat === 'All' ? 'Tout' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filteredProducts.map(product => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </motion.div>

            {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    <p>Aucun plat ne correspond à votre recherche 😔</p>
                </div>
            )}


        </div>
    );
};

export default Menu;
