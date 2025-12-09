import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminAnnouncement from '../components/AdminAnnouncement';
import { LayoutDashboard, ShoppingBag, Users, TrendingUp, Package, Search, Filter, ChevronDown, CheckCircle, XCircle, Clock, Truck, Plus, Edit, Trash, Image, Utensils, Percent, Megaphone, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminReservations from '../components/AdminReservations';
import AdminMessages from '../components/AdminMessages';
import DriversPanel from '../components/DriversPanel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ dailySales: 0, monthlyData: [], topProducts: [] });
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [drivers, setDrivers] = useState([]); // Shared drivers list for assignment
    const [promo, setPromo] = useState({ isActive: false, minAmount: 15000, discountPercentage: 5 });
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ orders: 0, reservations: 0, messages: 0, clients: 0 });
    const [reportFormat, setReportFormat] = useState('pdf'); // 'pdf' or 'excel'

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
        name: '', description: '', price: '', category: 'plats', is_popular: false, image: null
    });

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, ordersRes, clientsRes, productsRes, promoRes, countsRes, driversRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/orders/stats`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/orders/admin`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/orders/clients`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/products`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/promo`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/orders/notifications-counts`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/drivers`, { headers })
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
            setLoading(false);
        }
    };

    const handleAssignDriver = async (driverId) => {
        if (!selectedOrderForAssign) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/orders/admin/${selectedOrderForAssign.id}/assign`,
                { driverId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Livreur assigné !");
            setShowAssignModal(false);
            setSelectedOrderForAssign(null);
            fetchData(); // Refresh to show Update
        } catch (error) {
            console.error("Assign error:", error);
            alert("Erreur assignation");
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/orders/admin/${orderId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erreur lors de la mise à jour du statut");
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
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/promo`,
                promo,
                { headers: { Authorization: `Bearer ${token}` } }
            );
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

    // --- Product Management Handlers ---
    const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'library'
    const [libraryImages, setLibraryImages] = useState([]);

    const fetchLibraryImages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/images`);
            setLibraryImages(res.data);
        } catch (error) {
            console.error("Failed to load images", error);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('price', productForm.price);
            formData.append('category', productForm.category);
            formData.append('is_popular', productForm.is_popular);

            if (productForm.image) {
                if (typeof productForm.image === 'string') {
                    // It's a URL from the library
                    formData.append('image_url', productForm.image);
                } else {
                    // It's a File object
                    formData.append('image', productForm.image);
                }
            }

            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };

            if (editingProduct) {
                const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editingProduct.id}`, formData, config);
                setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
            } else {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData, config);
                setProducts([...products, res.data]);
            }
            setShowProductModal(false);
            setEditingProduct(null);
            setProductForm({ name: '', description: '', price: '', category: 'plats', is_popular: false, image: null });
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erreur lors de l'enregistrement du produit");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            image: null // Don't preload image file
        });
        setShowProductModal(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', category: 'plats', is_popular: false, image: null });
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
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-serif font-bold text-primary">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    <a onClick={() => setActiveTab('dashboard')} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'dashboard' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <LayoutDashboard size={20} className="mr-3" /> Tableau de bord
                    </a>
                    <a onClick={() => setActiveTab('orders')} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'orders' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <div className="flex items-center"><ShoppingBag size={20} className="mr-3" /> Commandes</div>
                        {counts.orders > 0 && <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{counts.orders}</span>}
                    </a>
                    <a onClick={() => setActiveTab('menu')} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'menu' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Utensils size={20} className="mr-3" /> Menu
                    </a>
                    <a onClick={() => setActiveTab('clients')} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'clients' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <div className="flex items-center"><Users size={20} className="mr-3" /> Clients</div>
                        <span className="bg-blue-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{clients.length}</span>
                    </a>
                    <a onClick={() => setActiveTab('promo')} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'promo' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Percent size={20} className="mr-3" /> Promotions
                    </a>
                    <a onClick={() => setActiveTab('reservations')} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'reservations' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <div className="flex items-center"><Clock size={20} className="mr-3" /> Réservations</div>
                        {counts.reservations > 0 && <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{counts.reservations}</span>}
                    </a>
                    <a onClick={() => setActiveTab('messages')} className={`flex items-center justify-between px-6 py-3 cursor-pointer ${activeTab === 'messages' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <div className="flex items-center"><Users size={20} className="mr-3" /> Messages</div>
                        {counts.messages > 0 && <span className="bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">{counts.messages}</span>}
                    </a>
                    <a onClick={() => setActiveTab('announcement')} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'announcement' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Megaphone size={20} className="mr-3" /> Annonces
                    </a>
                    <a onClick={() => setActiveTab('drivers')} className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'drivers' ? 'bg-orange-50 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Truck size={20} className="mr-3" /> Livreurs
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
                        {/* ... (keep stats section) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500">Ventes du jour</h3>
                                    <TrendingUp className="text-green-500" />
                                </div>
                                <p className="text-3xl font-bold">{stats.dailySales} FCFA</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500">Commandes en attente</h3>
                                    <Clock className="text-orange-500" />
                                </div>
                                <p className="text-3xl font-bold">{orders.filter(o => o.status === 'pending' || o.status === 'paid').length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500">Total Clients</h3>
                                    <Users className="text-blue-500" />
                                </div>
                                <p className="text-3xl font-bold">{clients.length}</p>
                            </div>
                        </div>


                        {/* Reports & Graph Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Rapports & Statistiques</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
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
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <h3 className="text-xl font-bold p-6 border-b">Top Produits</h3>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4">Produit</th>
                                        <th className="p-4">Ventes</th>
                                        <th className="p-4">Revenus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topProducts.map((product, index) => (
                                        <tr key={index} className="border-t">
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

                {
                    activeTab === 'orders' && (
                        <div className="space-y-6">
                            {/* ... keep headers ... */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
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
                                    <tbody className="divide-y">
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center text-gray-500">Aucune commande trouvée</td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="p-4 font-mono text-sm">#{order.id}</td>
                                                    <td className="p-4">
                                                        <div className="font-bold">{order.customer_name}</div>
                                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        {order.Products && order.Products.map(p => (
                                                            <div key={p.id}>{p.OrderItem.quantity}x {p.name}</div>
                                                        ))}
                                                    </td>
                                                    <td className="p-4 font-bold">{order.total_price} FCFA</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm">
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
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                            className="border rounded px-2 py-1 text-sm bg-white"
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
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <select
                                    value={menuCategory}
                                    onChange={(e) => setMenuCategory(e.target.value)}
                                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="all">Toutes catégories</option>
                                    <option value="plats">Plats</option>
                                    <option value="boissons">Boissons</option>
                                    <option value="vins">Vins</option>
                                    <option value="whiskys">Whiskys</option>
                                    <option value="champagnes">Champagnes</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                        <div className="relative h-48">
                                            <img src={product.image_url || "/api/placeholder/400/300"} alt={product.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                                <button onClick={() => openEditModal(product)} className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50">
                                                    <Edit size={20} />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50">
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                            {product.is_popular && (
                                                <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                                    <TrendingUp size={12} className="mr-1" /> Populaire
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg">{product.name}</h3>
                                                    <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                                                </div>
                                                <span className="font-bold text-primary">{product.price} FCFA</span>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'clients' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Clients ({clients.length})</h2>
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 font-semibold">Nom</th>
                                            <th className="p-4 font-semibold">Email</th>
                                            <th className="p-4 font-semibold">Téléphone</th>
                                            <th className="p-4 font-semibold">Inscrit le</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {clients.map(client => (
                                            <tr key={client.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-bold">{client.name}</td>
                                                <td className="p-4 text-gray-600">{client.email}</td>
                                                <td className="p-4 text-gray-600">{client.phone || '-'}</td>
                                                <td className="p-4 text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'promo' && (
                        <div className="max-w-2xl mx-auto space-y-8">
                            <h2 className="text-2xl font-bold">Configuration Promotion</h2>
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <form onSubmit={handlePromoUpdate} className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <div>
                                            <h3 className="font-bold text-lg text-orange-900">Activer la promotion</h3>
                                            <p className="text-sm text-orange-700">Appliquer automatiquement la réduction au panier</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={promo.isActive}
                                                onChange={e => setPromo({ ...promo, isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant Minimum (FCFA)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={promo.minAmount}
                                                onChange={e => setPromo({ ...promo, minAmount: parseInt(e.target.value) })}
                                                className="w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                                            />
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">FCFA</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Le panier doit dépasser ce montant pour bénéficier de la promo.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage de réduction (%)</label>
                                        <div className="relative">
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">%</span>
                                            <input
                                                type="number"
                                                value={promo.discountPercentage}
                                                onChange={e => setPromo({ ...promo, discountPercentage: parseInt(e.target.value) })}
                                                className="w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} /> Enregistrer les modifications
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }

                {activeTab === 'reservations' && <AdminReservations />}
                {activeTab === 'messages' && <AdminMessages />}

                {activeTab === 'announcement' && <AdminAnnouncement />}
                {activeTab === 'drivers' && <DriversPanel />}
            </main >

            {/* Assignment Modal */}
            {
                showAssignModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
                            <h3 className="text-lg font-bold mb-4">Assigner un livreur</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {drivers.filter(d => d.status === 'available').map(driver => (
                                    <button
                                        key={driver.id}
                                        onClick={() => handleAssignDriver(driver.id)}
                                        className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                                    >
                                        <span className="font-bold">{driver.name}</span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Dispo</span>
                                    </button>
                                ))}
                                {drivers.filter(d => d.status !== 'available').map(driver => (
                                    <button
                                        key={driver.id}
                                        disabled
                                        className="w-full text-left p-3 border rounded bg-gray-50 opacity-50 flex justify-between items-center cursor-not-allowed"
                                    >
                                        <span>{driver.name}</span>
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{driver.status}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="mt-4 w-full py-2 bg-gray-200 rounded hover:bg-gray-300">Annuler</button>
                        </div>
                    </div>
                )
            }


            {/* Product Modal */}
            {
                showProductModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
                                <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                {/* ... fields ... */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                                        <input
                                            type="number"
                                            required
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                        <select
                                            value={productForm.category}
                                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="plats">Plats</option>
                                            <option value="boissons">Boissons</option>
                                            <option value="vins">Vins</option>
                                            <option value="whiskys">Whiskys</option>
                                            <option value="champagnes">Champagnes</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_popular"
                                        checked={productForm.is_popular}
                                        onChange={e => setProductForm({ ...productForm, is_popular: e.target.checked })}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="is_popular" className="text-sm font-medium text-gray-700">Marquer comme populaire</label>
                                </div>

                                {/* Image Selection Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>

                                    {/* Tab Selection: Upload vs Library */}
                                    <div className="flex space-x-4 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('upload')}
                                            className={`text-sm pb-1 ${imageMode === 'upload' ? 'border-b-2 border-primary font-bold' : 'text-gray-500'}`}
                                        >
                                            Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setImageMode('library'); fetchLibraryImages(); }}
                                            className={`text-sm pb-1 ${imageMode === 'library' ? 'border-b-2 border-primary font-bold' : 'text-gray-500'}`}
                                        >
                                            Bibliothèque ({libraryImages.length})
                                        </button>
                                    </div>

                                    {imageMode === 'upload' ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setProductForm({ ...productForm, image: e.target.files[0] })}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center text-gray-500">
                                                <Image size={24} className="mb-2" />
                                                <span className="text-sm">{productForm.image instanceof File ? productForm.image.name : 'Cliquez pour uploader'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded-lg">
                                            {libraryImages.map((imgUrl, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setProductForm({ ...productForm, image: imgUrl })} // Set string URL directly
                                                    className={`cursor-pointer border-2 rounded overflow-hidden aspect-square ${productForm.image === imgUrl ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-transparent hover:border-gray-300'}`}
                                                >
                                                    <img src={imgUrl} alt="Library" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Preview of selected/existing image */}
                                    {(typeof productForm.image === 'string' && productForm.image) && (
                                        <p className="text-xs text-green-600 mt-1 truncate">Sélectionné : {productForm.image}</p>
                                    )}
                                </div>

                                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition">
                                    {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Admin;
