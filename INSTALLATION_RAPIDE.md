# 🚀 INSTALLATION RAPIDE - Système d'Upload d'Images

## ⏱️ Temps: 5 minutes

---

## ✅ Vérification Pré-requis

```bash
# Vérifier que multer est installé
cd server
npm list multer

# Résultat attendu:
# ├── multer@2.0.2
# (Si pas présent, npm install multer)
```

---

## 📝 Étape 1: Vérifier server.js

**Fichier:** `server/server.js`

**À vérifier (ligne ~55):**
```javascript
// ✅ Cette ligne doit exister:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Et cette ligne aussi (après les autres routes):
app.use('/api/upload', require('./routes/uploadRoutes'));
```

**Status:** ✅ Déjà fait

---

## 📁 Étape 2: Créer le Dossier uploads

```bash
cd server
mkdir uploads
```

**Status:** ✅ Déjà créé

---

## 📄 Étape 3: Créer uploadController.js

**Fichier:** `server/controllers/uploadController.js`

Copier le contenu de `UPLOAD_CODE_COMPLET.md` → Section 2️⃣ (uploadController.js)

OU: C'est déjà créé ✅

---

## 📄 Étape 4: Créer uploadRoutes.js

**Fichier:** `server/routes/uploadRoutes.js`

Copier le contenu de `UPLOAD_CODE_COMPLET.md` → Section 2️⃣ (uploadRoutes.js)

OU: C'est déjà créé ✅

---

## 🎨 Étape 5: Modifier Admin.jsx

**Fichier:** `client/src/pages/Admin.jsx`

Ajouter la fonction `handleImageUpload()` et modifier le onChange de l'input file.

Voir `UPLOAD_CODE_COMPLET.md` → Section 3️⃣

OU: C'est déjà modifié ✅

---

## ▶️ Étape 6: Redémarrer les Serveurs

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Attendre les messages:
```
✓ vite v4.x.x build ready in 200ms
Port 5173 ready
```

```
Server running on port 5000
```

---

## 🧪 Étape 7: Test Rapide

### Via le navigateur:

1. Ouvrir: http://localhost:5173/admin
2. Cliquer: "+ Ajouter un produit"
3. Onglet: Cliquer "Upload"
4. Sélectionner: Une image depuis votre ordinateur
5. Attendre: 2-3 secondes
6. ✅ Vérifier: "Image uploadée ✓" s'affiche

### Via terminal (test cURL):

```bash
cd server
node test_upload.js
```

Résultat attendu:
```
✅ Upload successful!
📁 Image accessible at: http://localhost:5000/uploads/...
```

---

## ✨ C'est fini! 

Vous avez un système d'upload **100% fonctionnel** ✅

---

## 🔍 Vérifications

Ouvrir `server/uploads/` et vérifier qu'il y a des fichiers:

```bash
ls server/uploads/
```

Résultat:
```
1702123456789_monimage.jpg
```

---

## 📚 Prochaines Lectures

1. **Pour le code complet:** `UPLOAD_CODE_COMPLET.md`
2. **Pour tester:** `TEST_UPLOAD_GUIDE.md`
3. **Pour comprendre:** `UPLOAD_SYSTEM.md`

---

## 🆘 Aide Rapide

| Problème | Solution |
|----------|----------|
| 404 image not found | Redémarrer le serveur |
| Multer not found | npm install multer |
| Cannot POST /api/upload | Vérifier uploadRoutes.js créé |
| File trop gros | Max 5MB, compresser l'image |
| Type non valide | Utiliser JPG, PNG, GIF ou WebP |

---

**Créé le:** 10 Décembre 2025  
**Durée:** 5-10 minutes  
**Status:** ✅ Ready to Use
