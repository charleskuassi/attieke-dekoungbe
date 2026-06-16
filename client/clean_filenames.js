import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.resolve(__dirname, 'public/images');

if (!fs.existsSync(imagesDir)) {
    console.error('Directory not found:', imagesDir);
    process.exit(1);
}

const files = fs.readdirSync(imagesDir);

console.log(`Found ${files.length} files. Cleaning...`);

let count = 0;

files.forEach(file => {
    // Only process images
    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) return;

    // Create a safe name:
    // 1. Remove accents
    // 2. Replace non-alphanumeric with dashes
    // 3. Lowercase
    // 4. Remove duplicate dashes
    const ext = path.extname(file);
    const name = path.basename(file, ext);

    const safeName = name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') // Replace non-chars with dash
        .replace(/-+/g, '-') // Merge dashes
        .replace(/^-|-$/g, ''); // Trim dashes

    const newFilename = `${safeName}${ext.toLowerCase()}`;

    if (file !== newFilename) {
        const oldPath = path.join(imagesDir, file);
        const newPath = path.join(imagesDir, newFilename);

        // Check if target exists (avoid overwrite collision)
        if (fs.existsSync(newPath)) {
            // Append random suffix
            const suffix = Math.floor(Math.random() * 1000);
            const suffixedName = `${safeName}-${suffix}${ext.toLowerCase()}`;
            const suffixedPath = path.join(imagesDir, suffixedName);
            fs.renameSync(oldPath, suffixedPath);
            console.log(`Renamed (collision): "${file}" -> "${suffixedName}"`);
        } else {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed: "${file}" -> "${newFilename}"`);
        }
        count++;
    }
});

console.log(`\nDone! Renamed ${count} files.`);
