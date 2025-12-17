import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import ThemeToggle from './ThemeToggle';

const Header = () => {
    const { count } = useCart();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToTestimonials = () => {
        setIsMenuOpen(false);
        if (location.pathname === '/') {
            const element = document.getElementById('testimonials');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById('testimonials');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-orange-100 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-primary">
                    <img src="/images/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                    <span>Attièkè Dèkoungbé</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-8">
                    <Link to="/" className="text-text dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Accueil</Link>
                    <Link to="/menu" className="text-text dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Notre Menu</Link>
                    
                    <button onClick={scrollToTestimonials} className="text-text dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">
                        Témoignages
                    </button>

                    <Link to="/contact" className="text-text dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Contact</Link>
                    {user && user.role !== 'admin' && (
                        <Link to="/reviews" className="text-text dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">Avis Client</Link>
                    )}

                    <ThemeToggle />

                    <Link to="/checkout" className="relative p-2 text-primary hover:bg-orange-50 dark:hover:bg-gray-800 rounded-full transition">
                        <ShoppingBag size={24} />
                        {count > 0 && (
                            <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {count}
                            </span>
                        )}
                    </Link>
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="font-bold text-primary hover:text-orange-700 dark:hover:text-orange-400">
                                {user.name}
                            </Link>
                            <Link to="/settings" className="text-text dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition">
                                Paramètres
                            </Link>
                            <button onClick={logout} className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition" title="Déconnexion">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="font-bold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                            Connexion
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center lg:hidden space-x-4">
                    <Link to="/checkout" className="relative p-2 text-primary">
                        <ShoppingBag size={24} />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {count}
                            </span>
                        )}
                    </Link>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text dark:text-white">
                        {isMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-orange-100 dark:border-gray-800 py-4 px-4 flex flex-col space-y-4 shadow-lg transition-colors duration-300">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Mode Sombre</span>
                        <ThemeToggle />
                    </div>
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text dark:text-gray-200">Accueil</Link>
                    <Link to="/menu" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text dark:text-gray-200">Notre Menu</Link>
                    <button onClick={scrollToTestimonials} className="text-lg font-medium text-text dark:text-gray-200 text-left">
                        Témoignages
                    </button>

                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text dark:text-gray-200">Contact</Link>
                    {user && user.role !== 'admin' && (
                        <Link to="/reviews" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text dark:text-gray-200">Avis Client</Link>
                    )}
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-primary">
                                Mon Compte ({user.name})
                            </Link>
                            <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text dark:text-gray-200">
                                Paramètres
                            </Link>
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-lg font-medium text-red-500 flex items-center justify-start">
                                <LogOut size={20} className="mr-2" /> Déconnexion
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text dark:text-gray-200">Connexion</Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
