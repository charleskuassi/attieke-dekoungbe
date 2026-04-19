import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Utensils, CreditCard, ChevronRight, CheckCircle, X, Menu as MenuIcon } from 'lucide-react';

const steps = [
    {
        title: "Bienvenue chez Attièkè Dékoungbé !",
        description: "Nous sommes ravis de vous accueillir. Voici comment commander vos plats préférés en quelques secondes.",
        icon: <Utensils className="w-12 h-12 text-orange-600" />,
        color: "bg-orange-100"
    },
    {
        title: "1. Accédez au Menu",
        description: "Sur mobile, cliquez sur les ☰ (3 barres) en haut à droite, puis sur 'Notre Menu'. Sur ordinateur, cliquez directement sur le bouton 'Notre Menu' en haut.",
        icon: <MenuIcon className="w-12 h-12 text-blue-600" />,
        color: "bg-blue-100"
    },
    {
        title: "2. Vérifiez votre panier",
        description: "Cliquez sur l'icône du sac en haut à droite pour voir votre sélection et ajuster les garnitures.",
        icon: <ShoppingBag className="w-12 h-12 text-purple-600" />,
        color: "bg-purple-100"
    },
    {
        title: "3. Payez et c'est prêt !",
        description: "Validez votre commande et payez directement en ligne. Votre repas sera préparé et livré chez vous en priorité !",
        icon: <CreditCard className="w-12 h-12 text-green-600" />,
        color: "bg-green-100"
    }
];

const WelcomeGuide = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="flex h-1.5 w-full bg-gray-100 dark:bg-gray-700">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`h-full transition-all duration-500 ${idx <= currentStep ? 'bg-orange-500 w-full' : 'w-0'}`}
                            />
                        ))}
                    </div>

                    <div className="p-8">
                        <div className="flex justify-end mb-2">
                             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                             </button>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <motion.div
                                key={currentStep}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`${steps[currentStep].color} p-6 rounded-full mb-6`}
                            >
                                {steps[currentStep].icon}
                            </motion.div>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 font-serif leading-tight">
                                {steps[currentStep].title}
                            </h2>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                {steps[currentStep].description}
                            </p>

                            <button
                                onClick={nextStep}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                {currentStep === steps.length - 1 ? (
                                    <>C'est parti ! <CheckCircle size={20} /></>
                                ) : (
                                    <>Suivant <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>

                            <button 
                                onClick={onClose}
                                className="mt-4 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                Passer le guide
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WelcomeGuide;
