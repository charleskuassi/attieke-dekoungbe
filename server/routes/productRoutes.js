const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', protect, upload.single('image'), productController.createProduct);
router.put('/:id', protect, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;
