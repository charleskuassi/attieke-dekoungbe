const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9À-ÿ ]+$')).required().messages({
        'string.base': 'Le nom doit être un texte',
        'string.empty': 'Le nom est obligatoire',
        'string.min': 'Le nom doit contenir au moins 3 caractères',
        'string.pattern.base': 'Le nom ne doit contenir que des lettres, chiffres et espaces'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'L\'adresse email est invalide',
        'string.empty': 'L\'email est obligatoire'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.empty': 'Le mot de passe est obligatoire'
    }),
    role: Joi.string().valid('customer', 'admin').default('customer')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'L\'adresse email est invalide',
        'string.empty': 'L\'email est obligatoire'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Le mot de passe est obligatoire'
    })
});

const orderSchema = Joi.object({
    items: Joi.array().min(1).required().messages({
        'array.min': 'Le panier ne peut pas être vide',
        'any.required': 'Le panier est obligatoire'
    }),
    total: Joi.number().positive().required().messages({
        'number.base': 'Le total doit être un nombre',
        'number.positive': 'Le total doit être positif'
    }),
    deliveryInfo: Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().pattern(new RegExp('^[0-9]{8,15}$')).required().messages({
            'string.pattern.base': 'Le numéro de téléphone doit être valide (8 chiffres minimum)'
        })
    }).required().messages({
        'any.required': 'Les informations de livraison sont obligatoires'
    }),
    paymentMethod: Joi.string(),
    transactionId: Joi.string().allow(null, '')
});

module.exports = {
    registerSchema,
    loginSchema,
    orderSchema
};
