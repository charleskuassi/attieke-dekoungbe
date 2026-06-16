import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Mail, MessageCircle, Reply, Trash2, Archive } from 'lucide-react';

const AdminMessages = ({ refreshCounts }) => {
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/api/messages');
            setMessages(res.data);
        } catch (error) {
            console.error("Fetch messages error:", error);
        }
    };

    const handleMarkAsRead = async (msg) => {
        if (msg.isRead) return; // Already read

        try {
            await api.patch(`/api/messages/${msg.id}/read`);

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
            await api.delete(`/api/messages/${id}`);
            // Remove from UI
            setMessages(messages.filter(m => m.id !== id));
            // Update badge count
            if (refreshCounts) refreshCounts();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Erreur lors de la suppression.");
        }
    };

    const handleArchive = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await api.put(`/api/admin/archive/message/${id}`, {});
            // Update UI
            setMessages(messages.map(m => m.id === id ? { ...m, isArchived: res.data.isArchived } : m));
        } catch (error) {
            console.error("Archive error:", error);
            alert("Erreur lors de l'archivage.");
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <Mail className="text-primary" /> Messagerie
            </h2>

            <div className="space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        onClick={() => handleMarkAsRead(msg)}
                        className={`border rounded-lg p-4 transition cursor-pointer ${!msg.isRead
                            ? 'bg-orange-50 border-orange-200 shadow-sm dark:bg-orange-900/20 dark:border-orange-800'
                            : 'bg-white border-gray-200 hover:shadow-md dark:bg-gray-750 dark:border-gray-700 dark:hover:shadow-gray-900/50'
                            } dark:bg-gray-700`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className={`font-bold ${!msg.isRead ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {msg.name} {!msg.isRead && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Nouveau</span>}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{msg.email}</p>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={`p-3 rounded text-sm mb-4 ${!msg.isRead
                            ? 'bg-white text-gray-800 font-medium dark:bg-gray-800 dark:text-gray-100'
                            : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                            {msg.message}
                        </p>
                        <div className="flex gap-3 justify-end mt-4">
                            <a
                                href={`mailto:${msg.email}?subject=Réponse Attièkè Dèkoungbé`}
                                onClick={(e) => e.stopPropagation()} // Prevent triggering read logic again if just clicking email
                                className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 font-medium dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                <Reply size={16} /> Répondre
                            </a>
                            <button
                                onClick={(e) => handleDelete(e, msg.id)}
                                className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 font-medium transition dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            >
                                <Trash2 size={16} /> Supprimer
                            </button>
                            <button
                                onClick={(e) => handleArchive(e, msg.id)}
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded font-medium transition ${msg.isArchived
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                                    }`}
                                title={msg.isArchived ? "Protégé (Archivé)" : "Archiver pour protéger"}
                            >
                                <Archive size={16} /> {msg.isArchived ? 'Protégé' : 'Archiver'}
                            </button>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucun message reçu.</p>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
