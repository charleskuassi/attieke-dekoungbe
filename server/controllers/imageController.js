const fs = require('fs');
const path = require('path');

const getImages = (req, res) => {
    // Point relative to server/controllers -> server -> client/public/images
    // Actually ../../client/public/images
    const imagesDir = path.join(__dirname, '../../client/public/images');

    try {
        if (!fs.existsSync(imagesDir)) {
            return res.status(404).json({ message: 'Images directory not found' });
        }

        const files = fs.readdirSync(imagesDir);
        // Filter for image files only
        const images = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

        // Return full relative paths for frontend use, e.g., "/images/my%20file.jpg"
        const imageUrls = images.map(file => `/images/${encodeURIComponent(file)}`);

        res.json(imageUrls);
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getImages };
