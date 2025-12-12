const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- CONFIGURATION CLOUDINARY ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'attieke_library', // Dossier Spécifié comme demandé
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        // transformation: [{ width: 800, crop: "limit", fetch_format: "auto" }] // Optionnel
    },
});

const upload = multer({ storage: storage });

// --- CONFIGURATION LOCAL (Pour lecture existante) ---
const PUBLIC_LIB_DIR = path.join(__dirname, '../../client/public/images/library');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            console.warn("⚠️ Tentative d'upload sans fichier");
            return res.status(400).json({ error: "Aucun fichier envoyé" });
        }

        // Multer-storage-cloudinary met l'URL Cloudinary dans req.file.path
        console.log("✅ Upload Cloudinary Réussi :", req.file.path);

        res.json({
            message: "Image uploadée sur Cloudinary !",
            url: req.file.path, // URL Absolue
            name: req.file.filename,
            filename: req.file.filename
        });

    } catch (error) {
        console.error("❌ CRITIQUE : Erreur Upload Cloudinary:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'upload", details: error.message });
    }
};

exports.getLibraryImages = async (req, res) => {
    // SECURITY BYPASS DEBUG: Ensure CORS doesn't block
    res.header("Access-Control-Allow-Origin", "*");

    console.log("📥 Requête reçue: GET /api/admin/library");
    try {
        let localImages = [];
        let cloudImages = [];

        console.log("📂 Chargement Médiathèque...");

        // 1. Lire images locales
        // Fix Path resolution
        const localPath = path.resolve(__dirname, '../../client/public/images/library');
        if (fs.existsSync(localPath)) {
            const files = fs.readdirSync(localPath);
            localImages = files
                .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                .map(file => ({
                    name: file,
                    url: `/images/library/${file}`,
                    source: 'local'
                }));
            console.log(`📂 ${localImages.length} images locales trouvées.`);
        } else {
            console.warn(`⚠️ Dossier local introuvable: ${localPath}`);
        }

        // 2. Lire images Cloudinary (Avec Timeout de Sécurité)
        try {
            console.log(`☁️ Interrogation Cloudinary (Dossier: attieke_library)...`);

            // Timeout de 5 secondes max pour éviter le hanging
            const cloudTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Cloudinary Timeout (5s)")), 5000)
            );

            const cloudRequest = cloudinary.api.resources({
                type: 'upload',
                prefix: 'attieke_library',
                max_results: 30, // Réduit pour performance
                direction: 'desc'
            });

            const result = await Promise.race([cloudRequest, cloudTimeout]);

            console.log(`☁️ Cloudinary Raw Result Count: ${result.resources.length}`);

            cloudImages = result.resources.map(res => ({
                name: res.public_id,
                url: res.secure_url,
                source: 'cloud',
                created_at: res.created_at
            }));

        } catch (cloudErr) {
            console.error("❌ Problème Cloudinary (Ignoré):", cloudErr.message);
            // On continue sans les images Cloudinary pour ne pas bloquer l'admin
        }

        const allImages = [...cloudImages, ...localImages];
        console.log(`✅ Total images renvoyées: ${allImages.length}`);

        res.json(allImages);

    } catch (error) {
        console.error("❌ Erreur lecture bibliothèque:", error);
        res.status(500).json({ error: "Impossible de lire la bibliothèque" });
    }
};

exports.uploadMiddleware = upload.single('image');
