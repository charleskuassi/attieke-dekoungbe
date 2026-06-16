import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Image, Upload, Check, Loader } from 'lucide-react';

const ImageLibrary = ({ onSelect, selectionMode = false }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/library');
            setImages(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching library:", err);
            setError("Impossible de charger les images.");
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

            const res = await api.post('/api/admin/library/upload', formData);

            // Add new image to list (res.data contains filename & url)
            const newImage = {
                name: res.data.filename,
                url: res.data.url,
                path: res.data.filename
            };

            setImages([newImage, ...images]);
            setUploading(false);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Échec de l'upload. Vérifiez le format (PNG, JPG, WEBP).");
            setUploading(false);
        }
    };

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/images/')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${apiUrl}${url}`;
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
                                <Loader className="animate-spin" size={20} /> Traitement...
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

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {selectionMode && (
                                    <div className="bg-white text-primary p-2 rounded-full shadow-lg">
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-500 italic">
                            Aucune image dans la bibliothèque.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;
