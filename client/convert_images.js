import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const SOURCE_DIR = './raw_images';       // Dossier source
const DEST_DIR = './public/images';      // Dossier destination
const QUALITY = 85;                      // Qualité WebP
const TARGET_WIDTH = 1200;                // Largeur max plus généreuse pour le desktop

const supportedExtensions = ['.png', '.webp', '.tiff', '.gif', '.svg', '.avif', '.jpeg', '.jpg', '.jepg', '.JPG'];

async function processImages(directory) {
    if (!fs.existsSync(SOURCE_DIR)) {
        fs.mkdirSync(SOURCE_DIR);
        console.log(`📂 Dossier '${SOURCE_DIR}' créé.`);
    }

    if (!fs.existsSync(directory)) {
        console.log(`⚠️ Dossier ${directory} non trouvé.`);
        return;
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        const relativePath = path.relative(SOURCE_DIR, fullPath);

        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            await processImages(fullPath);
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();

        if (supportedExtensions.includes(ext)) {
            const nameWithoutExt = path.parse(entry.name).name;
            const newFileName = `${nameWithoutExt}.webp`;

            const finalFilePath = path.join(DEST_DIR, path.dirname(relativePath), newFileName);
            const finalDir = path.dirname(finalFilePath);

            if (!fs.existsSync(finalDir)) {
                fs.mkdirSync(finalDir, { recursive: true });
            }

            try {
                const absoluteInputPath = path.resolve(fullPath);

                // Conversion vers WebP (meilleur pour le SEO)
                await sharp(absoluteInputPath)
                    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
                    .webp({ quality: QUALITY, effort: 6 }) // effort 6 = meilleure compression
                    .toFile(finalFilePath);
                
                console.log(`✅ Optimisé (WebP) : ${entry.name} -> ${newFileName}`);
            } catch (err) {
                console.error(`❌ Erreur sur ${entry.name} :`, err.message);
            }
        }
    }
}

console.log("🚀 Lancement de l'optimisation SEO des images (Format WebP)...");
processImages(SOURCE_DIR).then(() => {
    console.log("✨ Optimisation terminée !");
});

