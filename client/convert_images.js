import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const SOURCE_DIR = './raw_images';       // Dossier source (images en vrac) à la racine de CLIENT
const DEST_DIR = './public/images';      // Dossier destination (images optimisées)
const QUALITY = 80;                      // Qualité JPG
const TARGET_WIDTH = 800;                // Largeur max

const supportedExtensions = ['.png', '.webp', '.tiff', '.gif', '.svg', '.avif', '.jpeg', '.jpg', '.jepg', '.JPG'];

async function processImages(directory) {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log(`📂 Création du dossier source : ${SOURCE_DIR}`);
        console.log(`ℹ️ Placez vos images dans ce dossier et relancez la commande.`);
        fs.mkdirSync(SOURCE_DIR);
        return;
    }

    if (!fs.existsSync(DEST_DIR)) {
        console.log(`📂 Création du dossier destination : ${DEST_DIR}`);
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    if (entries.length === 0) {
        console.log("⚠️ Le dossier source est vide. Ajoutez des images dans 'raw_images' !");
        return;
    }

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        // SOURCE_DIR est relatif, on doit calculer le chemin relatif pour garder la structure
        const relativePath = path.relative(SOURCE_DIR, fullPath);

        if (entry.isDirectory()) {
            await processImages(fullPath);
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();

        if (supportedExtensions.includes(ext)) {
            const nameWithoutExt = path.parse(entry.name).name;
            const newFileName = `${nameWithoutExt}.jpg`;

            // On conserve la structure des sous-dossiers dans DEST_DIR
            const finalFilePath = path.join(DEST_DIR, path.dirname(relativePath), newFileName);
            const finalDir = path.dirname(finalFilePath);

            if (!fs.existsSync(finalDir)) {
                fs.mkdirSync(finalDir, { recursive: true });
            }

            try {
                // Utilisation du chemin ABSOLU pour éviter les erreurs "Input file is missing" sur Windows
                const absoluteInputPath = path.resolve(fullPath);

                await sharp(absoluteInputPath)
                    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
                    .flatten({ background: { r: 255, g: 255, b: 255 } }) // Replace transparency with white
                    .jpeg({ quality: QUALITY, mozjpeg: true })
                    .toFile(finalFilePath);
                console.log(`✅ Converti : ${entry.name} -> ${newFileName}`);
            } catch (err) {
                console.error(`❌ Erreur sur ${entry.name} :`, err.message);
            }
        } else {
            console.log(`⏩ Ignoré (Extension non supportée) : ${entry.name}`);
        }
    }
}

console.log("🚀 Démarrage de l'optimisation des images...");
processImages(SOURCE_DIR);
