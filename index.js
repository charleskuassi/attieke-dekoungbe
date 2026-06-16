// ⚠️ IMPORTANT: Désactiver la vérification SSL au niveau Node.js
// Nécessaire sur Hostinger avec Node.js 22.x pour les connexions vers Neon PostgreSQL
// Le certificat Neon n'est pas dans le store de certificats de Node.js 22
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Point d'entrée racine - redirige vers le serveur dans server/
// Ceci permet à Hostinger de trouver l'application depuis la racine du repo
require('./server/server.js');
