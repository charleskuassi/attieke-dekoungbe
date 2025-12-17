const { Testimonial } = require('../models');

exports.createTestimonial = async (req, res) => {
    try {
        console.log("Create Testimonial Body:", req.body);
        console.log("Create Testimonial File:", req.file);
        const { name, content } = req.body;
        // Image URL from file upload or body (if separate upload)
        // Assuming file upload middleware places file in req.file
        // If using Cloudinary middleware, req.file.path is the URL.
        // If using Cloudinary middleware, req.file.path is the URL.
        const image = req.file ? req.file.path : req.body.image;

        const testimonial = await Testimonial.create({
            name,
            content,
            image
        });

        res.status(201).json(testimonial);
    } catch (error) {
        console.error("Create Testimonial Error:", error);
        res.status(500).json({ message: "Erreur lors de la création du témoignage" });
    }
};

exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.findAll({ order: [['createdAt', 'DESC']] });
        res.json(testimonials);
    } catch (error) {
        console.error("Get Testimonials Error:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des témoignages" });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        await Testimonial.destroy({ where: { id } });
        res.json({ message: "Témoignage supprimé" });
    } catch (error) {
        console.error("Delete Testimonial Error:", error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
