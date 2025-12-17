import React, { useState } from 'react';
import api from '../utils/api';
import { Calendar, Clock, Users, MessageSquare, CheckCircle, Phone, MapPin } from 'lucide-react';

const Reservation = () => {
    const initialState = {
        name: '', phone: '', date: '', time: '', guests: 2, message: ''
    };
    const [formData, setFormData] = useState(initialState);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [timeError, setTimeError] = useState('');

    const validateTime = (val) => {
        if (!val) {
            setTimeError('');
            return true;
        }
        const [hStr, mStr] = val.split(':');
        const h = parseInt(hStr, 10);

        // Open: 18:00 - 23:59 AND 00:00 - 04:00
        const isEvening = h >= 18 && h <= 23;
        const isMorning = h >= 0 && h <= 4;

        if (!isEvening && !isMorning) {
            setTimeError("Le restaurant ouvre de 18h à 04h du matin.");
            return false;
        }
        setTimeError('');
        return true;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (timeError || !validateTime(formData.time)) {
            alert("Veuillez corriger l'heure de réservation.");
            return;
        }

        setStatus('loading');
        try {
            await api.post('/api/reservations', formData);
            setStatus('success');
        } catch (error) {
            console.error("Booking failed:", error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-orange-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in transition-colors">
                    <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-primary dark:text-orange-500 mb-2">Demande en attente !</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Merci {formData.name}, votre demande a été transmise.
                        <br /><br />
                        <strong>Statut actuel : En attente de validation.</strong>
                        <br />
                        Vous recevrez une confirmation par téléphone ou vous pouvez suivre l'état dans votre tableau de bord.
                    </p>
                    <button onClick={() => { setStatus('idle'); setFormData(initialState); }} className="text-primary dark:text-orange-400 font-bold hover:underline">
                        Faire une autre réservation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
            {/* Mobile Banner - Visible only on mobile */}
            <div className="md:hidden w-full h-56 relative">
                <img
                    src="/images/restaurant_interior.jpg"
                    alt="Ambiance Restaurant"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Left Section - Form */}
            <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-10 text-center md:text-left">
                        <span className="text-primary dark:text-orange-400 font-bold tracking-wider text-sm uppercase mb-2 block">Dîner sur place</span>
                        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">Réserver votre table</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Profitez d'un moment gourmand et chaleureux. <br className="hidden md:block" />
                            Remplissez ce formulaire pour garantir votre place.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nom Complet</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="Votre nom"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    placeholder="+229..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Heure</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                                    <input
                                        list="timeOptions"
                                        name="time"
                                        required
                                        value={formData.time}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, time: val });
                                            validateTime(val);
                                        }}
                                        className={`w-full border rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-700 dark:text-white ${timeError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}`}
                                        placeholder="20:00"
                                    />
                                </div>
                                {timeError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{timeError}</p>}
                                <datalist id="timeOptions">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <React.Fragment key={18 + i}>
                                            <option value={`${18 + i}:00`}></option>
                                            <option value={`${18 + i}:30`}></option>
                                        </React.Fragment>
                                    ))}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <React.Fragment key={`m-${i}`}>
                                            <option value={`${i.toString().padStart(2, '0')}:00`}></option>
                                            {i !== 4 && <option value={`${i.toString().padStart(2, '0')}:30`}></option>}
                                        </React.Fragment>
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre de personnes</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    type="number"
                                    name="guests"
                                    min="1"
                                    max="20"
                                    required
                                    value={formData.guests}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Demande spéciale</label>
                            <textarea
                                name="message"
                                rows="3"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="Anniversaire, coin calme..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition shadow-lg transform hover:-translate-y-1 disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Envoi...' : 'Confirmer la demande'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Section - Desktop Image */}
            <div className="hidden md:block w-1/2 relative bg-gray-900">
                <img
                    src="/images/restaurant_interior.jpg"
                    alt="Intérieur Restaurant Attiéké Dèkoungbé"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white max-w-md p-6 glass rounded-xl backdrop-blur-sm bg-white/10 border border-white/20">
                    <p className="font-serif text-2xl italic mb-2">"Une ambiance unique pour des moments inoubliables."</p>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                        <MapPin size={16} /> Godomey, Abomey Calavi
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reservation;
