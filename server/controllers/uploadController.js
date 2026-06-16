exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
        }

        console.log("✅ Upload Cloudinary réussi :", req.file.path);

        // ⚠️ RUSE TECHNIQUE : On garde les mêmes clés JSON que l'ancien système
        // Le frontend attend 'imageUrl', on lui donne 'imageUrl' (même si c'est une URL absolue maintenant)
        res.json({
            success: true,
            imageUrl: req.file.path,      // C'est ici que ça change : URL absolue (https://...)
            filename: req.file.filename,  // Nom unique Cloudinary
            size: req.file.size || 0      // Taille (optionnel)
        });

    } catch (error) {
        console.error("❌ Erreur upload:", error);
        res.status(500).json({ success: false, error: "Erreur lors de l'upload vers le Cloud" });
    }
};
