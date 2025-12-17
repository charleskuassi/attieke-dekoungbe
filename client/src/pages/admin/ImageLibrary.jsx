import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Image, Upload, Check, Loader, Trash2 } from 'lucide-react';

const ImageLibrary = ({ onSelect, selectionMode = false }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // 🔄 CHARGEMENT AU DÉMARRAGE (ESSENTIEL POUR LA PERSISTANCE)
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            // On appelle le backend qui va interroger Cloudinary
            const res = await api.get('/api/admin/library');
            setImages(res.data);
        } catch (err) {
            console.error("Erreur chargement images:", err);
            setError("Impossible de charger la médiathèque.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('image', file);

            // Upload vers le backend -> Cloudinary
            const res = await api.post('/api/admin/library/upload', formData);

            // On ajoute immédiatement la nouvelle image à la liste affichée
            const newImage = {
                name: res.data.name,
                url: res.data.url
            };

            setImages([newImage, ...images]);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Échec de l'upload.");
        } finally {
            setUploading(false);
        }
    };


    const handleDeleteImage = async (public_id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.")) return;

        try {
            // Optimistic UI update: Remove immediately
            setImages(prev => prev.filter(img => img.name !== public_id));

            await api.post('/api/admin/library/delete', { public_id });
        } catch (err) {
            console.error("Erreur suppression:", err);
            alert("Erreur lors de la suppression de l'image.");
            fetchImages(); // Revert/Reload if failed
        }
    };

    const getFullUrl = (url) => {
        if (!url) return '';
        // Les URLs Cloudinary sont déjà complètes (https://...)
        return url;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Image size={24} />
                    {selectionMode ? "Sélectionner une image" : "Médiathèque"}
                </h3>

                <div className="relative">
                    <input
                        type="file"
                        id="library-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="library-upload"
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-bold cursor-pointer transition
                            ${uploading
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                                : 'bg-primary text-white hover:bg-orange-700 shadow-md transform hover:scale-105'}
                        `}
                    >
                        {uploading ? (
                            <>
                                <Loader className="animate-spin" size={20} /> Upload...
                            </>
                        ) : (
                            <>
                                <Upload size={20} /> Ajouter une image
                            </>
                        )}
                    </label>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 h-96 overflow-y-auto p-2">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelect && onSelect(img.url)}
                            className={`
                                group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200
                                ${selectionMode ? 'hover:border-primary hover:shadow-lg' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'}
                            `}
                        >
                            <img
                                src={getFullUrl(img.url)}
                                alt={img.name}
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                            />

                            {/* Overlay de sélection & suppression */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20">
                                {selectionMode && (
                                    <div className="bg-white text-primary px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 transform active:scale-95 transition" title="Sélectionner">
                                        <Check size={18} strokeWidth={3} /> Utiliser
                                    </div>
                                )}

                                {/* Bouton Suppression */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Empêcher la sélection
                                        handleDeleteImage(img.name);
                                    }}
                                    className="bg-red-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-red-700 transition flex items-center gap-2"
                                    title="Supprimer définitivement"
                                >
                                    <Trash2 size={16} /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500 italic">
                            Aucune image trouvée sur le serveur.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;
