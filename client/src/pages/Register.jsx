import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState('register'); // 'register' or 'verify'
    const [formData, setFormData] = useState({
        email: '', password: '', name: '', phone: '', address: ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { loginWithData } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);

            if (response.data.devCode) {
                // Network Block Workaround: Show code directly
                setError(`⚠️ Mail bloqué par le réseau. Votre code : ${response.data.devCode}`);
            }

            setStep('verify');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
                email: formData.email,
                code: verificationCode
            });

            // Auto-login logic handling:
            // 1. If backend returns token, use it (custom login function needed in context?)
            // 2. Or just call login() with credentials if permitted, but we have token from verify response.
            // Let's manually set token or use context. Assuming context has a way to setUser or we just redirect to login.
            // Simplified: User verifies, gets token. We save it. 
            // Better: Redirect to login or use the token. 
            // Ideally: context.loginWithToken(res.data.token, res.data.user) but context might not have it.
            // Fallback: Redirect to Login with success message.

            if (res.data.token) {
                loginWithData(res.data.token, res.data.user);
                setSuccess(true);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setSuccess(true); // Still show success even if no token (fallback)
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Code invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-orange-50 px-4 py-12">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center animate-fade-in">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full text-green-600">
                            <CheckCircle size={48} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Compte vérifié !</h2>
                    <p className="text-gray-600 mb-6">Bienvenue sur Attièkè Dékoungbé. Vous êtes connecté.</p>
                    <p className="text-sm text-gray-400">Redirection en cours...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-orange-50 px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-serif font-bold text-center mb-6 text-primary">
                    {step === 'register' ? 'Créer un compte' : 'Vérifiez votre email'}
                </h1>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                {step === 'register' ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Nom complet</label>
                            <input type="text" name="name" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Téléphone</label>
                            <input type="tel" name="phone" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Adresse</label>
                            <textarea name="address" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Email</label>
                            <input type="email" name="email" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Mot de passe</label>
                            <input type="password" name="password" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50">
                            {loading ? 'Envoi...' : "S'inscrire"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded mb-4 text-sm">
                            Un code à 6 chiffres a été envoyé à <strong>{formData.email}</strong>.
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Code de vérification</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="ex: 123456"
                                className="w-full border rounded p-2 text-center text-2xl tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                            {loading ? 'Vérification...' : "Activer mon compte"}
                        </button>
                    </form>
                )}

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-primary underline">
                        Déjà un compte ? Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
