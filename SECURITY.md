# Politique de Sécurité - Attièkè Dèkoungbé

## ✅ Mesures de Sécurité Implémentées

### 1. Protection des Données Sensibles
- [x] `.env` fichiers dans `.gitignore` (jamais commités)
- [x] `JWT_SECRET` fort (64+ caractères)
- [x] HTTPS forcé via `upgradeInsecureRequests` (CSP)

### 2. Headers de Sécurité (Helmet)
- [x] Content Security Policy (CSP) stricte
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] Strict-Transport-Security (HSTS)
- [x] X-XSS-Protection
- [x] Referrer-Policy

### 3. Protection contre les Attaques
- [x] **Rate Limiting** :
  - Auth : 5 tentatives / 15 min
  - API : 100 requêtes / 15 min
  - Public : 30 requêtes / 15 min
  - **Health Check** : ❌ Exempté (pour cron-job.org)
- [x] **CORS** : Origines restreintes
- [x] **HPP** : Protection pollution paramètres
- [x] **Sanitization** : Protection XSS
- [x] **Validation** : Joi schema sur auth

### 4. Authentification
- [x] JWT avec expiration (1 jour)
- [x] Vérification utilisateur en DB
- [x] Middleware `protect` sur routes sensibles
- [x] Middleware `admin` pour accès admin

### 5. Content Security Policy (CSP)
Sources autorisées :
- Scripts : `self`, KKiaPay, Google, Firebase
- Styles : `self`, Google Fonts
- Images : `self`, Cloudinary, Google Maps, data/blob
- Connexions : API domaine, Firebase, KKiaPay

---

## 🔑 Clés et Secrets

| Service | Statut | Notes |
|---------|--------|-------|
| JWT_SECRET | ✅ Fort | 128 caractères hex |
| Firebase | ⚠️ Public | Restreindre aux domaines |
| Cloudinary | 🔒 Privé | Garder secret |
| KKiaPay | ⚠️ Public côté client | OK (clé publique) |
| Brevo SMTP | 🔒 Privé | Garder secret |
| Google OAuth | 🔒 Privé | Redirect URIs vérifiés |

---

## 🚨 En Cas de Fuite de Données

### 1. JWT_SECRET compromis
```bash
# 1. Générer nouveau secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Mettre à jour server/.env
# 3. Redéployer le backend
# 4. Tous les utilisateurs devront se reconnecter
```

### 2. Clés API compromises
- **Firebase** : Console Firebase → Project Settings → Generals → Regenerate
- **Cloudinary** : Dashboard → Settings → Regenerate API Secret
- **Brevo** : Dashboard → SMTP & API → Regenerate
- **KKiaPay** : Dashboard → Clés API → Régénérer
- **Google OAuth** : Console Google Cloud → Credentials → Regenerate secret

### 3. Base de données compromise
1. Changer mot de passe Neon Dashboard
2. Mettre à jour `DATABASE_URL`
3. Redéployer

---

## 📋 Checklist Pré-Déploiement

- [ ] `.env` n'est PAS dans Git (`git log -- .env`)
- [ ] `JWT_SECRET` est fort (64+ caractères)
- [ ] Rate limiting est actif
- [ ] CORS est configuré avec les bons domaines
- [ ] HTTPS est forcé en production
- [ ] Logs ne contiennent PAS de données sensibles

---

## 🔒 Bonnes Pratiques

### Ce qu'il faut faire
- ✅ Utiliser `protect` middleware sur toutes routes privées
- ✅ Utiliser `admin` middleware pour routes admin
- ✅ Valider les inputs avec `validate()` + Joi schema
- ✅ Utiliser `sanitizeInput` pour les données utilisateur
- ✅ Logger les erreurs (sans données sensibles)

### Ce qu'il faut ÉVITER
- ❌ Jamais commiter `.env` ou secrets
- ❌ Jamais logger `req.body` complet (mots de passe)
- ❌ Jamais exposer `JWT_SECRET` côté client
- ❌ Jamais utiliser `*` dans CORS en production
- ❌ Jamais désactiver Helmet en production

---

## 📞 Contact Urgence

En cas de faille de sécurité découverte :
1. Documenter le problème
2. Corriger en priorité
3. Redéployer immédiatement
4. Changer les clés compromises
5. Notifier les utilisateurs si données personnelles touchées
