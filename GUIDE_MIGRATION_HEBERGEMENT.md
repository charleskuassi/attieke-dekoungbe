# 🚀 Guide de Migration : De Render vers l'Hébergeur Client

Ce guide vous explique comment déplacer l'application **Attièkè Dèkoungbé** vers l'hébergement définitif du client (utilisant FileZilla).

---

## 📋 1. Pré-requis indispensables
Avant de commencer, vérifiez avec l'hébergeur du client :
- **Support Node.js** : L'hébergement doit permettre d'exécuter des applications Node.js (cherchez "Setup Node.js App" dans cPanel).
- **Version Node.js** : Minimum v18+, idéalement v22.
- **Accès SSH ou Terminal** (Optionnel mais recommandé) pour installer les dépendances.

---

## 🎨 2. Préparation du Frontend (React)
L'hébergeur du client (PHP/WordPress) ne sait pas lire le code React "brut". Il faut le compiler.

1. Allez dans le dossier `client/` sur votre ordinateur.
2. Lancez la commande : `npm run build`.
3. Un nouveau dossier nommé **`dist/`** va apparaître.
4. **C'est ce dossier `dist/` qui contient votre site web.**

---

## ⚙️ 3. Préparation du Backend (Node.js)
1. Prenez tout le contenu du dossier `server/`.
2. **Excluez** le dossier `node_modules/` (il est trop lourd et doit être réinstallé sur le serveur).
3. Assurez-vous que votre fichier `.env` est complet avec :
   - `DATABASE_URL` (Lien vers Neon ou la nouvelle base).
   - `SMTP_USER` / `SMTP_PASS` (Brevo).
   - `VITE_FIREBASE_...` (Clés Firebase).
4. Vérifiez que le fichier `firebase-service-account.json` est bien présent à la racine du dossier `server/`.

---

## 📂 4. Déploiement via FileZilla

### Structure recommandée sur le serveur :
```text
/domains/attieke-dekoungbe.com/
├── public_html/ (Le Frontend)
│   └── [Contenu du dossier client/dist/]
└── api/ (Le Backend)
    └── [Contenu du dossier server/]
```

1. **Frontend** : Copiez le contenu de `client/dist/` directement dans le dossier `public_html/`.
2. **Backend** : Créez un dossier `api/` (au même niveau que `public_html` si possible) et déposez-y vos fichiers serveur.

---

## 🚀 5. Configuration sur l'Hébergeur (cPanel/Plesk)

1. Allez dans **"Setup Node.js App"**.
2. Cliquez sur **"Create Application"**.
3. **Application root** : Chemin vers votre dossier `api/`.
4. **Application URL** : L'adresse de votre API (ex: `api.attieke-dekoungbe.com` ou `attieke-dekoungbe.com/api`).
5. **Application startup file** : `server.js`.
6. Cliquez sur **"Run npm install"** pour installer les dépendances sur le serveur.
7. **Variables d'environnement** : Copiez manuellement chaque ligne de votre `.env` dans la section "Environment variables" de l'interface.

---

## 🔒 6. Points de vigilance
- **HTTPS** : Assurez-vous que le certificat SSL est actif. Sinon, les notifications Push et les paiements KKiaPay seront bloqués.
- **Base de données** : Si l'hébergeur ne propose pas PostgreSQL, gardez la base sur **Neon** (c'est le plus simple).
- **CORS** : Si vous changez d'URL, n'oubliez pas de mettre à jour `FRONTEND_URL` dans votre `.env` backend.

---

🎨 *Réalisé par Antigravity pour Attièkè Dèkoungbé*
