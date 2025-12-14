// Cette fonction détecte si l'image vient du Cloud ou du serveur local
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg'; // Image par défaut

    // Si ça commence par "http", c'est Cloudinary (ou une url externe)
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
        return imagePath;
    }

    // Sinon, c'est une vieille image locale (on ajoute l'URL du serveur)
    // Assure-toi que VITE_API_URL est bien défini dans ton .env frontend
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Nettoyer le chemin pour éviter les doubles slashes si nécessaire, 
    // mais généralement apiUrl n'a pas de slash de fin et imagePath commence par /.
    // Si imagePath ne commence pas par /, on l'ajoute.
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${apiUrl}${cleanPath}`;
};
