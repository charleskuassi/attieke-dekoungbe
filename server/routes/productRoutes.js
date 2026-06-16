const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/seed-magic', productController.seedProducts);
router.get('/', productController.getAllProducts);
router.post('/', protect, admin, upload.none(), productController.createProduct);
router.put('/:id', protect, admin, upload.none(), productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
