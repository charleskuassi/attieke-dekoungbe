import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error);
        }

        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove both classes to ensure clean state
        root.classList.remove('light', 'dark');

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.add('light'); // Optionally add light class for explicitness
        }

        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            // Provide a graceful fallback if storage is disabled
        }
    }, [theme]);

    // Listener for system preference changes (only if user hasn't manually set a preference? 
    // Usually manual override persists. But if we want to sync with system if no override...)
    // For now, let's just stick to manual toggle priority as is standard.

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
