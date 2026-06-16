import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const SuccessPage = () => {
    useEffect(() => {
        // Launch confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center transition-colors duration-300">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full transition-colors"
            >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🎉</span>
                </div>

                <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-white mb-2">Commande Réussie !</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">Merci pour votre confiance. Votre Attièkè arrive bientôt.</p>

                <Link
                    to="/"
                    className="block w-full bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition"
                >
                    Retour à l'accueil
                </Link>
            </motion.div>
        </div>
    );
};

export default SuccessPage;
