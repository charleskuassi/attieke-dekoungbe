import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { resizeImage } from '../../utils/imageUtils'; // Import utility
import { Image, Upload, Check, Loader, Trash2, X } from 'lucide-react';

const ImageLibrary = ({ onSelect, selectionMode = false, multiSelect = false }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 }); // Track progress
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/library');
            if (Array.isArray(res.data)) {
                 setImages(res.data);
            } else {
                 setImages([]);
            }
        } catch (err) {
            console.error("Erreur chargement images:", err);
            setError("Impossible de charger la médiathèque.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        setUploadProgress({ current: 0, total: files.length });

        let successCount = 0;
        let failureCount = 0;
        const newImages = [];

        // Helper for concurrency control
        const CONCURRENCY_LIMIT = 3;
        
        try {
            // 1. Pre-process images (Resize) - Sequential to avoid browser freeze
            const resizedFiles = [];
            for (const file of files) {
                try {
                    // Resize to max 1280x1280, 80% quality
                    const resized = await resizeImage(file, 1280, 1280, 0.8);
                    resizedFiles.push(resized);
                } catch (err) {
                    console.error("Resize error:", err);
                    // Fallback to original if resize fails
                    resizedFiles.push(file);
                }
            }

            // 2. Upload in chunks
            for (let i = 0; i < resizedFiles.length; i += CONCURRENCY_LIMIT) {
                const chunk = resizedFiles.slice(i, i + CONCURRENCY_LIMIT);
                
                const chunkPromises = chunk.map(async (file) => {
                    const formData = new FormData();
                    formData.append('image', file);

                    try {
                        const res = await api.post('/api/admin/library/upload', formData, {
                           timeout: 60000 // 60s timeout for stability
                        });

                        if (res.data && res.data.url) {
                            return { status: 'fulfilled', value: { name: res.data.name, url: res.data.url } };
                        } else {
                            throw new Error("Invalid response");
                        }
                    } catch (err) {
                        return { status: 'rejected', reason: err };
                    }
                });

                const results = await Promise.all(chunkPromises);

                results.forEach(result => {
                    if (result.status === 'fulfilled') {
                        successCount++;
                        newImages.push(result.value);
                    } else {
                        failureCount++;
                    }
                });

                // Update progress
                setUploadProgress(prev => ({ ...prev, current: Math.min(prev.current + chunk.length, prev.total) }));
            }

            if (newImages.length > 0) {
                setImages(prev => [...newImages, ...prev]);
            }

            if (failureCount > 0) {
                 alert(`Terminé : ${successCount} ajoutée(s), ${failureCount} échec(s).`);
            } else {
                 // alert(`${successCount} images ajoutées avec succès !`);
                 e.target.value = null; // Reset input
            }

        } catch (err) {
            console.error("Global upload error:", err);
            setError("Erreur lors de l'envoi.");
        } finally {
            setUploading(false);
            setUploadProgress({ current: 0, total: 0 });
        }
    };

    const handleDeleteImage = async (public_id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.")) return;

        try {
            setImages(prev => prev.filter(img => img.name !== public_id));
            await api.post('/api/admin/library/delete', { public_id });
            setSelectedIds(prev => prev.filter(id => id !== public_id));
        } catch (err) {
            console.error("Erreur suppression:", err);
            alert("Erreur lors de la suppression de l'image.");
            fetchImages();
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} images ?`)) return;

        try {
            // Optimistic update
            setImages(prev => prev.filter(img => !selectedIds.includes(img.name)));
            
            // Delete all selected images
            await Promise.all(selectedIds.map(id => api.post('/api/admin/library/delete', { public_id: id })));
            
            setSelectedIds([]);
            alert("Images supprimées avec succès.");
        } catch (err) {
            console.error("Batch delete error:", err);
            alert("Erreur lors de la suppression de certaines images.");
            fetchImages();
        }
    };

    const handleConfirmSelection = () => {
        if (onSelect) {
            // Find full image objects or just URLs based on selectedIds
            // Assuming we return URLs
             const selectedUrls = images
                .filter(img => selectedIds.includes(img.name))
                .map(img => img.url);
            onSelect(selectedUrls);
        }
    };

    const handleImageClick = (img) => {
        if (selectionMode) {
            if (multiSelect) {
                // Toggle selection
                setSelectedIds(prev => {
                    if (prev.includes(img.name)) {
                        return prev.filter(id => id !== img.name);
                    } else {
                        return [...prev, img.name];
                    }
                });
            } else {
                // Single select - immediate return
                onSelect && onSelect(img.url);
            }
        } else {
            // Batch delete mode - toggle
            setSelectedIds(prev => {
                if (prev.includes(img.name)) {
                    return prev.filter(id => id !== img.name);
                } else {
                    return [...prev, img.name];
                }
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === images.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(images.map(img => img.name));
        }
    };

    const getFullUrl = (url) => {
        if (!url) return '';
        return url;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Image size={24} />
                        {selectionMode ? (multiSelect ? "Sélection multiple" : "Sélectionner une image") : "Médiathèque"}
                    </h3>
                    {(multiSelect || !selectionMode) && images.length > 0 && (
                         <button 
                            onClick={toggleSelectAll}
                            className="text-sm text-primary font-bold hover:underline"
                        >
                            {selectedIds.length === images.length ? "Tout désélectionner" : "Tout sélectionner"}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Multi-select Confirm Button */}
                    {selectionMode && multiSelect && selectedIds.length > 0 && (
                         <button
                            onClick={handleConfirmSelection}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-md"
                        >
                            <Check size={18} /> Valider ({selectedIds.length})
                        </button>
                    )}

                    {selectedIds.length > 0 && !selectionMode && (
                        <button
                            onClick={handleBatchDelete}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
                        >
                            <Trash2 size={18} /> Supprimer ({selectedIds.length})
                        </button>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            id="library-upload"
                            className="hidden"
                            accept="image/*"
                            multiple // Allow multiple file selection
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor="library-upload"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg font-bold cursor-pointer transition whitespace-nowrap
                                ${uploading
                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                                    : 'bg-primary text-white hover:bg-orange-700 shadow-md transform hover:scale-105'}
                            `}
                        >
                            {uploading ? (
                                <>
                                    <Loader className="animate-spin" size={20} /> 
                                    {uploadProgress.total > 0 
                                        ? `Envoi ${uploadProgress.current}/${uploadProgress.total}`
                                        : 'Upload...'}
                                </>
                            ) : (
                                <>
                                    <Upload size={20} /> Ajouter des images
                                </>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold flex justify-between items-center flex-shrink-0">
                    {error}
                    <button onClick={() => setError(null)}><X size={16}/></button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {images.map((img, idx) => {
                        const isSelected = selectedIds.includes(img.name);
                        return (
                            <div
                                key={idx}
                                onClick={() => handleImageClick(img)}
                                className={`
                                    group relative h-56 w-full rounded-2xl overflow-hidden border transition-all duration-300 ease-out shadow-sm cursor-pointer
                                    ${selectionMode && multiSelect && isSelected ? 'ring-4 ring-primary/50' : ''}
                                    ${selectionMode ? 'hover:border-primary hover:shadow-lg' : ''}
                                    ${isSelected ? 'z-10 scale-95 shadow-inner border-primary ring-2 ring-primary opacity-90' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md hover:scale-[1.02]'}
                                `}
                            >
                                <img
                                    src={getFullUrl(img.url)}
                                    alt={img.name}
                                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                />

                                {/* Checkbox Indicator (Visible in Batch Delete OR Multi-Select Mode) */}
                                {(!selectionMode || multiSelect) && (
                                     <div className={`absolute top-2 right-2 z-20 transition-all duration-200 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-75'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white/50 border-white hover:bg-white'}`}>
                                            {isSelected && <Check size={14} strokeWidth={4} />}
                                        </div>
                                    </div>
                                )}

                                {/* Filename Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {(img.name || '').split('/').pop()}
                                </div>

                                {/* Overlay for Single Selection Mode */}
                                {selectionMode && !multiSelect && (
                                    <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100`}>
                                        <div className="bg-white text-primary px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 transform active:scale-95 transition" title="Sélectionner">
                                            <Check size={18} strokeWidth={3} /> Utiliser
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {images.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                            <Image size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">Aucune image trouvée</p>
                            <p className="text-sm">Téléversez des images pour commencer</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageLibrary;
