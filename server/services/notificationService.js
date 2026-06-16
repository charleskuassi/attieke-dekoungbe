const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const emailService = require('./emailService');
const { User } = require('../models');

// Initialisation de Firebase Admin
let isFirebaseInitialized = false;

try {
    let serviceAccount = null;

    // ✅ MÉTHODE 1 : Depuis la variable d'environnement (recommandé pour Hostinger)
    // Stocker le contenu du JSON en base64 dans FIREBASE_SERVICE_ACCOUNT_BASE64
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        console.log("🔍 Initialisation Firebase depuis la variable d'env (base64)...");
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);

    // ✅ MÉTHODE 2 : Depuis la variable d'environnement (JSON brut)
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("🔍 Initialisation Firebase depuis la variable d'env (JSON)...");
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // ✅ MÉTHODE 3 : Depuis le fichier JSON (développement local)
    } else {
        const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
            console.log("🔍 Initialisation Firebase depuis le fichier JSON local...");
            serviceAccount = require(serviceAccountPath);
        } else {
            console.warn("⚠️ Firebase non configuré : ni variable d'env FIREBASE_SERVICE_ACCOUNT_BASE64 ni fichier firebase-service-account.json trouvé.");
            console.warn("   → Les notifications push seront désactivées. Les emails fonctionneront normalement.");
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isFirebaseInitialized = true;
        console.log("✅ Firebase Admin initialisé avec succès.");
    }

} catch (error) {
    console.error("❌ Erreur initialisation Firebase:", error.message);
    console.warn("   → Les notifications push seront désactivées.");
}

/**
 * Service de Notification Universel 
 */
const NotificationService = {
    /**
     * Envoie une notification à un utilisateur spécifique
     * @param {Object} userOrId - L'objet Utilisateur ou son ID
     * @param {Object} payload - { title, body, data }
     */
    async sendToUser(userOrId, payload, forceEmail = false) {
        let user = userOrId;
        
        // Si on a reçu un ID, on récupère l'utilisateur
        if (typeof userOrId === 'number' || typeof userOrId === 'string') {
            user = await User.findByPk(userOrId);
        }

        if (!user) {
            console.error("❌ Impossible d'envoyer la notification : Utilisateur introuvable.");
            return;
        }

        let pushSent = false;

        // 1. Tenter l'envoi Push via FCM
        if (isFirebaseInitialized && user.fcmToken) {
            try {
                const message = {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                    },
                    data: payload.data || {},
                    token: user.fcmToken,
                };
                console.log(`📡 Envoi FCM vers le token de ${user.email}...`);
                await admin.messaging().send(message);
                console.log(`📱 Push envoyé avec succès à ${user.name}`);
                pushSent = true;
            } catch (error) {
                console.error("❌ Échec de l'envoi Push FCM :", error.message);
                if (error.code === 'messaging/registration-token-not-registered' || 
                    error.code === 'messaging/invalid-registration-token') {
                    await User.update({ fcmToken: null }, { where: { id: user.id } });
                }
            }
        }

        // 2. Email (Si forceEmail est vrai OU si le push a échoué)
        if (!pushSent || forceEmail) {
            console.log(`📧 Envoi d'un email à ${user.email} (ForceEmail: ${forceEmail})`);
            try {
                await emailService.sendEmail(
                    user.email, 
                    payload.title, 
                    `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #ea580c;">${payload.title}</h2>
                        <p style="font-size: 1.1em;">${payload.body}</p>
                        <br/>
                        <a href="https://attieke-dekoungbe.onrender.com/admin" style="background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir sur le Dashboard</a>
                    </div>`
                );
            } catch (emailError) {
                console.error("❌ Échec Email :", emailError.message);
            }
        }
        
        return { pushSent };
    },

    /**
     * Envoie une notification à tous les administrateurs (Push + Email SYSTÉMATIQUE)
     */
    async notifyAdmins(payload) {
        try {
            const admins = await User.findAll({ where: { role: 'admin' } });
            console.log(`🔔 Notification de ${admins.length} administrateurs (Double canal: Push + Email)...`);
            
            const results = await Promise.all(
                admins.map(adminUser => this.sendToUser(adminUser, payload, true))
            );
            
            return results;
        } catch (error) {
            console.error("❌ Erreur lors de la notification des admins:", error);
        }
    }
};

module.exports = NotificationService;
