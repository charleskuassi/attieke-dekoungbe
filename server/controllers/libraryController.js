const { cloudinary } = require('../config/cloudinary');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            console.warn("⚠️ Tentative d'upload sans fichier");
            return res.status(400).json({ error: "Aucun fichier envoyé" });
        }

        console.log("✅ Upload Réussi :", req.file.path);

        res.json({
            url: req.file.path,
            name: req.file.filename
        });

    } catch (error) {
        console.error("Erreur Upload Cloudinary:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'upload" });
    }
};

exports.getLibraryImages = async (req, res) => {
    try {
        console.log("📂 Recherche d'images (Optimisé) : attieke_library");

        // Use Search API for better performance and filtering
        const result = await cloudinary.search
            .expression('folder:attieke_library')
            .sort_by('created_at', 'desc')
            .max_results(50)
            .execute();

        const images = result.resources.map(res => ({
            url: res.secure_url,
            name: res.public_id
        }));

        console.log(`✅ ${images.length} images trouvées (Search API).`);
        res.json(images);

    } catch (error) {
        console.error("Erreur Recherche Bibliothèque:", error);
        // Fallback to Admin API if Search API fails (e.g. rate limit or permission)
        try {
             console.log("⚠️ Fallback to Admin API...");
             const fallbackResult = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'attieke_library', 
                max_results: 50,
                direction: 'desc'
            });
            const fallbackImages = fallbackResult.resources.map(res => ({
                url: res.secure_url,
                name: res.public_id
            }));
            res.json(fallbackImages);
        } catch (fallbackError) {
             console.error("❌ Echec total lecture:", fallbackError);
             res.json([]);
        }
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { public_id } = req.body;

        if (!public_id) {
            console.error("❌ Delete Image Error: Missing public_id");
            return res.status(400).json({ error: "Public ID manquant" });
        }

        console.log(`🗑️ Tentative de suppression Cloudinary: ${public_id}`);

        // Cloudinary destroy expects the public_id (including folder)
        const result = await cloudinary.uploader.destroy(public_id);

        console.log("✅ Résultat Cloudinary:", result);

        if (result.result === 'ok' || result.result === 'not found') {
            // 'not found' is also a success for us (it's gone)
            res.json({ success: true, message: "Image supprimée avec succès" });
        } else {
            console.error("⚠️ Cloudinary Warning:", result);
            res.status(500).json({ error: "Échec suppression Cloudinary: " + result.result });
        }

    } catch (error) {
        console.error("❌ Erreur Serveur Suppression Image:", error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression" });
    }
};
