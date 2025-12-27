import React from 'react';
import { Browser } from '@capacitor/browser';

const GoogleButton = ({ text = "Continuer avec Google" }) => {
    const handleGoogleLogin = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const isNative = window.Capacitor?.isNativePlatform();

        try {
            if (isNative) {
                // Mobile: Force Absolute URL with state=mobile
                // Use Capacitor Browser for secure session handling
                const targetUrl = `${apiUrl}/api/auth/google?state=mobile`;
                console.log("Mobile Login Initiated:", targetUrl);
                await Browser.open({ url: targetUrl });
            } else {
                // Web: Smart Handling
                // In Dev (Localhost), use Absolute URL to hit Backend
                // In Prod (Render), use Relative URL to verify against current domain
                // This prevents "localhost" redirection issues on deployed sites
                const webUrl = import.meta.env.DEV 
                    ? `${apiUrl}/api/auth/google?state=web` 
                    : '/api/auth/google?state=web';
                
                console.log("Web Login Initiated:", webUrl);
                window.location.href = webUrl;
            }
        } catch (error) {
            console.error("Failed to open browser:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-bold py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm mt-4"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            {text}
        </button>
    );
};

export default GoogleButton;
