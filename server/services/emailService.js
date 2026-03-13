const nodemailer = require('nodemailer');

// --- CONFIGURATION ---
// Helper to get transporter
const getTransporter = async () => {
    // Check if real SMTP credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const port = parseInt(process.env.SMTP_PORT) || 2525; // Port 2525 est plus stable sur Render
        const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
        
        console.log(`🔌 Configuring SMTP: ${host}:${port}...`);

        return nodemailer.createTransport({
            host: host,
            port: port,
            secure: false, // TLS sera utilisé via STARTTLS sur le port 2525/587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
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

const sendEmail = async (to, subject, htmlContent) => {
    // [SIMULATION] Log always available for debug transparency
    console.log(`📧 [SIMULATION] Email envoyé à : ${to} | Sujet : ${subject}`);

    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: `"Attièkè Dèkoungbé" <${process.env.ADMIN_EMAIL || 'no-reply@attieke-dekoungbe.com'}>`,
            to: to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ SMTP Success: Message ID: ${info.messageId}`);

        if (info.messageId && !process.env.SMTP_USER) {
            console.log('🔎 Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        // IMPORTANT: Non-blocking error handling
        console.error(`⚠️ Email non envoyé (${subject}):`, error.message);
        // We purposefully do NOT throw here. 
        // This ensures the main controller (order/auth) continues successfully even if email fails.
    }
};

exports.sendEmail = sendEmail;


const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@attieke-dekoungbe.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://attieke-dekoungbe.onrender.com';

// --- STYLES RÉUTILISABLES ---
const emailHeader = `
    <div style="background-color: #111827; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ea580c; margin: 0; font-family: 'Arial Black', sans-serif; letter-spacing: 2px;">ATTIÈKÈ DÈKOUNGBÉ</h1>
        <p style="color: #9ca3af; margin: 5px 0 0; font-size: 12px; letter-spacing: 3px;">LE GOÛT AUTHENTIQUE</p>
    </div>
`;

const emailFooter = `
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p style="margin: 5px 0;">Attièkè Dèkoungbé - Dèkoungbé, Bénin</p>
        <p style="margin: 5px 0;">Contact: +229 57004681 | 01 64 64 77 30</p>
        <div style="margin-top: 15px;">
            <a href="${FRONTEND_URL}" style="color: #ea580c; text-decoration: none; font-weight: bold;">Accéder au site</a>
        </div>
    </div>
`;

// --- CLIENT NOTIFICATIONS ---

exports.sendOrderConfirmation = async (order, user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 15px;">
            ${emailHeader}
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #111827; margin-top: 0;">Merci pour votre commande !</h2>
                <p>Bonjour <strong>${user.name}</strong>,</p>
                <p>Nous avons bien reçu votre commande <strong>#${order.id}</strong>. Nos chefs s'en occupent déjà !</p>
                
                <div style="margin: 30px 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background-color: #f3f4f6;">
                            <tr>
                                <th style="padding: 12px; text-align: left; font-size: 13px;">Désignation</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px;">Qté</th>
                                <th style="padding: 12px; text-align: right; font-size: 13px;">Prix</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.Products ? order.Products.map(p => `
                                <tr style="border-top: 1px solid #e5e7eb;">
                                    <td style="padding: 12px; font-size: 14px;">${p.name}</td>
                                    <td style="padding: 12px; text-align: center; font-size: 14px;">${p.OrderItem.quantity}</td>
                                    <td style="padding: 12px; text-align: right; font-size: 14px;">${p.OrderItem.price_at_order} FCFA</td>
                                </tr>
                            `).join('') : '<tr><td colspan="3">Détails non disponibles</td></tr>'}
                        </tbody>
                        <tfoot style="background-color: #fffaf0; font-weight: bold; border-top: 2px solid #ea580c;">
                            <tr>
                                <td colspan="2" style="padding: 15px; text-align: right; color: #ea580c;">TOTAL</td>
                                <td style="padding: 15px; text-align: right; color: #ea580c; font-size: 18px;">${order.total_price} FCFA</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; text-transform: uppercase;">Adresse de livraison</h4>
                    <p style="margin: 0; font-weight: bold;">${order.address}</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">Tél: ${order.phone || user.phone}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${FRONTEND_URL}/dashboard" style="background-color: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Suivre ma commande</a>
                </div>
            </div>
            ${emailFooter}
        </div>
    `;
    await sendEmail(user.email, `🍲 Confirmation de commande #${order.id}`, html);
};

exports.sendOrderNotification = exports.sendOrderConfirmation;

exports.sendVerificationEmail = async (user, code) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 15px;">
            ${emailHeader}
            <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; text-align: center;">
                <h2 style="color: #111827;">Vérification de votre compte</h2>
                <p>Bonjour ${user.name}, merci de nous rejoindre ! Voici votre code de validation :</p>
                <div style="font-size: 40px; font-weight: 900; color: #ea580c; letter-spacing: 10px; border: 2px solid #ea580c; display: inline-block; padding: 15px 30px; margin: 30px 0; border-radius: 10px; background-color: #fff7ed;">
                    ${code}
                </div>
                <p style="color: #6b7280; font-size: 13px;">Ce code expirera dans 15 minutes par mesure de sécurité.</p>
            </div>
            ${emailFooter}
        </div>
    `;
    await sendEmail(user.email, '🛡️ Vérification de votre compte - Attièkè Dèkoungbé', html);
};

exports.sendResetPasswordEmail = async (user, url) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 15px;">
            ${emailHeader}
            <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; text-align: center;">
                <h2 style="color: #111827;">Réinitialisation de mot de passe</h2>
                <p>Nous avons reçu une demande pour changer votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
                <a href="${url}" style="background-color: #ea580c; color: white; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 30px 0; font-size: 16px;">Définir un nouveau mot de passe</a>
                <p style="color: #9ca3af; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
            </div>
            ${emailFooter}
        </div>
    `;
    await sendEmail(user.email, '🔐 Réinitialisation de votre mot de passe', html);
};

exports.sendStatusUpdateEmail = async (order, user, status) => {
    const statusInfo = {
        'en_cours': { title: 'Acceptée', icon: '✅', msg: 'Votre commande a été acceptée et sera bientôt en cuisine.' },
        'preparing': { title: 'En préparation', icon: '👨‍🍳', msg: 'Nos chefs préparent votre plat avec passion.' },
        'delivered': { title: 'Livrée', icon: '🍽️', msg: 'Bon appétit ! N\'oubliez pas de nous laisser un avis.' },
        'cancelled': { title: 'Annulée', icon: '❌', msg: 'Nous sommes désolés, votre commande a été annulée.' }
    };

    const current = statusInfo[status] || { title: status, icon: '📦', msg: `Le statut est maintenant : ${status}` };

    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 550px; margin: 0 auto; background-color: #f3f4f6; padding: 20px; border-radius: 15px;">
            ${emailHeader}
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
                <h1 style="font-size: 50px; margin: 0; text-align: center;">${current.icon}</h1>
                <h2 style="color: #111827; text-align: center; margin-top: 10px;">Commande ${current.title}</h2>
                <p style="text-align: center; font-size: 16px;">${current.msg}</p>
                
                <div style="border-top: 1px solid #e5e7eb; margin: 30px 0; padding-top: 20px; text-align: center;">
                    <p style="margin: 0; font-weight: bold;">Commande #${order.id}</p>
                    <a href="${FRONTEND_URL}/dashboard" style="color: #ea580c; font-weight: bold;">Accéder à mon suivi</a>
                </div>
            </div>
            ${emailFooter}
        </div>
    `;
    await sendEmail(user.email, `${current.icon} Commande #${order.id} : ${current.title}`, html);
};

exports.sendDriverAssigned = async (order, user, driverName = "Notre livreur", driverPhone = "") => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 550px; margin: 0 auto; background-color: #fff7ed; padding: 20px; border-radius: 15px;">
            ${emailHeader}
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">🛵</span>
                </div>
                <h2 style="color: #ea580c; text-align: center;">Votre livreur est en route !</h2>
                <p style="text-align: center;">Bonne nouvelle ! <strong>${driverName}</strong> vient de récupérer votre colis.</p>
                
                ${driverPhone ? `
                <div style="background-color: #111827; color: white; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
                    <p style="margin: 0; font-size: 13px; opacity: 0.7; text-transform: uppercase;">Contact Livraison</p>
                    <p style="margin: 5px 0; font-size: 20px; font-weight: bold;">📞 ${driverPhone}</p>
                </div>
                ` : ''}

                <p style="text-align: center; color: #6b7280; font-size: 14px;">Il se dirige vers votre adresse : <br/><em>${order.address}</em></p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${FRONTEND_URL}/dashboard" style="background-color: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ouvrir le suivi</a>
                </div>
            </div>
            ${emailFooter}
        </div>
    `;
    await sendEmail(user.email, `🛵 Votre livreur est en route ! (Réf #${order.id})`, html);
};

exports.sendReservationReceived = async (reservation, userEmail) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 550px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 15px;">
            ${emailHeader}
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #ea580c;">Demande de réservation reçue</h2>
                <p>Bonjour ${reservation.name}, nous avons bien pris note de votre demande.</p>
                <div style="background-color: #fff7ed; padding: 20px; margin: 20px 0; border-left: 5px solid #ea580c; border-radius: 4px;">
                    <strong>📅 Date :</strong> ${reservation.date} <br>
                    <strong>⏰ Heure :</strong> ${reservation.time} <br>
                    <strong>👥 Invités :</strong> ${reservation.guests}
                </div>
                <p style="font-size: 0.9em; color: #6b7280;">Nous reviendrons vers vous très rapidement pour confirmer la disponibilité par téléphone.</p>
            </div>
            ${emailFooter}
        </div>
    `;
    await sendEmail(userEmail || reservation.email, `📅 Réservation reçue - Attièkè Dèkoungbé`, html);
}


// --- ADMIN NOTIFICATIONS (TO ADMIN) ---

exports.sendAdminNewOrder = async (order) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 2px solid #ea580c; padding: 10px; border-radius: 15px;">
            <div style="background-color: #ea580c; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">💰 NOUVELLE COMMANDE</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Réception immédiate - #${order.id}</p>
            </div>
            <div style="padding: 30px;">
                <table style="width: 100%; border-spacing: 0;">
                    <tr>
                        <td style="padding-bottom: 20px;">
                            <span style="color: #6b7280; text-transform: uppercase; font-size: 11px;">Client</span><br/>
                            <strong style="font-size: 18px;">${order.customer_name}</strong>
                        </td>
                        <td style="padding-bottom: 20px; text-align: right;">
                            <span style="color: #6b7280; text-transform: uppercase; font-size: 11px;">Montant</span><br/>
                            <strong style="font-size: 18px; color: #166534;">${order.total_price} FCFA</strong>
                        </td>
                    </tr>
                </table>

                <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
                    <p style="margin: 0;"><strong>📞 Tél :</strong> ${order.phone}</p>
                    <p style="margin: 10px 0 0;"><strong>📍 Adresse :</strong> ${order.address}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${FRONTEND_URL}/admin" style="background-color: #111827; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Gérer la commande</a>
                </div>
            </div>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `💰 ALERTE : Nouvelle Commande #${order.id} (${order.total_price} FCFA)`, html);
};

exports.sendAdminNewUser = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #f0f7ff; border: 1px solid #2563eb; border-radius: 10px;">
            <h2 style="color: #2563eb; margin-top: 0;">👤 Nouveau Client Inscrit</h2>
            <p><strong>Nom :</strong> ${user.name}</p>
            <p><strong>Email :</strong> ${user.email}</p>
            <p><strong>Téléphone :</strong> ${user.phone || 'Non renseigné'}</p>
            <hr style="border: none; border-top: 1px solid #bfdbfe; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #60a5fa;">Inscrit le : ${new Date().toLocaleDateString()}</p>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `👤 NOUVEAU CLIENT : ${user.name}`, html);
};

exports.sendAdminNewReservation = async (reservation) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 2px solid #9333ea; border-radius: 15px;">
            <h2 style="color: #9333ea;">📅 NOUVELLE RÉSERVATION</h2>
            <p><strong>De :</strong> ${reservation.name}</p>
            <p><strong>Le :</strong> ${reservation.date} à ${reservation.time}</p>
            <p><strong>Pour :</strong> ${reservation.guests} personnes</p>
            ${reservation.message ? `<div style="padding: 15px; background: #faf5ff; border-radius: 8px; margin-top: 15px;">"${reservation.message}"</div>` : ''}
            <div style="text-align: center; margin-top: 25px;">
                <a href="${FRONTEND_URL}/admin" style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir l'agenda</a>
            </div>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `📅 ALERTE RÉSERVATION : ${reservation.date}`, html);
};

exports.sendAdminNewMessage = async (msg) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 25px; border-left: 5px solid #db2777; background-color: #fdf2f8;">
            <h2 style="color: #db2777;">✉️ Nouveau Message Contact</h2>
            <p><strong>Expéditeur :</strong> ${msg.name} (<a href="mailto:${msg.email}">${msg.email}</a>)</p>
            <p><strong>Sujet :</strong> ${msg.subject || 'Sans objet'}</p>
            <div style="padding: 20px; background: white; border-radius: 10px; margin-top: 15px; border: 1px solid #f9a8d4;">
                ${msg.message}
            </div>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `✉️ CONTACT : ${msg.name} - ${msg.subject || 'Nouveau Message'}`, html);
};

exports.sendAdminNewReview = async (review) => {
    const color = review.type === 'avis' ? '#16a34a' : '#dc2626';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 25px; border-radius: 15px; border: 2px solid ${color};">
            <h2 style="color: ${color};">${review.type === 'avis' ? '⭐ Nouvel Avis Client' : '⚠️ Nouvelle Réclamation'}</h2>
            <p><strong>Note :</strong> ${review.rating ? '⭐'.repeat(review.rating) : 'N/A'}</p>
            <blockquote style="padding: 15px; background: #f8fafc; border-radius: 10px; font-style: italic; color: #475569;">
                "${review.message}"
            </blockquote>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `${review.type === 'avis' ? '⭐ NOUVEL AVIS' : '⚠️ RÉCLAMATION'}`, html);
};


