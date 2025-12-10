# 🖼️ Système d'Upload d'Images - Documentation Complète

## Architecture Mise en Place

### 1. **Backend (Node.js + Express + Multer)**

#### Fichier: `server/controllers/uploadController.js`
- **Multer Configuration**: Configuration du stockage disque avec timestamp + extension
- **File Filter**: Accepte uniquement les formats image (JPEG, PNG, GIF, WebP)
- **Limite de taille**: 5MB max par fichier
- **Fonction uploadImage**: Retourne l'URL publique de l'image uploadée

#### Fichier: `server/routes/uploadRoutes.js`
- **Route POST /api/upload**: 
  - Accepte un fichier multipart `image`
  - Utilise `upload.single('image')` de Multer
  - Retourne une réponse JSON avec `imageUrl`

#### Fichier: `server/server.js`
- **Statique: `/uploads`** - Les images uploadées sont accessibles via `http://localhost:5000/uploads/FILENAME`
- **Route enregistrée**: `app.use('/api/upload', require('./routes/uploadRoutes'))`

#### Dossier: `server/uploads/`
- Dossier créé automatiquement au démarrage du serveur
- Stocke tous les fichiers uploadés avec noms uniques : `TIMESTAMP_originalname.ext`

---

### 2. **Frontend (React + Axios)**

#### Fichier: `client/src/pages/Admin.jsx`

**Nouvelle fonction `handleImageUpload(file)`:**
```javascript
- Crée un FormData avec le fichier
- Envoie POST à /api/upload
- Récupère l'imageUrl du serveur
- Met à jour productForm.image avec l'URL (pas le File)
- Affiche un message de succès avec prévisualisation
```

**Modifications du formulaire:**
1. **Input File** - onChange appelle `handleImageUpload(file)` au lieu de stocker le fichier localement
2. **Affichage** - Montre "Image uploadée ✓" après upload réussi
3. **Prévisualisation** - Affiche l'image avec contrôle d'erreur
4. **Bibliothèque** - Continue de fonctionner (sélection d'images existantes)

---

## 🚀 Flux Utilisateur Complet

### Cas 1: Upload depuis l'ordinateur
```
1. Admin clique sur "Upload"
2. Sélectionne une image local (< 5MB)
3. Le onChange déclenche handleImageUpload()
4. Axios envoie le fichier à POST /api/upload
5. Le serveur sauvegarde le fichier avec un nom unique
6. Retourne: { success: true, imageUrl: "/uploads/1702123456789_maplat.jpg" }
7. La prévisualisation s'affiche immédiatement
8. Admin clique "Créer le produit"
9. Le formulaire envoie image_url au backend produit
```

### Cas 2: Sélection depuis la bibliothèque
```
1. Admin clique sur "Bibliothèque"
2. Voit les images existantes dans le code
3. Clique sur une image
4. productForm.image = "path/to/library/image.jpg"
5. Admin clique "Créer le produit"
6. Le formulaire envoie image_url au backend produit
```

---

## 📡 Endpoints API

### `POST /api/upload`
**Request:**
```
Content-Type: multipart/form-data
Body: {
  "image": <File>
}
```

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "/uploads/1702123456789_monplat.jpg",
  "filename": "1702123456789_monplat.jpg",
  "size": 245620
}
```

**Response (Error):**
```json
{
  "error": "Invalid file type. Only image files are allowed.",
  "details": "..."
}
```

---

## 🔧 Configuration Multer

**Storage Location:** `server/uploads/`
**Naming Pattern:** `{Timestamp}_{originalFilename}`
**Accepted Formats:** JPG, JPEG, PNG, GIF, WebP
**Max File Size:** 5MB
**Public URL Base:** `/uploads/`

---

## ✅ Points de Contrôle

- ✅ Multer installé (package.json)
- ✅ Dossier uploads créé automatiquement
- ✅ Middleware statique configuré dans server.js
- ✅ Routes uploadRoutes.js créées et intégrées
- ✅ Controller uploadController.js avec validation
- ✅ Frontend handleImageUpload() implémenté
- ✅ Prévisualisation d'image ajoutée
- ✅ Erreurs gérées côté client avec alerts

---

## 🐛 Dépannage

### L'image n'upload pas
- Vérifier que le fichier < 5MB
- Vérifier que c'est un format image valide (JPG, PNG, GIF, WebP)
- Regarder la console navigateur pour les erreurs axios
- Vérifier que le serveur écoute sur le bon port (5000/5001)

### L'image upload mais ne s'affiche pas
- Vérifier que `/uploads` est configuré en statique dans server.js
- Vérifier l'URL retournée: doit commencer par `/uploads/`
- Tester manuellement: `http://localhost:5000/uploads/FILENAME`

### Erreur "Too many requests"
- Le rate limiter est actif (5000 req/15min)
- C'est normal en développement

---

## 📦 Stockage à Terme

**Option 1 (Actuellement):** Disque local `server/uploads/`
- Parfait pour développement et petite production

**Option 2 (Pour plus tard):** Cloud Storage (AWS S3, Google Cloud Storage, Cloudinary)
- Modifier uploadController.js pour envoyer à un service cloud
- Avantage: scalable, automatiquement distribué

---

## 💡 Prochaines Améliorations Possibles

- [ ] Compression d'images avant stockage
- [ ] Génération de thumbnails automatiques
- [ ] Upload multiple (plusieurs fichiers)
- [ ] Glisser-déposer (drag & drop)
- [ ] Progression d'upload (progress bar)
- [ ] Suppression d'images uploadées
- [ ] Stockage cloud (S3, etc.)

---

**Créé le:** 10 Décembre 2025
**Projet:** Attièkè Dékoungbé
**Status:** ✅ Production Ready
