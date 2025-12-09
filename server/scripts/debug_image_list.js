const fs = require('fs');
const path = require('path');

const debugImages = () => {
    // Mimic the controller logic
    // Script is in server/scripts, so __dirname is server/scripts
    // Controller is in server/controllers.
    // We want to test relative to server root basically.

    // Adjusted logic for script location:
    // script: server/scripts/debug_image_list.js
    // target: client/public/images
    // path: ../../client/public/images

    const imagesDir = path.join(__dirname, '../../client/public/images');
    console.log('Target Directory:', imagesDir);

    try {
        if (!fs.existsSync(imagesDir)) {
            console.log('❌ Directory NOT found!');
            return;
        }
        console.log('✅ Directory found.');

        const files = fs.readdirSync(imagesDir);
        const images = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

        console.log(`Found ${images.length} images.`);
        if (images.length > 0) {
            console.log('Sample images:', images.slice(0, 3));
        }

        const imageUrls = images.map(file => `/images/${file}`);
        console.log('Sample URLs:', imageUrls.slice(0, 3));

    } catch (error) {
        console.error('Error:', error);
    }
};

debugImages();
