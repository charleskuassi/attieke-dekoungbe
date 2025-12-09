const nodemailer = require('nodemailer');

// Helper to get transporter
const getTransporter = async () => {
    // Check if real SMTP credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {

        console.log(`Using Real SMTP for: ${process.env.SMTP_USER}`);

        // Optimisation pour Gmail : utiliser le service intégré
        if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }

        // Configuration standard pour autres SMTP
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587, // Default to 587 if not specified
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                ciphers: 'SSLv3', // Aide parfois pour compatibilité
                rejectUnauthorized: false
            },
            connectionTimeout: 10000 // 10 secondes timeout
        });
    } else {
        console.log("⚠️ No valid SMTP config found. Using Ethereal Email (Dev Mode).");
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

exports.sendOrderNotification = async (order, user) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: '"Attièkè Dékoungbé" <no-reply@attieke-dekoungbe.com>',
            to: user.email,
            subject: `Confirmation de commande #${order.id}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #ea580c;">Merci pour votre commande !</h1>
                    <p>Bonjour ${user.name},</p>
                    <p>Nous avons bien reçu votre commande <strong>#${order.id}</strong>.</p>
                    <p>Elle est actuellement en cours de préparation.</p>
                    
                    <h3>Récapitulatif :</h3>
                    <ul>
                        ${order.Products ? order.Products.map(p => `<li>${p.OrderItem.quantity}x ${p.name} - ${p.price} FCFA</li>`).join('') : ''}
                    </ul>
                    
                    <p><strong>Total : ${order.total_price} FCFA</strong></p>
                    
                    <p>Adresse de livraison : ${order.address}</p>
                    
                    <p>Bon appétit !<br>L'équipe Attièkè Dékoungbé</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order Email sent: %s', info.messageId);
        if (info.messageId && !process.env.SMTP_USER) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;

    } catch (error) {
        console.error('Error sending order email:', error);
    }
};

exports.sendVerificationEmail = async (user, code) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: '"Attièkè Dékoungbé" <no-reply@attieke-dekoungbe.com>',
            to: user.email,
            subject: 'Vérifiez votre compte - Attièkè Dékoungbé',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ea580c; text-align: center;">Bienvenue chez Attièkè Dékoungbé !</h1>
                    <p>Bonjour ${user.name},</p>
                    <p>Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
                    
                    <div style="background-color: #fff7ed; border: 2px dashed #ea580c; padding: 20px; text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${code}</span>
                    </div>
                    
                    <p>Ce code expire dans 15 minutes.</p>
                    <p>Si vous n'avez pas créé de compte, ignorez simplement cet email.</p>
                </div>
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification Email sent: %s', info.messageId);
        // Only verify logic:
        if (info.messageId && (!process.env.SMTP_USER || process.env.SMTP_USER.includes('votre_email'))) {
            console.log('🔎 DEV PREVIEW URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // Re-throw to catch in controller
    }
};

exports.sendResetPasswordEmail = async (user, url) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: '"Attièkè Dékoungbé" <security@attieke-dekoungbe.com>',
            to: user.email,
            subject: 'Réinitialisation de mot de passe',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ea580c;">Mot de passe oublié ?</h2>
                    <p>Vous avez demandé une réinitialisation de mot de passe.</p>
                    <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${url}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
                    </div>
                    
                    <p>Si le bouton ne fonctionne pas, copiez ce lien : <br> <a href="${url}">${url}</a></p>
                    <p>Ce lien est valide pour 1 heure.</p>
                </div>
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Reset Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending reset email:', error);
    }
};

exports.sendStatusUpdateEmail = async (order, user, status) => {
    try {
        const transporter = await getTransporter();

        let subject = `Mise à jour commande #${order.id}`;
        let title = "Statut mis à jour";
        let message = `Le statut de votre commande est passé à : <strong>${status}</strong>.`;

        if (status === 'en_cours') {
            subject = `🚀 Commande #${order.id} en route !`;
            title = "Votre commande est en route !";
            message = "Bonne nouvelle ! Votre livreur a récupéré votre commande et se dirige vers vous.";
        } else if (status === 'delivered') {
            subject = `✅ Commande #${order.id} livrée`;
            title = "Commande Livrée !";
            message = "Votre commande a été marquée comme livrée. Merci de votre confiance et bon appétit !";
        } else if (status === 'cancelled') {
            subject = `❌ Commande #${order.id} annulée`;
            title = "Commande Annulée";
            message = "Votre commande a été annulée. Contactez-nous pour plus d'informations.";
        }

        const mailOptions = {
            from: '"Attièkè Dékoungbé" <no-reply@attieke-dekoungbe.com>',
            to: user.email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #ea580c; text-align: center;">${title}</h1>
                    <p>Bonjour ${user.name},</p>
                    <p style="font-size: 16px;">${message}</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <p><strong>Commande :</strong> #${order.id}</p>
                        <p><strong>Montant :</strong> ${order.total_price} FCFA</p>
                    </div>

                    <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                        Attièkè Dékoungbé - Le goût authentique.<br>
                        Ceci est un message automatique, merci de ne pas y répondre.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Status Update Email (${status}) sent: %s`, info.messageId);

        if (info.messageId && (!process.env.SMTP_USER || process.env.SMTP_USER.includes('votre_email'))) {
            console.log('🔎 DEV PREVIEW URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};
