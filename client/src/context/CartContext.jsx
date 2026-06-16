import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Global Promo State
    const [promoSettings, setPromoSettings] = useState({
        isActive: false,
        minAmount: 15000,
        discountPercentage: 5
    });
    const [discount, setDiscount] = useState(0);

    // Fetch Promo Settings on Mount
    useEffect(() => {
        const fetchPromo = async () => {
            try {
                const { data } = await api.get('/api/promo');
                setPromoSettings(data);
            } catch (error) {
                console.error("Failed to fetch promo settings", error);
            }
        };
        fetchPromo();
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 🛡️ Auto-Apply Promotion Logic
    useEffect(() => {
        if (promoSettings.isActive && total >= promoSettings.minAmount) {
            setDiscount(promoSettings.discountPercentage / 100);
        } else {
            setDiscount(0);
        }
    }, [total, promoSettings]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const decreaseQuantity = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            if (existingItem?.quantity === 1) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            );
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        // Discount will auto-reset via useEffect since total becomes 0
    };

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalWithDiscount = Math.round(total - (total * discount));

    // Function to refresh promo settings (called by Admin)
    const refreshPromo = async () => {
        try {
            const { data } = await api.get('/api/promo');
            setPromoSettings(data);
        } catch (error) {
            console.error("Failed to refresh promo settings", error);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            decreaseQuantity,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            count,
            discount,
            totalWithDiscount,
            promoSettings,
            refreshPromo
        }}>
            {children}
        </CartContext.Provider>
    );
};
