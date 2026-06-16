import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter>
            <AuthProvider>
                <CartProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </CartProvider>
            </AuthProvider>
        </HashRouter>
    </React.StrictMode>,
)
