import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Trash2, Upload, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../utils/imageHelper';

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        content: '',
        image: null
    });
    const [uploadPreview, setUploadPreview] = useState(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await api.get('/api/testimonials');
            setTestimonials(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setUploadPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('content', formData.content);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await api.post('/api/testimonials', data);
            alert('Témoignage ajouté avec succès !');
            setFormData({ name: '', content: '', image: null });
            setUploadPreview(null);
            fetchTestimonials();
        } catch (error) {
            console.error("Error creating testimonial:", error);
            alert("Erreur lors de l'ajout du témoignage");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce témoignage ?")) return;
        try {
            await api.delete(`/api/testimonials/${id}`);
            setTestimonials(testimonials.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Erreur lors de la suppression");
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <MessageSquare className="text-primary" /> Gestion des Témoignages (TikTok)
            </h2>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 dark:text-gray-200">Ajouter un nouveau témoignage</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Nom du Client</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Message / Avis</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows="3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-gray-300">Photo (Capture écran ou Profil)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                            />
                            {uploadPreview ? (
                                <img src={uploadPreview} alt="Preview" className="h-32 mx-auto object-cover rounded" />
                            ) : (
                                <div className="text-gray-500">
                                    <Upload className="mx-auto mb-2" />
                                    <span>Cliquez pour ajouter une image</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded hover:bg-orange-700 transition">
                        Ajouter
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border dark:border-gray-700 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                            {t.image ? (
                                <img src={getImageUrl(t.image)} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                    {t.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold dark:text-white">{t.name}</h4>
                                <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm flex-1 mb-4 italic">"{t.content}"</p>
                        <button
                            onClick={() => handleDelete(t.id)}
                            className="self-end text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-bold"
                        >
                            <Trash2 size={16} /> Supprimer
                        </button>
                    </div>
                ))}
                {testimonials.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-8">Aucun témoignage pour le moment.</p>
                )}
            </div>
        </div>
    );
};

export default AdminTestimonials;
