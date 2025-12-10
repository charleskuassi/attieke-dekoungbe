import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300 focus:outline-none"
            title={theme === 'dark' ? "Passer en mode clair" : "Passer en mode sombre"}
        >
            {theme === 'dark' ? (
                <Sun className="text-yellow-400" size={24} />
            ) : (
                <Moon className="text-gray-600 dark:text-gray-300" size={24} />
            )}
        </button>
    );
};

export default ThemeToggle;
