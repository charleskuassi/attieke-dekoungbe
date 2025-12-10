const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename to avoid encoding issues (e.g. with accents like "téléchargement")
        // We keep only alphanumeric characters, dots, and dashes.
        const fileExt = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, fileExt);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

        // Create unique filename with timestamp + sanitized name + extension
        const uniqueName = `${Date.now()}_${sanitizedName}${fileExt}`;
        cb(null, uniqueName);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image files are allowed.'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Upload controller method
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Return the public URL of the uploaded image with full domain
        // Try to get the full URL from request, fallback to localhost:5000
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
        
        // Build the absolute URL
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        console.log(`✓ Image uploaded: ${req.file.filename}`);
        console.log(`  URL: ${imageUrl}`);

        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
};

module.exports = {
    upload,
    uploadImage
};
