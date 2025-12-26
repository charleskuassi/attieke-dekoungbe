import React, { useState } from 'react';
import { Code, X, Mail, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeveloperCredit = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Configuration pour DEUX développeurs
    // REMPLACEZ LES INFOS CI-DESSOUS AVEC VOS COORDONNÉES
    const developers = [
        {
            id: 1,
            name: "Mr TCHOGBE Légérol", 
            role: "Chef de Projet",
            description: "Coordination et pilotage du projet.",
            email: "legerolt@gmail.com",
            phone: "+229 57004681 / 01 64 64 77 30"
        },
        {
            id: 2,
            name: "Mr LOKOSSOU Mahougnon Marcellin",
            role: "Lead Développeur",
            description: "Développement technique et architecture.",
            email: "lokossoumahougnon281@gmail.com",
            phone: "+229 58952058"
        }
    ];

    const styles = {
        container: {
            width: '100%',
            backgroundColor: '#ea580c', // Couleur Primary (Orange) pour remplacer le footer
            color: '#FFFFFF',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            fontSize: '1rem',
            cursor: 'default', // Le conteneur n'est pas cliquable partout
            position: 'relative',
            zIndex: 40
        },
        trigger: {
            cursor: 'pointer',
            opacity: 0.8,
            fontSize: '0.85rem',
            marginLeft: '10px',
            textDecoration: 'underline',
            transition: 'opacity 0.2s',
            display: 'inline-flex', 
            alignItems: 'center',
            gap: '4px'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
        },
        modalContent: {
            backgroundColor: '#1F2937', 
            color: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '800px', // Plus large pour 2 profils
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 165, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        closeButton: {
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            zIndex: 10,
            transition: 'background 0.2s'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            padding: '3rem 2rem'
        },
        profileCard: {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.2s',
        },
        avatar: {
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #FFA500 0%, #EA580C 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        button: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
        }
    };

    return (
        <>
            {/* Nouveau Footer Principal */}
            <div style={styles.container}>
                <p style={{ margin: 0, fontWeight: 500 }}>
                    &copy; {new Date().getFullYear()} Attièkè Dékoungbé. 100% Chaud – Chaud
                    {/* Le mot déclencheur */}
                    <span 
                        style={styles.trigger}
                        onClick={() => setIsOpen(true)}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                        title="Voir les crédits"
                    >
                        <Code size={14} /> Crédits
                    </span>
                </p>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalOverlay}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={styles.modalContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                style={styles.closeButton} 
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ textAlign: 'center', padding: '2rem 1rem 0' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#FFA500' }}>L'Équipe Technique</h2>
                                <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>Les artisans derrière la plateforme</p>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>Dèkoungbé, Bénin</p>
                            </div>

                            <div style={styles.grid}>
                                {developers.map((dev) => (
                                    <div key={dev.id} style={styles.profileCard}>
                                        <div style={styles.avatar}>
                                            <User size={32} color="white" />
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem' }}>{dev.name}</h3>
                                        <div style={{ color: '#FFA500', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>{dev.role}</div>
                                        <p style={{ color: '#D1D5DB', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                            {dev.description}
                                        </p>

                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            <a 
                                                href={`mailto:${dev.email}`}
                                                style={{ ...styles.button, backgroundColor: '#374151', color: 'white' }}
                                            >
                                                <Mail size={16} /> Email
                                            </a>
                                            <a 
                                                href={`https://wa.me/${dev.phone.split('/')[0].replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ ...styles.button, backgroundColor: '#25D366', color: 'white' }}
                                            >
                                                <MessageSquare size={16} /> WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DeveloperCredit;
