import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Check, Loader2 } from 'lucide-react';

const ImageLibrary = ({ selectionMode = false, onSelect }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Charger les images au démarrage
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/library');
            setImages(res.data);
        } catch (error) {
            console.error("Erreur chargement images", error);
        } finally {
            setLoading(false);
        }
    };

    // Gestion de l'upload
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post('http://localhost:5000/api/admin/library/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Recharger la galerie après succès
            await fetchImages();
            alert("Image ajoutée et optimisée avec succès !");
        } catch (error) {
            alert("Erreur lors de l'envoi");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ImageIcon className="text-orange-600" /> Médiathèque
                </h1>

                {/* Bouton Upload */}
                <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2 transition-all transform hover:scale-105">
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                    <span className="font-semibold">{uploading ? "Traitement..." : "Ajouter une image"}</span>
                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                </label>
            </div>

            {/* Grille Galerie */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-orange-500" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            onClick={() => selectionMode && onSelect && onSelect(img.url)}
                            className={`group relative bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 ${selectionMode ? 'cursor-pointer hover:ring-2 hover:ring-orange-500' : ''}`}
                        >
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                <img src={`http://localhost:5000${img.url}`} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            </div>
                            <p className="text-xs text-gray-500 truncate px-1">{img.name}</p>

                            {/* Overlay au survol */}
                            <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl ${selectionMode ? 'bg-orange-900/40' : ''}`}>
                                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                                    {selectionMode ? 'Choisir' : img.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;
