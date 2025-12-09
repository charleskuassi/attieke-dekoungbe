import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, MessageCircle, Reply, Trash2 } from 'lucide-react';

const AdminMessages = ({ refreshCounts }) => {
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(res.data);
        } catch (error) {
            console.error("Fetch messages error:", error);
        }
    };

    const handleMarkAsRead = async (msg) => {
        if (msg.isRead) return; // Already read

        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/messages/${msg.id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Update local state
            setMessages(messages.map(m => m.id === msg.id ? { ...m, isRead: true } : m));

            // Trigger global count update
            if (refreshCounts) refreshCounts();
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening message logic
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/messages/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Remove from UI
            setMessages(messages.filter(m => m.id !== id));
            // Update badge count
            if (refreshCounts) refreshCounts();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Erreur lors de la suppression.");
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="text-primary" /> Messagerie
            </h2>

            <div className="space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        onClick={() => handleMarkAsRead(msg)}
                        className={`border rounded-lg p-4 transition cursor-pointer ${!msg.isRead ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-200 hover:shadow-md'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className={`font-bold ${!msg.isRead ? 'text-primary' : 'text-gray-800'}`}>
                                    {msg.name} {!msg.isRead && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Nouveau</span>}
                                </h3>
                                <p className="text-sm text-gray-500">{msg.email}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={`p-3 rounded text-sm mb-4 ${!msg.isRead ? 'bg-white text-gray-800 font-medium' : 'bg-gray-50 text-gray-600'}`}>
                            {msg.message}
                        </p>
                        <div className="flex gap-3 justify-end mt-4">
                            <a
                                href={`mailto:${msg.email}?subject=Réponse Attièkè Dékoungbé`}
                                onClick={(e) => e.stopPropagation()} // Prevent triggering read logic again if just clicking email
                                className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 font-medium"
                            >
                                <Reply size={16} /> Répondre
                            </a>
                            <button
                                onClick={(e) => handleDelete(e, msg.id)}
                                className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 font-medium transition"
                            >
                                <Trash2 size={16} /> Supprimer
                            </button>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucun message reçu.</p>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
