const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- CONFIGURATION CLOUDINARY ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'attieke_library',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, crop: "limit", fetch_format: "auto" }]
    },
});

const upload = multer({ storage: storage });

// --- CONFIGURATION LOCAL (Pour lecture existante) ---
const PUBLIC_LIB_DIR = path.join(__dirname, '../../client/public/images/library');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Aucun fichier envoyé" });

        // Multer-storage-cloudinary met l'URL Cloudinary dans req.file.path
        res.json({
            message: "Image uploadée sur Cloudinary !",
            url: req.file.path, // URL Absolue
            filename: req.file.filename
        });

    } catch (error) {
        console.error("Erreur Upload Cloudinary:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'upload" });
    }
};

exports.getLibraryImages = async (req, res) => {
    try {
        let localImages = [];
        let cloudImages = [];

        // 1. Lire images locales existantes
        if (fs.existsSync(PUBLIC_LIB_DIR)) {
            const files = fs.readdirSync(PUBLIC_LIB_DIR);
            localImages = files
                .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                .map(file => ({
                    name: file,
                    url: `/images/library/${file}`, // URL Relative
                    source: 'local'
                }));
        }

        // 2. Lire images Cloudinary (Optionnel, si API Admin dispo)
        try {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'attieke_library', // Filtre par dossier
                max_results: 50
            });
            cloudImages = result.resources.map(res => ({
                name: res.public_id,
                url: res.secure_url, // URL Absolue
                source: 'cloud'
            }));
        } catch (cloudErr) {
            console.warn("Impossible de lister images Cloudinary (Check API Key/Permissions):", cloudErr.message);
        }

        // Fusion des deux sources
        res.json([...cloudImages, ...localImages]);

    } catch (error) {
        console.error("Erreur lecture bibliothèque:", error);
        res.status(500).json({ error: "Impossible de lire la bibliothèque" });
    }
};

exports.uploadMiddleware = upload.single('image');
