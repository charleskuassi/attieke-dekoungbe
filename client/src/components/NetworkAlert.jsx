import React, { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

const NetworkAlert = () => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial check
        const checkNetwork = async () => {
            const status = await Network.getStatus();
            setIsOnline(status.connected);
        };

        checkNetwork();

        // Listen for changes
        const handler = Network.addListener('networkStatusChange', (status) => {
            setIsOnline(status.connected);
        });

        return () => {
            handler.remove && handler.remove();
        };
    }, []);

    const handleRetry = async () => {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
    };

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed inset-x-0 bottom-0 z-[9999] p-4 flex justify-center items-end pointer-events-none"
                >
                    <div className="bg-gray-900/95 dark:bg-black/95 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto border border-white/10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <WifiOff className="text-red-500" size={32} />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">Pas de connexion Internet</h3>
                        <p className="text-gray-300 mb-6 text-sm">
                            Vérifiez votre connexion Wi-Fi ou vos données mobiles pour continuer à commander vos plats préférés.
                        </p>

                        <button 
                            onClick={handleRetry}
                            className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm w-full flex items-center justify-center gap-2 hover:bg-gray-200 transition active:scale-95"
                        >
                            <RefreshCw size={18} />
                            Réessayer
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NetworkAlert;
