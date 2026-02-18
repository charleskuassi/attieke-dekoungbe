const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'attieke_library',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        format: 'webp', // Force la conversion en WebP à l'upload
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }] 
    },
});

const upload = multer({ storage: storage });

console.log('✅ Configuration Cloudinary RESTAURÉE pour:', process.env.CLOUDINARY_CLOUD_NAME);

module.exports = { cloudinary, upload };
