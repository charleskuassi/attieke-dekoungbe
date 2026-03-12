const admin = require('firebase-admin');
const path = require('path');
const emailService = require('./emailService');
const { User } = require('../models');

// Initialisation de Firebase Admin
let isFirebaseInitialized = false;

try {
    const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
    // On vérifie si le fichier existe avant de tenter l'initialisation
    const fs = require('fs');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isFirebaseInitialized = true;
        console.log("✅ Firebase Admin initialisé avec succès.");
    } else {
        console.warn("⚠️ Fichier firebase-service-account.json manquant. Les notifications Push sont désactivées.");
    }
} catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin:", error.message);
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
    async sendToUser(userOrId, payload) {
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
                await admin.messaging().send(message);
                console.log(`📱 Push envoyé avec succès à ${user.name}`);
                pushSent = true;
            } catch (error) {
                console.error("❌ Échec de l'envoi Push FCM :", error.message);
                // Si le token est invalide, on le supprime (prévention d'erreurs futures)
                if (error.code === 'messaging/registration-token-not-registered' || 
                    error.code === 'messaging/invalid-registration-token') {
                    console.log(`🗑️ Suppression du token invalide pour l'utilisateur ${user.id}`);
                    await User.update({ fcmToken: null }, { where: { id: user.id } });
                }
            }
        }

        // 2. Fallback Email (Si le push n'a pas été envoyé ou a échoué)
        if (!pushSent) {
            console.log(`📧 Fallback : Envoi d'un email à ${user.email}`);
            try {
                await emailService.sendEmail(
                    user.email, 
                    payload.title, 
                    `<div style="font-family: sans-serif; padding: 20px;">
                        <h2>${payload.title}</h2>
                        <p>${payload.body}</p>
                        <hr/>
                        <p style="font-size: 0.8em; color: #666;">
                            Ceci est une notification automatique de l'application Attièkè Dèkoungbé.
                        </p>
                    </div>`
                );
            } catch (emailError) {
                console.error("❌ Échec critique : Email de secours non envoyé :", emailError.message);
            }
        }
        
        return { pushSent };
    },

    /**
     * Envoie une notification à tous les administrateurs
     */
    async notifyAdmins(payload) {
        try {
            const admins = await User.findAll({ where: { role: 'admin' } });
            console.log(`🔔 Notification de ${admins.length} administrateurs...`);
            
            const results = await Promise.all(
                admins.map(adminUser => this.sendToUser(adminUser, payload))
            );
            
            return results;
        } catch (error) {
            console.error("❌ Erreur lors de la notification des admins:", error);
        }
    }
};

module.exports = NotificationService;
