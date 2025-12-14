const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
// IMPORT CRUCIAL : On utilise la config centrale
const { upload } = require('../config/cloudinary');

// On utilise le middleware Cloudinary ici
router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;
