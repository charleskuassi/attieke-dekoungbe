# 🏗️ Architecture du Système d'Upload d'Images

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR CLIENT                       │
│                    (React Admin Panel)                      │
└─────────────────────────────────────────────────────────────┘
                           │
                  1. User selects image
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           Admin.jsx (handleImageUpload)                     │
│  • Crée FormData avec le fichier                            │
│  • POST /api/upload avec axios                             │
└─────────────────────────────────────────────────────────────┘
                           │
                  2. axios.post(FormData)
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │     INTERNET / RÉSEAU               │
        │  (HTTP POST multipart/form-data)    │
        └─────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                           │
│            (Node.js sur port 5000/5001)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ router.post('/api/upload',                          │  │
│  │   upload.single('image'),  ◄── MULTER              │  │
│  │   uploadImage)                                      │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
        ▼─────────────────────────────────────▼
    
    ┌──────────────────────┐  ┌──────────────────────┐
    │  MULTER MIDDLEWARE   │  │  uploadController.js │
    │                      │  │                      │
    │ • Parse multipart    │  │ • Validate file type │
    │ • File filter        │  │ • Create unique name │
    │ • Check file size    │  │ • Return JSON URL    │
    │ • Save to disk       │  │                      │
    └──────────────────────┘  └──────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               server/uploads/ (Disque local)                │
│                                                             │
│   1702123456789_plat.jpg                                   │
│   1702123457890_dessert.png                                │
│   1702123458891_boisson.webp                               │
│   ...                                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        Express Static Middleware
        app.use('/uploads', express.static(...))
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         JSON Response au Frontend                           │
│                                                             │
│  {                                                          │
│    "success": true,                                         │
│    "imageUrl": "/uploads/1702123456789_plat.jpg",          │
│    "filename": "1702123456789_plat.jpg",                   │
│    "size": 245620                                           │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        Admin.jsx met à jour productForm.image
        et affiche la prévisualisation
                           │
                           ▼
        User soumet le formulaire "Créer Produit"
        avec image_url = "/uploads/1702123456789_plat.jpg"
                           │
                           ▼
        POST /api/products avec image_url
                           │
                           ▼
        Produit créé en base de données
        avec référence à l'image uploadée ✅
```

---

## 📁 Structure de Fichiers

```
server/
├── server.js
│   ├── app.use('/uploads', express.static('uploads'))  ✅
│   └── app.use('/api/upload', require('./routes/uploadRoutes'))  ✅
│
├── routes/
│   └── uploadRoutes.js  ✅ (NEW)
│       └── POST /api/upload
│
├── controllers/
│   └── uploadController.js  ✅ (NEW)
│       ├── Multer storage config
│       ├── File filter
│       └── uploadImage handler
│
└── uploads/  ✅ (NEW - créé automatiquement)
    ├── 1702123456789_plat.jpg
    ├── 1702123457890_dessert.png
    └── ...

client/
├── src/pages/
│   └── Admin.jsx  ✅ (MODIFIÉ)
│       ├── [imageMode, setImageMode] State
│       ├── handleImageUpload(file)  ✅ NEW
│       ├── handleProductSubmit()  ✅ MODIFIÉ
│       └── Input file + Preview  ✅ MODIFIÉ
```

---

## 🔄 Flux de Données

### Scénario: Upload + Création de Produit

```
┌─────────────────────────────────────┐
│ 1. Admin sélectionne une image      │
│    (format: JPG/PNG/GIF/WebP)       │
│    (taille: < 5MB)                  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 2. onChange déclenche               │
│    handleImageUpload(file)          │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 3. Frontend crée FormData           │
│    formData.append('image', file)   │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 4. axios POST /api/upload           │
│    headers: Content-Type: multipart │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 5. Server reçoit la requête         │
│    Multer parse le fichier          │
│    File filter valide le type       │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 6. Multer storage sauvegarde        │
│    Nom: timestamp_originalname      │
│    Ex: 1702123456789_plat.jpg       │
│    Chemin: server/uploads/          │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 7. uploadImage handler retourne:    │
│    {                                │
│      success: true,                 │
│      imageUrl: "/uploads/17021..."  │
│    }                                │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 8. Frontend met à jour state:       │
│    productForm.image =              │
│      "/uploads/1702123456789_..."   │
│    Affiche prévisualisation         │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 9. Admin remplit les autres champs  │
│    (nom, prix, catégorie, etc.)     │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 10. Admin clique "Créer Produit"   │
│     handleProductSubmit()           │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 11. Frontend crée FormData:         │
│     name, description, price,       │
│     category, is_popular,           │
│     image_url: "/uploads/17021..."  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 12. POST /api/products              │
│     avec image_url                  │
│     (pas le fichier binaire!)       │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ 13. Backend productController       │
│     sauvegarde en base de données   │
│     Produit.image_url = "/uploads.."│
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ ✅ Produit créé avec image!         │
│    Image accessible via:            │
│    /uploads/1702123456789_plat.jpg  │
└─────────────────────────────────────┘
```

---

## 🔐 Sécurité Implémentée

| Aspect | Implémentation | Bénéfice |
|--------|----------------|----------|
| **Type de fichier** | File filter: JPG/PNG/GIF/WebP uniquement | Prévient les malveillances |
| **Extension** | Vérification de l'extension `.ext` | Double validation |
| **Taille** | Limit: 5MB max | Prévient abuse de stockage |
| **MIME type** | Check `file.mimetype` | Validation côté serveur |
| **Nommage** | Timestamp + originalname | Pas de collision, traçabilité |
| **Statique** | Fichiers servis en statique | Pas d'exécution de code |
| **Répertoire** | Séparé du code source | Isolé + facilement sauvegardable |

---

## 📊 Performance Considerations

### Côté Frontend
- **Upload immédiat**: Pas d'attente avant soumission du produit
- **Prévisualisation**: Image affichée dès réception du serveur
- **Erreur handling**: Message d'erreur si upload échoue
- **User feedback**: "Image uploadée ✓" pour confirmation

### Côté Backend
- **Multer optimisé**: Stream-based (pas de chargement en mémoire)
- **Nommage unique**: Évite les collisions de fichiers
- **Validation rapide**: Avant sauvegarde disque
- **Static serving**: Express built-in (très performant)

### Améliorations Futures
- [ ] Compression d'images (ImageMagick, Sharp)
- [ ] Thumbnails génération automatique
- [ ] CDN/Cloud storage (S3, Cloudinary)
- [ ] Cache HTTP headers
- [ ] Image optimization

---

## 🚨 Dépannage Rapide

| Problème | Solution |
|----------|----------|
| **Image n'upload pas** | Vérifier < 5MB, format valide, réseau OK |
| **Erreur 413** | File trop gros (max 5MB) |
| **Erreur 415** | Format non supporté (use JPG/PNG/GIF/WebP) |
| **Image visible en upload mais non en création** | URL format incorrect dans productForm |
| **500 Server Error** | Vérifier dossier uploads existe et writable |
| **CORS error** | Backend CORS déjà configuré (cors()) |

---

## 📞 Support & Maintenance

### Logs recommandés

```javascript
// Dans uploadController.js
console.log(`File uploaded: ${req.file.filename} (${req.file.size} bytes)`);
console.log(`Image URL: ${imageUrl}`);
```

### Monitoring

```bash
# Vérifier les uploads stockés
ls -lh server/uploads/

# Vérifier espace disque
df -h

# Nettoyer uploads anciens (optionnel)
find server/uploads -mtime +30 -delete
```

---

**Dernière mise à jour:** 10 Décembre 2025  
**Version:** 1.0.0 - Production Ready  
**Mainteneur:** Équipe Attièkè Dékoungbé
