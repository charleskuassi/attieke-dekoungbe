import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Loader2, Search, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


const Menu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
                setProducts(response.data);
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

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(p => {
        const matchesCategory = category === 'All' || p.category === category;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-screen">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-gray-500 animate-pulse">On coupe les oignons...</p>
        </div>
    );

    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-serif font-bold text-center mb-8 text-primary">Notre Carte</h1>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher un plat (ex: Garba, Poulet...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
            </div>

            {/* Category Filter */}
            <div className="flex justify-center space-x-4 mb-10 overflow-x-auto py-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap ${category === cat
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                            }`}
                    >
                        {cat === 'All' ? 'Tout' : cat}
                    </button>
                ))}
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
                <div className="text-center text-gray-500 mt-10">
                    <p>Aucun plat ne correspond à votre recherche 😔</p>
                </div>
            )}


        </div>
    );
};

export default Menu;
