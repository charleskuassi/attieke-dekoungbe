const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');

// --- CONFIGURATION ---
// Temporary buffer for raw uploads
const RAW_DIR = path.join(__dirname, '../raw_images');
// Final destination in CLIENT public folder (so they can be served directly by Nginx/Vite or via static middleware)
// Going up to root, then into client/public/images/library
const LIBRARY_DIR = path.join(__dirname, '../../client/public/images/library');

// Ensure directories exist
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
if (!fs.existsSync(LIBRARY_DIR)) fs.mkdirSync(LIBRARY_DIR, { recursive: true });

// Configure Multer (Temp Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, RAW_DIR);
    },
    filename: (req, file, cb) => {
        // Keep original name but sanitize
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}_${sanitized}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- HELPER: Image Processing ---
const processImage = async (filePath, originalName) => {
    try {
        const nameWithoutExt = path.parse(originalName).name.replace(/[^a-zA-Z0-9]/g, '_');
        const finalFilename = `${nameWithoutExt}_optimized.jpg`;
        const finalPath = path.join(LIBRARY_DIR, finalFilename);

        await sharp(filePath)
            .resize({ width: 800, withoutEnlargement: true }) // Max width 800px
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // Handle transparency
            .jpeg({ quality: 80, mozjpeg: true }) // Convert to JPG 80%
            .toFile(finalPath);

        // Remove raw file after successful conversion
        fs.unlinkSync(filePath);

        return finalFilename;
    } catch (error) {
        console.error("Sharp Processing Error:", error);
        // Clean up raw file even on error
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw error;
    }
};

// --- CONTROLLERS ---

// GET /api/admin/library
// List all optimized images
exports.getLibraryImages = (req, res) => {
    try {
        const files = fs.readdirSync(LIBRARY_DIR);
        // Filter mainly for images
        const images = files
            .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
            .map(file => ({
                name: file,
                url: `/images/library/${file}`, // Frontend accessible URL
                path: file
            }));

        // Return most recent first (if we tracked dates... filesystem order is arbitrary but often alphabetical)
        // For better UX, we could stat files, but simple list is fine for now.
        res.json(images.reverse());
    } catch (error) {
        console.error("Library List Error:", error);
        res.status(500).json({ error: "Failed to list library images" });
    }
};

// POST /api/admin/library/upload
// Handle upload + conversion
exports.uploadToLibrary = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
    }

    try {
        console.log(`Processing upload: ${req.file.originalname}`);
        const finalFilename = await processImage(req.file.path, req.file.originalname);

        res.json({
            success: true,
            message: "Image processed and added to library",
            filename: finalFilename,
            url: `/images/library/${finalFilename}`
        });
    } catch (error) {
        res.status(500).json({ error: "Image processing failed", details: error.message });
    }
};

exports.uploadMiddleware = upload.single('image');
