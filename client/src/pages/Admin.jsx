import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AdminAnnouncement from '../components/AdminAnnouncement';
import MaintenancePanel from '../components/MaintenancePanel';
import { LayoutDashboard, ShoppingBag, Users, TrendingUp, Package, Search, Filter, ChevronDown, CheckCircle, XCircle, Clock, Truck, MapPin, Plus, Edit, Trash, Trash2, Image, Utensils, Percent, Megaphone, FileText, MessageSquare, Shield, Archive as ArchiveIcon, Bell, Menu, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminReservations from '../components/AdminReservations';
import AdminTestimonials from '../components/AdminTestimonials';
import AdminMessages from '../components/AdminMessages';
import AdminReviews from '../components/AdminReviews';
import DriversPanel from '../components/DriversPanel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ImageLibrary from './admin/ImageLibrary';
import AdminDeliverySettings from '../components/AdminDeliverySettings';

const Admin = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
    const [stats, setStats] = useState({ dailySales: 0, monthlyData: [], topProducts: [] });
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [drivers, setDrivers] = useState([]); // Shared drivers list for assignment
    const [promo, setPromo] = useState({ isActive: false, minAmount: 15000, discountPercentage: 5 });
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ orders: 0, reservations: 0, messages: 0, reviews: 0, clients: 0 });
    const [reportFormat, setReportFormat] = useState('pdf'); // 'pdf' or 'excel'
    const [previewImage, setPreviewImage] = useState(null); // Lightbox State
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Menu Filter State
    const [menuSearch, setMenuSearch] = useState('');
    const [menuCategory, setMenuCategory] = useState('all');

    // Product Modal State
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', category: 'Plats', is_popular: false, image: null
    });

    // Library Modal State
    const [libraryImages, setLibraryImages] = useState([]);

    useEffect(() => {
        fetchData();
        fetchNotifications(); // Initial fetch
        const interval = setInterval(() => {
            fetchData();
            fetchNotifications(); // Poll notifications
        }, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/admin/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            await api.put(`/api/admin/notifications/read/${id}`);
            fetchNotifications(); // Refresh
        } catch (err) {
            console.error("Error marking read", err);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/images/')) return url;
        return `${API_URL}${url}`;
    };

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes, clientsRes, productsRes, promoRes, countsRes, driversRes] = await Promise.all([
                api.get('/api/orders/stats'),
                api.get('/api/orders/admin'),
                api.get('/api/orders/clients'),
                api.get('/api/products'),
                api.get('/api/promo'),
                api.get('/api/orders/notifications-counts'),
                api.get('/api/drivers')
            ]);

            setStats(statsRes.data);
            setOrders(ordersRes.data);
            setClients(clientsRes.data);
            setProducts(productsRes.data);
            setPromo(promoRes.data);
            setCounts(countsRes.data);
            setDrivers(driversRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin data:", error);
            if (error.response && error.response.status === 401) {
                alert("Session invalide (401). Veuillez vous reconnecter.");
                localStorage.removeItem('token'); // Nettoyage
                navigate('/login');
            } else {
                alert(`Erreur chargement données: ${error.message}`);
            }
            setLoading(false);
        }
    };

    const handleAssignDriver = async (driverId) => {
        if (!selectedOrderForAssign) return;
        try {
            await api.patch(`/api/orders/admin/${selectedOrderForAssign.id}/assign`, { driverId });
            alert("Livreur assigné !");
            setShowAssignModal(false);
            setSelectedOrderForAssign(null);
            fetchData(); // Refresh to show Update
        } catch (error) {
            console.error("Assign error:", error);
            alert("Erreur assignation");
        }
    };

    const handleDeleteClient = async (clientId) => {
        try {
            await api.delete(`/api/admin/users/${clientId}`);
            // Update UI immediately
            setClients(clients.filter(c => c.id !== clientId));
            alert("Utilisateur supprimé avec succès.");
        } catch (error) {
            console.error("Delete client error:", error);
            alert("Erreur lors de la suppression de l'utilisateur : " + (error.response?.data?.message || "Erreur serveur"));
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.patch(`/api/orders/admin/${orderId}`, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erreur lors de la mise à jour du statut");
        }

    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleArchiveOrder = async (orderId, currentStatus) => {
        try {
            const res = await api.put(`/api/admin/archive/order/${orderId}`, {});

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, isArchived: res.data.isArchived } : o));
        } catch (error) {
            console.error("Archive error:", error);
            alert("Erreur lors de l'archivage");
        }
    };

    const filterOrdersByPeriod = (orders, period) => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            switch (period) {
                case 'day': return orderDate >= startOfDay;
                case 'week': return orderDate >= startOfWeek;
                case 'month': return orderDate >= startOfMonth;
                case 'year': return orderDate >= startOfYear;
                default: return true;
            }
        });
    };

    const generateReport = (period, type = 'pdf') => {
        try {
            alert(`Génération du rapport ${period} en cours...`);
            const filtered = filterOrdersByPeriod(orders, period);

            if (filtered.length === 0) {
                alert("Aucune commande trouvée pour cette période.");
                return;
            }

            const fileName = `Rapport_${period}_${new Date().toISOString().split('T')[0]}`;

            if (type === 'pdf') {
                const doc = new jsPDF();

                // Header
                doc.setFontSize(20);
                doc.text(`Rapport des Ventes - ${period.toUpperCase()}`, 14, 22);
                doc.setFontSize(11);
                doc.text(`Généré le: ${new Date().toLocaleString()}`, 14, 30);

                // Stats Summary
                const totalSales = filtered.reduce((sum, order) => sum + parseInt(order.total_price || 0), 0);
                const totalOrders = filtered.length;

                // Fix: toLocaleString can introduce non-breaking spaces (U+202F) that jsPDF doesn't like. 
                // We replace them with regular spaces.
                const formattedSales = totalSales.toLocaleString('fr-FR').replace(/\u202F/g, ' ').replace(/\u00A0/g, ' ');

                doc.setFillColor(240, 240, 240);
                doc.rect(14, 35, 180, 25, 'F');
                doc.setFontSize(12);
                doc.text(`Total Ventes: ${formattedSales} FCFA`, 20, 48);
                doc.text(`Nombre de Commandes: ${totalOrders}`, 20, 56);

                // Table of Orders
                const tableColumn = ["Ref", "Quittance", "Client", "Date", "Statut", "Montant"];
                const tableRows = filtered.map(order => [
                    order.id, // Ref interne
                    order.transaction_id || '-', // Quittance / Transaction
                    order.customer_name,
                    new Date(order.createdAt).toLocaleDateString(),
                    order.status,
                    `${order.total_price} FCFA`
                ]);

                autoTable(doc, {
                    startY: 65,
                    head: [tableColumn],
                    body: tableRows,
                });

                doc.save(`${fileName}.pdf`);
                alert("PDF généré !");
            } else if (type === 'excel') {
                const worksheet = XLSX.utils.json_to_sheet(filtered.map(o => ({
                    ID: o.id,
                    Quittance: o.transaction_id || '-',
                    Client: o.customer_name,
                    Telephone: o.phone,
                    Date: new Date(o.createdAt).toLocaleString(),
                    Status: o.status,
                    Montant: o.total_price,
                    Articles: o.Products ? o.Products.map(p => `${p.OrderItem.quantity}x ${p.name}`).join(', ') : ''
                })));
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport");
                XLSX.writeFile(workbook, `${fileName}.xlsx`);
                alert("Excel généré !");
            }
        } catch (error) {
            console.error("Erreur génération rapport:", error);
            alert(`Erreur: ${error.message}`);
        }
    };


    // Chunk 2: JSX Nav + Content + Modal

    // Chunk 1 Execution:
    /* ... */


    const handlePromoUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/admin/promo', promo);
            setPromo(res.data);
            alert("Promotion mise à jour avec succès !");
        } catch (error) {
            console.error("Error updating promo:", error);
            alert("Erreur lors de la mise à jour de la promotion");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-purple-100 text-purple-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };



    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('price', productForm.price);
            formData.append('category', productForm.category);
            formData.append('is_popular', productForm.is_popular);

            if (productForm.image) {
                let imageUrl = productForm.image;

                // Si c'est un fichier (nouvel upload), on l'envoie d'abord au serveur
                if (productForm.image instanceof File) {
                    const uploadData = new FormData();
                    uploadData.append('image', productForm.image);

                    try {
                        const uploadRes = await api.post('/api/admin/library/upload', uploadData);
                        imageUrl = uploadRes.data.url;
                    } catch (uploadErr) {
                        console.error("Failed to upload image:", uploadErr);
                        alert("Erreur lors de l'upload de l'image. Veuillez réessayer.");
                        return;
                    }
                }

                formData.append('image_url', imageUrl);
            }

            if (editingProduct) {
                const res = await api.put(`/api/products/${editingProduct.id}`, formData);
                setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
            } else {
                const res = await api.post('/api/products', formData);
                setProducts([...products, res.data]);
            }
            setShowProductModal(false);
            setEditingProduct(null);
            setProductForm({ name: '', description: '', price: '', category: 'Plats', is_popular: false, image: null });
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erreur lors de l'enregistrement du produit");
        }
    };

    const openLibraryModal = async () => {
        setShowLibraryModal(true);
        try {
            const res = await api.get('/api/admin/library');
            setLibraryImages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const selectImageFromLibrary = (url) => {
        setProductForm({ ...productForm, image: url });
        setShowLibraryModal(false);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
        try {
            await api.delete(`/api/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Erreur lors de la suppression");
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            is_popular: product.is_popular,
            image: product.image_url // Preload existing image URL
        });
        setShowProductModal(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', category: 'Plats', is_popular: false, image: null });
        setShowProductModal(true);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone.includes(searchTerm) ||
            order.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
            product.category.toLowerCase().includes(menuSearch.toLowerCase());
        const matchesCategory = menuCategory === 'all' || product.category === menuCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white dark:bg-gray-800 shadow-md transition-all duration-300
                fixed inset-y-0 left-0 z-50 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:block
                flex flex-col h-full
            `}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-serif font-bold text-primary">Admin Panel</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-2 flex-1 overflow-y-auto custom-scrollbar pb-6">
                    <a onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'dashboard' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <LayoutDashboard size={20} className="mr-3 flex-shrink-0" /> Tableau de bord
                    </a>
                    <a onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'orders' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <div className="flex items-center"><ShoppingBag size={20} className="mr-3 flex-shrink-0" /> Commandes</div>
                        {counts.orders > 0 && <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{counts.orders}</span>}
                    </a>
                    <a onClick={() => { setActiveTab('menu'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'menu' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Utensils size={20} className="mr-3 flex-shrink-0" /> Menu
                    </a>
                    <a onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'clients' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <div className="flex items-center"><Users size={20} className="mr-3 flex-shrink-0" /> Clients</div>
                        <span className="bg-blue-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{clients.length}</span>
                    </a>
                    <a onClick={() => { setActiveTab('promo'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'promo' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Percent size={20} className="mr-3 flex-shrink-0" /> Promotions
                    </a>
                    <a onClick={() => { setActiveTab('testimonials'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'testimonials' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <MessageSquare size={20} className="mr-3 flex-shrink-0" /> Témoignages
                    </a>
                    <a onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); }} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'messages' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <div className="flex items-center"><Users size={20} className="mr-3 flex-shrink-0" /> Messages</div>
                        {counts.messages > 0 && <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{counts.messages}</span>}
                    </a>
                    <a onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'reviews' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <div className="flex items-center"><MessageSquare size={20} className="mr-3 flex-shrink-0" /> Avis & Plaintes</div>
                        {counts.reviews > 0 && <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{counts.reviews}</span>}
                    </a>
                    <a onClick={() => { setActiveTab('announcement'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'announcement' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Megaphone size={20} className="mr-3 flex-shrink-0" /> Annonces
                    </a>
                    <a onClick={() => { setActiveTab('drivers'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'drivers' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Truck size={20} className="mr-3 flex-shrink-0" /> Livreurs
                    </a>
                    <a onClick={() => { setActiveTab('delivery'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'delivery' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <MapPin size={20} className="mr-3 flex-shrink-0" /> Livraison
                    </a>
                    <a onClick={() => { setActiveTab('library'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'library' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Image size={20} className="mr-3 flex-shrink-0" /> Médiathèque
                    </a>
                    <a onClick={() => { setActiveTab('maintenance'); setIsSidebarOpen(false); }} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'maintenance' ? 'bg-orange-50 dark:bg-orange-900/20 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <Shield size={20} className="mr-3 flex-shrink-0" /> Maintenance
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 relative">
                {/* Global Header */}
                <header className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300">
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold capitalize text-primary">{activeTab}</h2>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-gray-500 hover:text-orange-600 relative transition-colors"
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full text-xs flex items-center justify-center font-bold text-white animate-bounce border-2 border-white dark:border-gray-800">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 dark:border-gray-700 ring-4 ring-black/5">
                                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                        <h3 className="font-bold text-sm dark:text-gray-200 uppercase tracking-wider text-gray-500">Notifications</h3>
                                        <div className="flex gap-3">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => markNotificationAsRead('all')}
                                                    className="text-xs text-primary hover:text-orange-700 font-bold uppercase"
                                                >
                                                    Tout lire
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center flex flex-col items-center text-gray-400">
                                                <Bell size={40} className="mb-2 opacity-20" />
                                                <p className="text-sm">Aucune notification pour le moment</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => {
                                                        if (!notif.isRead) markNotificationAsRead(notif.id);
                                                    }}
                                                    className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 flex gap-4 ${!notif.isRead ? 'bg-orange-50/60 dark:bg-orange-900/10' : ''}`}
                                                >
                                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-transparent'}`} />
                                                    <div className="flex-1">
                                                        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                                {notif.type}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                        <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg">
                            Déconnexion
                        </button>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
                        {/* ... (keep stats section) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 dark:text-gray-400">Ventes du jour</h3>
                                    <TrendingUp className="text-green-500" />
                                </div>
                                <p className="text-3xl font-bold dark:text-white">{stats.dailySales} FCFA</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 dark:text-gray-400">Commandes en attente</h3>
                                    <Clock className="text-orange-500" />
                                </div>
                                <p className="text-3xl font-bold dark:text-white">{orders.filter(o => o.status === 'pending' || o.status === 'paid').length}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 dark:text-gray-400">Total Clients</h3>
                                    <Users className="text-blue-500" />
                                </div>
                                <p className="text-3xl font-bold dark:text-white">{clients.length}</p>
                            </div>
                        </div>




                        {/* Reports & Graph Section */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">Rapports & Statistiques</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <button
                                            onClick={() => setReportFormat('pdf')}
                                            className={`px-3 py-1 rounded-md text-sm font-bold transition ${reportFormat === 'pdf' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >PDF</button>
                                        <button
                                            onClick={() => setReportFormat('excel')}
                                            className={`px-3 py-1 rounded-md text-sm font-bold transition ${reportFormat === 'excel' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >Excel</button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => generateReport('day', reportFormat)}
                                            className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-bold"
                                        >
                                            <FileText size={14} /> Jour
                                        </button>
                                        <button
                                            onClick={() => generateReport('week', reportFormat)}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-bold"
                                        >
                                            <FileText size={14} /> Semaine
                                        </button>
                                        <button
                                            onClick={() => generateReport('month', reportFormat)}
                                            className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm font-bold"
                                        >
                                            <FileText size={14} /> Mois
                                        </button>
                                        <button
                                            onClick={() => generateReport('year', reportFormat)}
                                            className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 text-sm font-bold"
                                        >
                                            <FileText size={14} /> Année
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="sales" fill="#EA580C" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto transition-colors duration-300">
                            <h3 className="text-xl font-bold p-6 border-b dark:border-gray-700 dark:text-white">Top Produits</h3>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                                    <tr>
                                        <th className="p-4">Produit</th>
                                        <th className="p-4">Ventes</th>
                                        <th className="p-4">Revenus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topProducts.map((product, index) => (
                                        <tr key={index} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4">{product.name}</td>
                                            <td className="p-4">{product.count}</td>
                                            <td className="p-4 font-bold">{product.revenue} FCFA</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div >
                )
                }

                {/* ... skip dashboard stats ... */}

                {activeTab === 'delivery' && <AdminDeliverySettings />}

                {
                    activeTab === 'orders' && (
                        <div className="space-y-6">
                            {/* ... keep headers ... */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto transition-colors duration-300">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-700 dark:text-gray-200">
                                        <tr>
                                            <th className="p-4 font-semibold">ID</th>
                                            <th className="p-4 font-semibold">Client</th>
                                            <th className="p-4 font-semibold">Articles</th>
                                            <th className="p-4 font-semibold">Total</th>
                                            <th className="p-4 font-semibold">Statut</th>
                                            <th className="p-4 font-semibold">Livraison</th>
                                            <th className="p-4 font-semibold">Date</th>
                                            <th className="p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center text-gray-500">Aucune commande trouvée</td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="p-4 font-mono text-sm dark:text-gray-300">#{order.id}</td>
                                                    <td className="p-4">
                                                        <div className="font-bold dark:text-white">{order.customer_name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{order.phone}</div>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        {order.Products && order.Products.map(p => (
                                                            <div key={p.id} className="flex items-center gap-2 mb-2">
                                                                {p.image_url ? (
                                                                    <img
                                                                        src={getImageUrl(p.image_url)}
                                                                        alt={p.name}
                                                                        onClick={() => setPreviewImage(getImageUrl(p.image_url))}
                                                                        className="w-10 h-10 rounded-md object-cover border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                                                                        title="Zoomer"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-gray-500">
                                                                        <Utensils size={16} />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="font-bold text-gray-900 dark:text-white">{p.OrderItem.quantity}x</span> {p.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold dark:text-white">{order.total_price} FCFA</div>
                                                        {order.delivery_cost > 0 && (
                                                            <div className="text-xs text-orange-600 font-medium whitespace-nowrap mt-1">
                                                                + {order.delivery_cost} F (Liv.)
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        {order.delivery_zone && (
                                                            <div className="mb-2 inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300 font-medium">
                                                                📍 {order.delivery_zone}
                                                            </div>
                                                        )}
                                                        {order.DeliveryDriver ? (
                                                            <div className="flex items-center gap-2 group">
                                                                <div className="flex items-center gap-1 text-green-600 font-bold">
                                                                    <Truck size={14} /> {order.DeliveryDriver.name}
                                                                </div>
                                                                <button
                                                                    onClick={() => { setSelectedOrderForAssign(order); setShowAssignModal(true); }}
                                                                    className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Modifier le livreur"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            (order.status === 'paid' || order.status === 'preparing' || order.status === 'shipping' || order.status === 'completed') ? (
                                                                <button
                                                                    onClick={() => { setSelectedOrderForAssign(order); setShowAssignModal(true); }}
                                                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                                                                >
                                                                    <Plus size={12} /> Assigner
                                                                </button>
                                                            ) : <span className="text-gray-400">-</span>

                                                        )}

                                                        {/* Archive Button */}
                                                        <button
                                                            onClick={() => handleArchiveOrder(order.id, order.isArchived)}
                                                            className={`ml-2 p-1 rounded-full hover:bg-gray-100 transition ${order.isArchived ? 'text-orange-600 bg-orange-50' : 'text-gray-300'}`}
                                                            title={order.isArchived ? "Désarchiver" : "Archiver (Protéger)"}
                                                        >
                                                            <ArchiveIcon size={16} fill={order.isArchived ? "currentColor" : "none"} />
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                            className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                                                        >
                                                            <option value="pending">En attente</option>
                                                            <option value="paid">Payé</option>
                                                            <option value="preparing">En cuisine</option>
                                                            <option value="shipping">En livraison</option>
                                                            <option value="completed">Livré</option>
                                                            <option value="cancelled">Annulé</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'menu' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Gestion du Menu</h2>
                                <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 transition">
                                    <Plus size={20} className="mr-2" /> Nouveau Produit
                                </button>
                            </div>
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un produit..."
                                        value={menuSearch}
                                        onChange={(e) => setMenuSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <select
                                    value={menuCategory}
                                    onChange={(e) => setMenuCategory(e.target.value)}
                                    className="border rounded-lg px-4 py-2 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="all">Tout</option>
                                    <option value="Plats">Plats</option>
                                    <option value="Boissons">Boissons</option>
                                    <option value="Jus">Jus</option>
                                    <option value="Yahourt">Yahourt</option>
                                    <option value="Vins">Vins</option>
                                    <option value="Whiskys">Whiskys</option>
                                    <option value="Champagnes">Champagnes</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300">
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            {product.is_popular && (
                                                <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                                    Populaire
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg mb-1 dark:text-white">{product.name}</h3>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 dark:text-gray-400">{product.description}</p>
                                            <div className="mt-auto flex justify-between items-center">
                                                <span className="font-bold text-primary text-xl">{product.price} FCFA</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {activeTab === 'clients' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto transition-colors duration-300">
                        <div className="p-6 border-b dark:border-gray-700">
                            <h2 className="text-2xl font-bold dark:text-white">Liste des Clients</h2>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="p-4">Nom</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Téléphone</th>
                                    <th className="p-4">Adresse</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => (
                                    <tr key={client.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4 font-bold flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            {client.name}
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{client.email}</td>
                                        <td className="p-4">{client.phone || '-'}</td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{client.address || '-'}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
                                                        handleDeleteClient(client.id);
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                                                title="Supprimer l'utilisateur"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'promo' && (
                    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-colors duration-300">
                        <div className="flex items-center justify-center mb-6 text-primary">
                            <Percent size={48} />
                        </div>
                        <h2 className="text-2xl font-bold mb-6 text-center">Configuration Promotions</h2>
                        <form onSubmit={handlePromoUpdate} className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <label className="font-bold dark:text-white">Activer la promotion</label>
                                <input
                                    type="checkbox"
                                    checked={promo.isActive}
                                    onChange={(e) => setPromo({ ...promo, isActive: e.target.checked })}
                                    className="w-6 h-6 text-primary rounded focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-gray-300">Montant Minimum (FCFA)</label>
                                <input
                                    type="number"
                                    value={promo.minAmount}
                                    onChange={(e) => setPromo({ ...promo, minAmount: parseInt(e.target.value) })}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-gray-300">Pourcentage de réduction (%)</label>
                                <input
                                    type="number"
                                    value={promo.discountPercentage}
                                    onChange={(e) => setPromo({ ...promo, discountPercentage: parseInt(e.target.value) })}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg transition">
                                Enregistrer les modifications
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'testimonials' && <AdminTestimonials />}
                {activeTab === 'messages' && <AdminMessages />}
                {activeTab === 'reviews' && <AdminReviews />}
                {activeTab === 'drivers' && <DriversPanel drivers={drivers} setDrivers={setDrivers} />}
                {activeTab === 'announcement' && <AdminAnnouncement />}
                {activeTab === 'library' && <ImageLibrary />}
                {activeTab === 'maintenance' && <MaintenancePanel />}

            </main>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors duration-300 transform scale-100 animate-fade-in relative">
                        <button
                            onClick={() => setShowProductModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <XCircle size={28} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            {editingProduct ? <><Edit className="text-blue-500" /> Modifier le Produit</> : <><Plus className="text-green-500" /> Ajouter un Produit</>}
                        </h2>

                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Nom du produit</label>
                                <input
                                    type="text"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Description</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-gray-300">Catégorie</label>
                                    <select
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    >
                                    >
                                        <option value="Plats">Plats</option>
                                        <option value="Boissons">Boissons</option>
                                        <option value="Jus">Jus</option>
                                        <option value="Yahourt">Yahourt</option>
                                        <option value="Vins">Vins</option>
                                        <option value="Whiskys">Whiskys</option>
                                        <option value="Champagnes">Champagnes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={productForm.is_popular}
                                    onChange={(e) => setProductForm({ ...productForm, is_popular: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                                />
                                <label className="font-bold text-sm dark:text-white">Marquer comme populaire (Star)</label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 dark:text-gray-300">Image</label>

                                <div className="flex flex-col gap-3">
                                    {/* Option 1: Upload File */}
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept="image/*"
                                        />
                                        <div className="flex flex-col items-center text-gray-500">
                                            <Image size={32} className="mb-2" />
                                            <span className="text-sm">Cliquez pour téléverser une image</span>
                                        </div>
                                    </div>

                                    <div className="text-center text-gray-400 text-sm">- OU -</div>

                                    {/* Option 2: Choose from Library */}
                                    <button
                                        type="button"
                                        onClick={openLibraryModal}
                                        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                                    >
                                        <Image size={18} /> Choisir dans la médiathèque
                                    </button>
                                </div>

                                {/* Preview */}
                                {productForm.image && (
                                    <div className="mt-3 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden group">
                                        {/* Handle both file object and string url previews */}
                                        <img
                                            src={typeof productForm.image === 'string' ? getImageUrl(productForm.image) : URL.createObjectURL(productForm.image)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setProductForm({ ...productForm, image: null })}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>


                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(false)}
                                    className="flex-1 py-3 rounded-lg border dark:border-gray-600 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg transition transform active:scale-95"
                                >
                                    {editingProduct ? 'Mettre à jour' : 'Ajouter le produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && selectedOrderForAssign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm transform scale-100 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Assigner un livreur</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Pour la commande <span className="font-mono font-bold">#{selectedOrderForAssign.id}</span>
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {drivers.map(driver => (
                                <button
                                    key={driver.id}
                                    onClick={() => handleAssignDriver(driver.id)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition ${selectedOrderForAssign.DeliveryDriverId === driver.id
                                        ? 'bg-blue-50 border-blue-200 border text-blue-800'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                            {driver.name.charAt(0)}
                                        </div>
                                        <span className="font-bold">{driver.name}</span>
                                    </div>
                                    {selectedOrderForAssign.DeliveryDriverId === driver.id && <CheckCircle size={16} />}
                                </button>
                            ))}
                            {drivers.length === 0 && <p className="text-gray-400 text-center py-4">Aucun livreur disponible</p>}
                        </div>
                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="w-full mt-4 py-2 border dark:border-gray-600 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Library Modal */}
            {showLibraryModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                <Image size={24} /> Médiathèque
                            </h2>
                            <button onClick={() => setShowLibraryModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
                            {libraryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => selectImageFromLibrary(img.url)}
                                    className="group relative cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all aspect-square"
                                >
                                    <img src={getImageUrl(img.url)} alt="Library" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <CheckCircle className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-110 transition-all duration-300" size={32} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* --- IMAGE PREVIEW MODAL --- */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer animate-fade-in"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors z-[10000]"
                        onClick={() => setPreviewImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={previewImage}
                        alt="Aperçu"
                        className="max-w-full max-h-screen rounded-lg shadow-2xl transform transition-transform duration-300 scale-100 hover:scale-[1.02]"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default Admin;
