import { Browser } from '@capacitor/browser';

const GoogleButton = ({ text = "Continuer avec Google" }) => {
    const handleGoogleLogin = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const isNative = window.Capacitor?.isNativePlatform();
        const stateParam = isNative ? '?state=mobile' : '?state=web';
        const targetUrl = `${apiUrl}/api/auth/google${stateParam}`;

        console.log("Initiating Google Login. Native:", isNative, "URL:", targetUrl);

        try {
            if (isNative) {
                // Mobile: Open system browser/custom tab to ensure cookie/session handling works for Google
                await Browser.open({ url: targetUrl });
            } else {
                // Web: Standard redirect
                window.location.href = targetUrl;
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
