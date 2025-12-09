/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#D2691E', // Chocolat/Ocre
                secondary: '#16A34A', // Vert
                background: '#FFF7ED', // Crème
                text: '#1F2937', // Gris foncé
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
}
