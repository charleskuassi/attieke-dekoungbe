// Cette fonction détecte si l'image vient du Cloud ou du serveur local
// Et elle privilégie les versions WebP optimisées
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';

    // Si ça commence par "http", on garde tel quel
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // On privilégie le WebP pour les images locales
    let optimizedPath = imagePath;
    if (imagePath.match(/\.(jpg|jpeg|png)$/i)) {
        optimizedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const cleanPath = optimizedPath.startsWith('/') ? optimizedPath : `/${optimizedPath}`;

    return `${apiUrl}${cleanPath}`;
};

