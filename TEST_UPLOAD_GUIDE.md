# 🧪 Guide de Test du Système d'Upload

## ✅ Pré-requis

- [ ] Node.js et npm installés
- [ ] Dossier du projet ouvert dans VS Code
- [ ] Backend et Frontend en développement (npm run dev)

---

## 🚀 Test 1: Upload Simple (cURL)

### Terminal dans `server/`

```bash
# Créer un petit fichier image de test (PNG blanc 1x1px)
node test_upload.js
```

**Résultat attendu:**
```
✓ Created test image
📤 Uploading test image...
✅ Upload successful!

Response:
{
  "success": true,
  "imageUrl": "/uploads/1702123456789_test_image.png",
  "filename": "1702123456789_test_image.png",
  "size": 80
}

📁 Image accessible at: http://localhost:5000/uploads/1702123456789_test_image.png
✓ Cleanup complete
```

---

## 🎯 Test 2: Upload via Navigateur

### Dans l'Admin Panel

1. **Ouvrir la page Admin**
   - URL: http://localhost:5173/admin
   - Se connecter si nécessaire

2. **Section "Ajouter Produit"**
   - Cliquer sur "+ Ajouter un produit"
   - Le modal s'ouvre

3. **Onglet "Upload"**
   - Vérifier que "Upload" est sélectionné
   - Cliquer sur la zone "Cliquez pour uploader"

4. **Sélectionner une image**
   - Choisir une image de votre ordinateur
   - Formats acceptés: JPG, PNG, GIF, WebP
   - Taille max: 5MB

5. **Attendre l'upload**
   - Observe la console du navigateur (F12)
   - Tu dois voir:
     ```
     axios.post('/api/upload') response:
     { success: true, imageUrl: "/uploads/..." }
     ```

6. **Vérifier la prévisualisation**
   - ✅ L'image s'affiche immédiatement
   - ✅ Texte "Image uploadée ✓"
   - ✅ URL affichée en vert

---

## 📋 Test 3: Création de Produit avec Upload

### Suite du Test 2

1. **Remplir les champs du produit**
   - Nom: "Mon Plat Uploadé"
   - Description: "Test d'upload de image"
   - Prix: 5000
   - Catégorie: "plats"
   - Image: (déjà uploadée de Test 2)

2. **Soumettre le formulaire**
   - Cliquer "Créer le produit"
   - Observer la console (F12)

3. **Vérifier la réponse**
   ```
   POST /api/products
   Body: {
     name: "Mon Plat Uploadé",
     description: "Test d'upload de image",
     price: 5000,
     category: "plats",
     is_popular: false,
     image_url: "/uploads/1702123456789_monimage.jpg"
   }
   ```

4. **Produit créé**
   - ✅ Modal se ferme
   - ✅ Produit apparaît dans la liste
   - ✅ Image affichée correctement

---

## 🔍 Test 4: Vérifier les Fichiers Uploadés

### Terminal dans `server/`

```bash
# Lister les fichiers uploadés
ls -lh uploads/

# Affichage attendu:
# -rw-r--r-- user group 245620 10 Dec 15:23 1702123456789_monimage.jpg
# -rw-r--r-- user group 156200 10 Dec 15:24 1702123457890_image2.png
```

---

## 🧪 Test 5: Test de Sécurité - Rejeter un fichier invalide

### Dans l'Admin Panel

1. **Essayer d'uploader un fichier non-image**
   - Créer un fichier `test.txt` avec du texte
   - Essayer de le sélectionner dans le formulaire

2. **Résultat attendu**
   - Erreur: "Invalid file type. Only image files are allowed."
   - Alert rouge dans le navigateur
   - Fichier rejeté (non stocké sur disque)

3. **Fichiers acceptés**
   - ✅ JPG, JPEG
   - ✅ PNG
   - ✅ GIF
   - ✅ WebP
   - ❌ Tout le reste

---

## 📊 Test 6: Test de Taille - Rejeter un fichier trop gros

### Dans l'Admin Panel

1. **Créer un grand fichier image**
   ```bash
   # Dans terminal (7MB > 5MB limit)
   dd if=/dev/urandom of=large.jpg bs=1M count=7
   ```

2. **Essayer d'uploader**
   - Sélectionner large.jpg

3. **Résultat attendu**
   - Erreur: "File too large" ou similaire
   - Message d'erreur affiché à l'utilisateur
   - Fichier rejeté

---

## 🔗 Test 7: Vérifier l'URL de l'image

### Dans le navigateur

```bash
# Ouvrir directement l'URL de l'image uploadée
http://localhost:5000/uploads/1702123456789_monimage.jpg

# Résultat attendu:
# ✅ Image affichée correctement
# ✅ No 404 error
```

---

## 🗂️ Test 8: Test de Bibliothèque (Existant)

### Dans l'Admin Panel

1. **Onglet "Bibliothèque"**
   - Cliquer sur "Bibliothèque"
   - Les images existantes s'affichent

2. **Sélectionner une image**
   - Cliquer sur une image de la bibliothèque
   - Image sélectionnée (bordure verte)

3. **Créer un produit**
   - Remplir nom, prix, etc.
   - Créer le produit
   - ✅ Image de bibliothèque utilisée (ancien système préservé)

---

## 📱 Test 9: Test Multi-Upload Séquenciel

### Dans l'Admin Panel

1. **Créer 3 produits avec upload**
   - Produit 1: Image1.jpg → Upload automatique
   - Produit 2: Image2.png → Upload automatique
   - Produit 3: Image3.gif → Upload automatique

2. **Vérifier en terminal**
   ```bash
   ls -lh server/uploads/ | wc -l
   # Doit être ≥ 3 fichiers
   ```

3. **Vérifier les noms uniques**
   ```bash
   ls server/uploads/
   # 1702123456789_image1.jpg
   # 1702123456790_image2.png    ← Timestamp différent
   # 1702123456791_image3.gif    ← Timestamp différent
   ```

---

## 🐛 Troubleshooting

### Problème: "Cannot POST /api/upload"

**Cause:** Route non enregistrée
**Solution:**
```javascript
// Vérifier dans server.js:
app.use('/api/upload', require('./routes/uploadRoutes'));
// Doit être présente
```

---

### Problème: "ENOENT: no such file or directory, open 'uploads/...'"

**Cause:** Dossier uploads n'existe pas
**Solution:**
```bash
# Dans server/:
mkdir uploads

# Ou vérifier que uploadController.js crée le dossier au démarrage
```

---

### Problème: "Error: Too many files open"

**Cause:** Filehandles pas fermés
**Solution:** Redémarrer le serveur
```bash
# Arrêter: Ctrl+C
# Redémarrer: npm run dev
```

---

### Problème: Image upload mais 404 au chargement

**Cause:** Static middleware manquant ou mal configuré
**Solution:**
```javascript
// Dans server.js, vérifier:
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Doit être AVANT les routes
```

---

## 📋 Checklist Finale

- [ ] Upload simple fonctionne (cURL test)
- [ ] Upload via navigateur fonctionne
- [ ] Image s'affiche immédiatement après upload
- [ ] Création de produit avec image réussit
- [ ] Fichiers uploadés visibles dans `server/uploads/`
- [ ] Fichiers non-image sont rejetés
- [ ] Fichiers > 5MB sont rejetés
- [ ] Images accessibles via URL `/uploads/...`
- [ ] Bibliothèque existante fonctionne toujours
- [ ] Erreurs affichées à l'utilisateur

---

## 🎬 Démonstration Complète (5-10 min)

```
0. Terminal 1: cd server && npm run dev
1. Terminal 2: cd client && npm run dev
2. Navigateur: http://localhost:5173/admin
3. Cliquer: "+ Ajouter un produit"
4. Select: Tab "Upload"
5. Upload: image.jpg depuis l'ordinateur
6. Attendre: "Image uploadée ✓"
7. Fill: Nom, Prix, Catégorie
8. Click: "Créer le produit"
9. Verify: Produit créé avec image ✅
10. Check: server/uploads/ contient le fichier ✅
```

---

## 📞 Support

Si un test échoue:
1. Ouvrir la console du navigateur (F12)
2. Chercher les erreurs en rouge
3. Ouvrir les logs du serveur (Terminal)
4. Vérifier les fichiers créés dans `server/uploads/`

**Erreurs courants:**
- `CORS error` → Server CORS mal configuré
- `Multer field name mismatch` → Vérifier 'image' en FormData
- `Path not found` → Dossier uploads manquant

---

**Test Date:** 10 Décembre 2025  
**Durée estimée:** 15-30 minutes  
**Validation:** Si tous les tests passent → System OK ✅
