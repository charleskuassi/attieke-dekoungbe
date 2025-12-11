import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
    const [textIndex, setTextIndex] = useState(0);
    const texts = [
        "Préparation des saveurs...",
        "Cuisson à la vapeur...",
        "Dressage de l'assiette..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % texts.length);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-orange-50 dark:bg-gray-900 overflow-hidden"
            exit={{ y: "-100%", transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            {/* Central Icon Animation */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: 1,
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="mb-8 p-6 bg-white rounded-full shadow-xl relative"
            >
                <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600&auto=format&fit=crop"
                    alt="Restaurant Ambiance"
                    className="w-48 h-48 object-cover rounded-full shadow-2xl border-4 border-white dark:border-gray-700"
                />
                <motion.div
                    className="absolute -inset-4 rounded-full border border-orange-200/50 dark:border-orange-500/20"
                    animate={{ scale: [1, 1.15], opacity: [0.8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-serif font-bold text-orange-800 dark:text-orange-500 mb-4 tracking-wider">
                Attièkè Dèkoungbé
            </h1>

            {/* Changing Text */}
            <div className="h-8">
                <motion.p
                    key={textIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-orange-600 dark:text-orange-400 font-medium text-lg"
                >
                    {texts[textIndex]}
                </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-100 dark:bg-gray-800">
                <motion.div
                    className="h-full bg-orange-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "easeInOut" }}
                />
            </div>
        </motion.div>
    );
};

export default SplashScreen;
