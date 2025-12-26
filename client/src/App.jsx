import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import ClientDashboard from './pages/ClientDashboard';
import SuccessPage from './pages/SuccessPage';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import Contact from './pages/Contact';
import FloatingContact from './components/FloatingContact';
import DeveloperCredit from './components/DeveloperCredit';
import NetworkAlert from './components/NetworkAlert';

import Reviews from './pages/Reviews';
import { useAuth } from './context/AuthContext';

function App() {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Only show splash screen if we are on the homepage ('/') AND it's the first visit
    const [loading, setLoading] = useState(location.pathname === '/');

    useEffect(() => {
        // Prevent scrolling during splash screen
        if (loading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Timer for splash screen
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [loading]);

    // Deep Link Handler (Google Login)
    useEffect(() => {
        if (window.Capacitor?.isNativePlatform()) {
            import('@capacitor/app').then(({ App: CapApp }) => {
                CapApp.addListener('appUrlOpen', data => {
                    console.log('App opened with URL:', data.url);
                    // URL format: attiekeapp://google-callback?token=...
                    if (data.url.includes('google-callback')) {
                        const url = new URL(data.url);
                        const token = url.searchParams.get('token');
                        if (token) {
                            // Redirect internally
                            window.location.hash = `/google-callback?token=${token}`;
                        }
                    }
                });
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-background dark:bg-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
            <AnimatePresence mode="wait">
                {loading && <SplashScreen key="splash" />}
            </AnimatePresence>

            {!loading && (
                <>
                    <AnnouncementBar />
                    <Header />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/success" element={<SuccessPage />} />

                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/google-callback" element={<GoogleCallback />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <ClientDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <Admin />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <DeveloperCredit />
                    <FloatingContact />
                    <NetworkAlert />
                </>
            )}
        </div>
    );
}

export default App;
