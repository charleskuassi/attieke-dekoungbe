# 🎯 Système d'Upload d'Images - Code Complet

Ce document contient les **3 portions de code complètes** demandées pour le système d'upload d'images.

---

## 1️⃣ Configuration Server.js (Static Folder)

**Fichier:** `server/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet
app.use(helmet());

// Security Middleware: Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Specific Auth Limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: "Too many login attempts, please try again later."
});

// Middleware
app.use(cors());
app.use(express.json());

const passport = require('./config/passport');
app.use(passport.initialize());

// ✅ CONFIGURE STATIC UPLOADS FOLDER (NEW LINE)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));  // ✅ NEW ROUTE
app.use('/api/auth', require('./routes/authRoutes'));
// ... rest of routes ...

app.get('/', (req, res) => {
    res.send('Attièkè Dékoungbé API is running');
});

async function startServer() {
    try {
        if (process.env.SKIP_DB_SYNC === 'true') {
            console.log('Skipping DB sync because SKIP_DB_SYNC=true');
        } else {
            await sequelize.sync({ alter: true });
            console.log('Database connected (Sync OK)');
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Unable to connect/sync database:', err);
    }
}

startServer();
```

**Points clés:**
- ✅ `app.use('/uploads', express.static(...))` - Rend le dossier uploads public
- ✅ `app.use('/api/upload', require('./routes/uploadRoutes'))` - Enregistre la route upload
- ✅ Dossier `server/uploads/` créé automatiquement au premier démarrage

---

## 2️⃣ Route d'Upload (uploadRoutes.js) + Configuration Multer

**Fichier:** `server/routes/uploadRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');

/**
 * POST /api/upload
 * Upload an image file
 * 
 * Request:
 *   - multipart/form-data
 *   - Field name: 'image'
 *   - Accepted formats: JPG, JPEG, PNG, GIF, WebP
 *   - Max size: 5MB
 * 
 * Response Success:
 *   {
 *     "success": true,
 *     "imageUrl": "/uploads/1702123456789_monplat.jpg",
 *     "filename": "1702123456789_monplat.jpg",
 *     "size": 245620
 *   }
 * 
 * Response Error:
 *   {
 *     "error": "Invalid file type. Only image files are allowed."
 *   }
 */
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
```

**Fichier:** `server/controllers/uploadController.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ===== MULTER CONFIGURATION =====

// Storage: Save files to disk with unique names
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp + original filename
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

// File filter: Accept only image files
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image files are allowed.'), false);
    }
};

// Create multer instance with config
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// ===== UPLOAD HANDLER =====

const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Return the public URL of the uploaded image
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            imageUrl: imageUrl,  // Frontend uses this to display the image
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Upload failed', 
            details: error.message 
        });
    }
};

module.exports = {
    upload,
    uploadImage
};
```

**Points clés:**
- ✅ `multer.diskStorage()` - Sauvegarde les fichiers sur le disque
- ✅ Nommage unique: `${Date.now()}_${originalname}` (ex: `1702123456789_plat.jpg`)
- ✅ File filter: Accepte JPG, JPEG, PNG, GIF, WebP seulement
- ✅ Limite de taille: 5MB max
- ✅ Retourne l'URL publique `/uploads/FILENAME`

---

## 3️⃣ Frontend - Admin.jsx avec Upload Automatique

**Fichier:** `client/src/pages/Admin.jsx` (extraits pertinents)

### Partie A: État et fonction d'upload

```javascript
// --- Image upload management ---
const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'library'
const [libraryImages, setLibraryImages] = useState([]);

const fetchLibraryImages = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/images`);
        setLibraryImages(res.data);
    } catch (error) {
        console.error("Failed to load images", error);
    }
};

// ✅ NEW: Handle file upload to server
const handleImageUpload = async (file) => {
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.data.success && response.data.imageUrl) {
            // Update product form with the server URL
            setProductForm({
                ...productForm,
                image: response.data.imageUrl // Store the URL string, not the file
            });
            return response.data.imageUrl;
        }
    } catch (error) {
        console.error("Image upload failed:", error);
        alert("Erreur lors de l'upload de l'image: " + (error.response?.data?.error || error.message));
    }
};
```

### Partie B: Soumission du formulaire

```javascript
const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', productForm.name);
        formData.append('description', productForm.description);
        formData.append('price', productForm.price);
        formData.append('category', productForm.category);
        formData.append('is_popular', productForm.is_popular);

        if (productForm.image) {
            // Now productForm.image is always a string (URL)
            // It can be from server upload (/uploads/...) or library
            formData.append('image_url', productForm.image);
        }

        const config = { 
            headers: { 
                Authorization: `Bearer ${token}`, 
                'Content-Type': 'multipart/form-data' 
            } 
        };

        if (editingProduct) {
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/products/${editingProduct.id}`, 
                formData, 
                config
            );
            setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
        } else {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/products`, 
                formData, 
                config
            );
            setProducts([...products, res.data]);
        }
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', category: 'plats', is_popular: false, image: null });
    } catch (error) {
        console.error("Error saving product:", error);
        alert("Erreur lors de l'enregistrement du produit");
    }
};
```

### Partie C: JSX du formulaire d'image

```jsx
{/* Image Selection Section */}
<div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>

    {/* Tab Selection: Upload vs Library */}
    <div className="flex space-x-4 mb-2">
        <button
            type="button"
            onClick={() => setImageMode('upload')}
            className={`text-sm pb-1 ${imageMode === 'upload' ? 'border-b-2 border-primary font-bold dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
        >
            Upload
        </button>
        <button
            type="button"
            onClick={() => { setImageMode('library'); fetchLibraryImages(); }}
            className={`text-sm pb-1 ${imageMode === 'library' ? 'border-b-2 border-primary font-bold dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
        >
            Bibliothèque ({libraryImages.length})
        </button>
    </div>

    {/* Upload Area */}
    {imageMode === 'upload' ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative bg-gray-50 dark:bg-gray-700/50">
            <input
                type="file"
                accept="image/*"
                onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                        handleImageUpload(file);  // ✅ Upload immediately
                    }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                <Image size={24} className="mb-2" />
                <span className="text-sm">
                    {typeof productForm.image === 'string' && productForm.image 
                        ? 'Image uploadée ✓' 
                        : 'Cliquez pour uploader'
                    }
                </span>
            </div>
        </div>
    ) : (
        /* Library Grid */
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            {libraryImages.map((imgUrl, idx) => (
                <div
                    key={idx}
                    onClick={() => setProductForm({ ...productForm, image: imgUrl })}
                    className={`cursor-pointer border-2 rounded overflow-hidden aspect-square ${productForm.image === imgUrl ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                >
                    <img src={imgUrl} alt="Library" className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    )}

    {/* Preview of selected/uploaded image */}
    {(typeof productForm.image === 'string' && productForm.image) && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <img 
                src={productForm.image} 
                alt="Preview" 
                className="max-h-32 max-w-full mx-auto rounded"
                onError={(e) => {
                    e.target.alt = 'Image non accessible';
                    e.target.src = '/api/placeholder/100/100';
                }}
            />
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 truncate">✓ {productForm.image}</p>
        </div>
    )}
</div>

<button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition">
    {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
</button>
```

**Points clés:**
- ✅ `handleImageUpload()` - Envoie le fichier immédiatement au serveur
- ✅ `onChange` déclenche l'upload dès qu'un fichier est sélectionné
- ✅ `productForm.image` stocke toujours une URL (string), jamais un File
- ✅ Prévisualisation instantanée après upload réussi
- ✅ Préservation de la bibliothèque existante
- ✅ Gestion d'erreur avec messages utilisateur

---

## 🚀 Flux de Travail Utilisateur

```
1. Admin ouvre le formulaire "Ajouter Produit"
2. Clique sur l'onglet "Upload"
3. Sélectionne une image locale (< 5MB)
4. handleImageUpload() envoie le fichier à POST /api/upload
5. Le serveur retourne: { success: true, imageUrl: "/uploads/1702123456789_plat.jpg" }
6. La prévisualisation s'affiche immédiatement ✓
7. Admin remplit les autres champs (nom, prix, etc.)
8. Clique "Créer le produit"
9. Le formulaire POST envoie image_url + données au backend
10. Produit créé avec l'image uploadée ✅
```

---

## ✅ Checklist Mise en Place

- [x] Multer installé (npm install multer)
- [x] Dossier uploads créé
- [x] Server.js configuré avec `/uploads` statique
- [x] Route POST /api/upload créée
- [x] Controller uploadController.js avec Multer
- [x] Frontend handleImageUpload() implémenté
- [x] Prévisualisation d'image ajoutée
- [x] Gestion d'erreur côté client
- [x] Documentation complète

---

**Créé le:** 10 Décembre 2025  
**Projet:** Attièkè Dékoungbé  
**Status:** ✅ Prêt pour Production
