const fs = require('fs');
const path = require('path');
const multer = require('multer');
// const sharp = require('sharp'); // Temporarily disabled

// --- CONFIGURATION ---
const RAW_DIR = path.join(__dirname, '../raw_images');
const PUBLIC_LIB_DIR = path.join(__dirname, '../../client/public/images/library');

if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_LIB_DIR)) fs.mkdirSync(PUBLIC_LIB_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, RAW_DIR),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage: storage });

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Aucun fichier envoyé" });

        const rawFilePath = req.file.path;
        const finalFilename = req.file.filename; // Use raw filename for now
        const finalFilePath = path.join(PUBLIC_LIB_DIR, finalFilename);

        // Skip Sharp for now to avoid crashes
        fs.copyFileSync(rawFilePath, finalFilePath);
        fs.unlinkSync(rawFilePath);

        const publicUrl = `/images/library/${finalFilename}`;

        res.json({
            message: "Image ajoutée (Optimisation désactivée)",
            url: publicUrl,
            filename: finalFilename
        });

    } catch (error) {
        console.error("Erreur traitement image:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getLibraryImages = (req, res) => {
    try {
        if (!fs.existsSync(PUBLIC_LIB_DIR)) return res.json([]);
        const files = fs.readdirSync(PUBLIC_LIB_DIR);
        const images = files
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .map(file => ({
                name: file,
                url: `/images/library/${file}`,
                path: file
            }));
        res.json(images);
    } catch (error) {
        console.error("Erreur lecture bibliothèque:", error);
        res.status(500).json({ error: "Impossible de lire la bibliothèque" });
    }
};

exports.uploadMiddleware = upload.single('image');
