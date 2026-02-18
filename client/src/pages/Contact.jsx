import React, { useState } from 'react';
import api from '../utils/api';
import { Phone, MapPin, Mail, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="flex flex-col min-h-screen bg-orange-50">
            {/* Header Section */}
            <div className="bg-white py-12 px-4 shadow-sm text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
                    ATTIÈKÈ DÈKOUNGBÉ
                </h1>
                <h2 className="text-xl text-gray-700 font-medium mb-4">Contactez-nous</h2>
                <p className="text-gray-500 max-w-lg mx-auto italic">
                    "Une question ? Une envie ? Nous sommes là pour vous répondre et vous accueillir."
                </p>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Left Section: Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 p-3 rounded-full text-primary">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Adresse</h3>
                                <p className="text-gray-600">Rue de la pharmacie Dekoungbé,<br />Godomey, Abomey Calavi, Bénin.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 p-3 rounded-full text-primary">
                                <Phone size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Téléphone</h3>
                                <p className="text-gray-600">
                                    <a href="tel:+22991042162" className="hover:text-primary transition">
                                        +229 91 04 21 62
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 p-3 rounded-full text-primary">
                                <Mail size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Email</h3>
                                <p className="text-gray-600">
                                    <a href="mailto:infos@attieke-dekoungbe.com" className="hover:text-primary transition">
                                        infos@attieke-dekoungbe.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-serif font-bold mb-6 text-gray-800">Envoyez-nous un message</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Votre nom" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="votre@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                                <textarea rows="4" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                                <Send size={20} /> Envoyer le message
                            </button>
                        </form>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12 bg-white p-2 rounded-2xl shadow-lg overflow-hidden h-96">
                    <iframe
                        title="Localisation Attièkè Dékoungbé"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        // Using Embed API with specific coordinates query
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=6.379367,2.3305733`}
                    // Fallback to standard embed if no API key (using query for location)
                    // Note: To be safe without an API key for now, I'll use the standard /maps/embed iframe format which is free/simpler for basics
                    ></iframe>
                    {/* Switching to standard IFRAME for robustness without requiring User API Key immediately if not set */}
                </div>
            </div>

            {/* Hardcoded robust iframe solution below just in case */}
        </div>
    );
};

// Robust Map Component replacement for production
const ContactMap = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.post('/api/messages', formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Failed to send message", error);
            setStatus('error');
            alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-orange-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 py-12 px-4 shadow-sm text-center transition-colors">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
                    ATTIÈKÈ DÈKOUNGBÉ
                </h1>
                <h2 className="text-xl text-gray-700 dark:text-gray-300 font-medium mb-4">Contactez-nous</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto italic">
                    "Une question ? Une envie ? Nous sommes là pour vous répondre et vous accueillir."
                </p>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Left Section: Info */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-8 h-full transition-colors">
                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-primary">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Adresse</h3>
                                <p className="text-gray-600 dark:text-gray-300">Rue de la pharmacie Dekoungbé,<br />Godomey, Abomey Calavi, Bénin.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-primary">
                                <Phone size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Téléphone</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    <a href="tel:+22991042162" className="hover:text-primary transition">
                                        +229 91 04 21 62
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-primary">
                                <Mail size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Email</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    <a href="mailto:infos@attieke-dekoungbe.com" className="hover:text-primary transition">
                                        infos@attieke-dekoungbe.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Form */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors">
                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center text-center h-full py-8 space-y-6 animate-fade-in">
                                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-green-600 dark:text-green-400">
                                    <Send size={48} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-gray-800 dark:text-white mb-2">Message Envoyé !</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Merci de nous avoir contactés. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="text-primary font-bold hover:underline"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-serif font-bold mb-6 text-gray-800 dark:text-white">Envoyez-nous un message</h3>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nom Complet</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Votre nom"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="votre@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Comment pouvons-nous vous aider ?"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Send size={20} /> {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* Bar Image Section */}
                <div className="mt-12 rounded-2xl overflow-hidden shadow-xl relative group">
                    <img
                        src="/images/restaurant_bar.jpg"
                        alt="Bar Restaurant Attièkè Dèkoungbé"
                        className="w-full h-64 md:h-80 object-cover transform group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <div className="text-white">
                            <h3 className="text-2xl font-serif font-bold mb-1">Notre Bar</h3>
                            <p className="opacity-90 font-medium">Venez vivre l'expérience Attièkè Dèkoungbé sur place !</p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg overflow-hidden h-96 relative transition-colors">
                    <iframe
                        src="https://maps.google.com/maps?q=6.379367,2.3305733&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade">
                    </iframe>
                    <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded text-xs text-gray-500">
                        Lat: 6.379367, Long: 2.3305733
                    </div>
                </div>
            </div>
        </div>
    );

};

export default ContactMap;
