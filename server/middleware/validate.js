const validate = (schema) => (req, res, next) => {
    if (!schema) return next();

    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({
            message: "Erreur de validation des données",
            details: error.details.map(d => d.message)
        });
    }

    next();
};

module.exports = validate;
