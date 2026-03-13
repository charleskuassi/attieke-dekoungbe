import React, { useState } from 'react';
import { Code, X, Mail, MessageSquare, Linkedin, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeveloperCredit = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const developers = [
        {
            id: 1,
            name: "Mr TCHOGBE Légérol", 
            role: "Chef de Projet & Stratège",
            description: "Expert en coordination et pilotage de projets digitaux complexes. Garant de la vision produit.",
            email: "legerolt@gmail.com",
            phone: "+22957004681",
            color: "from-blue-500 to-indigo-600"
        },
        {
            id: 2,
            name: "Mr LOKOSSOU Mahougnon Marcellin",
            role: "Fullstack Lead Developer",
            description: "Spécialiste en architecture logicielle et technologies web modernes (React, Node.js, Firebase).",
            email: "lokossoumahougnon281@gmail.com",
            phone: "+22958952058",
            color: "from-orange-500 to-red-600"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 15 } }
    };

    return (
        <>
            <div className="w-full bg-[#ea580c] dark:bg-gray-900 py-6 px-4 text-center relative z-40 transition-colors duration-300">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2">
                    <p className="text-white/90 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Attièkè Dèkoungbé. Le goût authentique de chez nous.
                    </p>
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-2 text-white/70 hover:text-white transition-all text-sm font-semibold border-b border-transparent hover:border-white/30 ml-2 py-1"
                    >
                        <Code size={14} className="group-hover:rotate-12 transition-transform" />
                        Crédits Techniques
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            className="bg-[#111827] w-full max-w-4xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Éléments de décoration */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-orange-500 to-red-600" />
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-8 right-8 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all z-10"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8 md:p-12 text-center">
                                <motion.div 
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="mb-12"
                                >
                                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4 tracking-tight">
                                        Artisans du Digital
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 text-orange-500">
                                        <Shield size={18} />
                                        <span className="uppercase text-xs font-bold tracking-[0.3em]">Développement & Stratégie</span>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid md:grid-cols-2 gap-8 items-stretch"
                                >
                                    {developers.map((dev) => (
                                        <motion.div 
                                            key={dev.id}
                                            variants={itemVariants}
                                            whileHover={{ y: -10 }}
                                            className="group relative bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-[2rem] p-8 transition-all hover:bg-white/[0.07]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                                            
                                            <div className="relative z-10 text-center">
                                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br p-[1px] from-white/20 to-transparent">
                                                    <div className="w-full h-full rounded-2xl bg-gray-900/50 flex items-center justify-center text-white/40 border border-white/5">
                                                        {dev.id === 1 ? <Globe size={32} className="text-blue-400" /> : <Code size={32} className="text-orange-400" />}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">
                                                    {dev.name}
                                                </h3>
                                                <div className="text-orange-500/80 text-xs font-black uppercase tracking-widest mb-4">
                                                    {dev.role}
                                                </div>
                                                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                                    {dev.description}
                                                </p>

                                                <div className="flex flex-col gap-3">
                                                    <a 
                                                        href={`https://wa.me/${dev.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-3 bg-white/5 hover:bg-green-600 border border-white/10 hover:border-green-500 py-3 rounded-xl transition-all font-bold text-sm text-white"
                                                    >
                                                        <MessageSquare size={16} />
                                                        WhatsApp
                                                    </a>
                                                    <a 
                                                        href={`mailto:${dev.email}`}
                                                        className="flex items-center justify-center gap-3 bg-white/5 hover:bg-orange-600 border border-white/10 hover:border-orange-500 py-3 rounded-xl transition-all font-bold text-sm text-white"
                                                    >
                                                        <Mail size={16} />
                                                        Envoyer un Email
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <div className="mt-12 text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] opacity-50">
                                    Conception & Réalisation . {new Date().getFullYear()} . Bénin
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DeveloperCredit;
