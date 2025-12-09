import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { count } = useCart();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-orange-100">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-primary">
                    <img src="/images/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
                    <span>Attièkè Dékoungbé</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-text hover:text-primary font-medium transition">Accueil</Link>
                    <Link to="/menu" className="text-text hover:text-primary font-medium transition">Notre Menu</Link>
                    <Link to="/reservation" className="text-text hover:text-primary font-medium transition">Réservation</Link>
                    <Link to="/contact" className="text-text hover:text-primary font-medium transition">Contact</Link>
                    <Link to="/checkout" className="relative p-2 text-primary hover:bg-orange-50 rounded-full transition">
                        <ShoppingBag size={24} />
                        {count > 0 && (
                            <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {count}
                            </span>
                        )}
                    </Link>
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="font-bold text-primary hover:text-orange-700">
                                {user.name}
                            </Link>
                            <Link to="/settings" className="text-text hover:text-primary font-medium transition">
                                Paramètres
                            </Link>
                            <button onClick={logout} className="ml-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Déconnexion">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="font-bold text-gray-700 hover:text-primary">
                            Connexion
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center md:hidden space-x-4">
                    <Link to="/checkout" className="relative p-2 text-primary">
                        <ShoppingBag size={24} />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {count}
                            </span>
                        )}
                    </Link>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text">
                        {isMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-orange-100 py-4 px-4 flex flex-col space-y-4 shadow-lg">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text">Accueil</Link>
                    <Link to="/menu" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text">Notre Menu</Link>
                    <Link to="/reservation" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text">Réservation</Link>
                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text">Contact</Link>
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-primary">
                                Mon Compte ({user.name})
                            </Link>
                            <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text">
                                Paramètres
                            </Link>
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-lg font-medium text-red-500 flex items-center justify-start">
                                <LogOut size={20} className="mr-2" /> Déconnexion
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-text">Connexion</Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
