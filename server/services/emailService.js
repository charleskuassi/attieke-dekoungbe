const nodemailer = require('nodemailer');

// --- CONFIGURATION ---
// Helper to get transporter
const getTransporter = async () => {
    // Check if real SMTP credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const port = parseInt(process.env.SMTP_PORT) || 587;
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const secure = port === 465; // True for 465 (SSL), False for 587 (STARTTLS)

        console.log(`🔌 Configuring SMTP: ${host}:${port} (Secure: ${secure})...`);

        return nodemailer.createTransport({
            host: host,
            port: port,
            secure: secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            },
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
            logger: true,
            debug: true,
            family: 4 // FORCE IPv4 (Safe for Brevo & Gmail)
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@attieke-dekoungbe.com';

// --- CLIENT NOTIFICATIONS ---

exports.sendOrderConfirmation = async (order, user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
            <h1 style="color: #ea580c; text-align: center;">Merci pour votre commande !</h1>
            <p>Bonjour ${user.name},</p>
            <p>Nous avons bien reçu votre commande <strong>#${order.id}</strong>.</p>
            <p>Elle est en cours de préparation par nos chefs.</p>
            
            <div style="background-color: #fff7ed; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #c2410c;">Récapitulatif</h3>
                <ul style="padding-left: 20px;">
                    ${order.Products ? order.Products.map(p => `<li>${p.OrderItem.quantity}x ${p.name} - ${p.price} FCFA</li>`).join('') : '<li>Détails non disponibles</li>'}
                </ul>
                <hr style="border: 0; border-top: 1px solid #ffd7a6; margin: 10px 0;">
                <p style="font-weight: bold; font-size: 1.1em; text-align: right;">Total : ${order.total_price} FCFA</p>
            </div>
            
            <p><strong>Livraison à :</strong> ${order.address}</p>
            <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #666;">Attièkè Dèkoungbé - Le goût authentique</p>
        </div>
    `;
    await sendEmail(user.email, `✅ Confirmation de commande #${order.id}`, html);
};

exports.sendOrderNotification = exports.sendOrderConfirmation;

exports.sendVerificationEmail = async (user, code) => {
    const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
            <h1 style="color: #ea580c;">Bienvenue !</h1>
            <p>Votre code de vérification est :</p>
            <div style="font-size: 32px; font-weight: bold; color: #ea580c; border: 2px dashed #ea580c; display: inline-block; padding: 10px 20px; margin: 20px 0;">${code}</div>
            <p>Ce code expire dans 15 minutes.</p>
        </div>
    `;
    // We use the safe sendEmail helper which swallows errors
    await sendEmail(user.email, 'Vérifiez votre compte - Attièkè Dèkoungbé', html);
};

exports.sendResetPasswordEmail = async (user, url) => {
    const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
            <h2 style="color: #ea580c;">Réinitialisation de mot de passe</h2>
            <p>Cliquez ci-dessous pour changer votre mot de passe :</p>
            <a href="${url}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0;">Changer mon mot de passe</a>
            <p><small>${url}</small></p>
        </div>
    `;
    await sendEmail(user.email, 'Réinitialisation de mot de passe', html);
};

exports.sendStatusUpdateEmail = async (order, user, status) => {
    let subject = `Mise à jour commande #${order.id}`;
    let message = `Le statut de votre commande est : <strong>${status}</strong>.`;

    if (status === 'en_cours' || status === 'preparing') {
        subject = `👨‍🍳 Commande #${order.id} en cuisine`;
        message = "Nos chefs préparent votre plat avec amour !";
    } else if (status === 'delivered' || status === 'completed') {
        subject = `🍽️ Commande #${order.id} livrée`;
        message = "Bon appétit ! Merci de votre confiance.";
    } else if (status === 'cancelled') {
        subject = `❌ Commande #${order.id} annulée`;
        message = "Votre commande a été annulée.";
    }

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #ea580c;">${subject}</h2>
            <p>Bonjour ${user.name},</p>
            <p>${message}</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">Suivre ma commande</a></p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

exports.sendDriverAssigned = async (order, user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #ea580c;">🛵 Votre livreur est en route !</h2>
            <p>Bonjour ${user.name},</p>
            <p>Votre commande <strong>#${order.id}</strong> a été récupérée par notre livreur.</p>
            <p>Il se dirige vers : <strong>${order.address}</strong>.</p>
            <p>Préparez-vous à déguster !</p>
        </div>
    `;
    await sendEmail(user.email, `🛵 Votre livreur arrive (Commande #${order.id})`, html);
};

exports.sendReservationReceived = async (reservation, userEmail) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #ea580c;">Réservation Reçue</h2>
            <p>Bonjour ${reservation.name},</p>
            <p>Nous avons bien reçu votre demande de réservation pour le :</p>
            <div style="background-color: #f3f4f6; padding: 10px; margin: 10px 0; border-left: 4px solid #ea580c;">
                <strong>📅 Date :</strong> ${reservation.date} <br>
                <strong>⏰ Heure :</strong> ${reservation.time} <br>
                <strong>👥 Invités :</strong> ${reservation.guests}
            </div>
            <p>Nous vous confirmerons la disponibilité très rapidement par téléphone ou email.</p>
        </div>
    `;
    await sendEmail(userEmail || reservation.email, `📅 Demande de réservation reçue`, html); // Try to use user email if passed, or reservation email field
}


// --- ADMIN NOTIFICATIONS (TO ADMIN) ---

exports.sendAdminNewOrder = async (order) => {
    const html = `
        <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #166534;">💰 Nouvelle Commande !</h2>
            <p><strong>Ref:</strong> #${order.id}</p>
            <p><strong>Client:</strong> ${order.customer_name} (${order.phone})</p>
            <p><strong>Montant:</strong> ${order.total_price} FCFA</p>
            <p><strong>Adresse:</strong> ${order.address}</p>
            <hr>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="background-color: #166534; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Gérer la commande</a>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `💰 NOUVELLE COMMANDE #${order.id} - ${order.total_price} FCFA`, html);
};

exports.sendAdminNewUser = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">👤 Nouveau Client Inscrit</h2>
            <p><strong>Nom:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Téléphone:</strong> ${user.phone || 'Non renseigné'}</p>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `👤 NOUVEAU CLIENT : ${user.name}`, html);
};

exports.sendAdminNewReservation = async (reservation) => {
    const html = `
        <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #9333ea;">📅 Nouvelle Réservation</h2>
            <p><strong>Nom:</strong> ${reservation.name}</p>
            <p><strong>Date:</strong> ${reservation.date} à ${reservation.time}</p>
            <p><strong>Personnes:</strong> ${reservation.guests}</p>
            <p><strong>Message:</strong> ${reservation.message || '-'}</p>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `📅 NOUVELLE RÉSERVATION : ${reservation.date} à ${reservation.time}`, html);
};

exports.sendAdminNewMessage = async (msg) => {
    const html = `
        <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #db2777;">✉️ Nouveau Message Contact</h2>
            <p><strong>De:</strong> ${msg.name} (${msg.email})</p>
            <p><strong>Sujet:</strong> ${msg.subject}</p>
            <div style="background-color: #fdf2f8; padding: 10px; margin-top: 10px; border-radius: 4px;">
                ${msg.message}
            </div>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `✉️ MESSAGE : ${msg.subject || 'Nouveau Contact'}`, html);
};

exports.sendAdminNewReview = async (review) => {
    const color = review.type === 'avis' ? '#16a34a' : '#dc2626'; // Green vs Red
    const html = `
        <div style="font-family: Arial, sans-serif;">
            <h2 style="color: ${color};">${review.type === 'avis' ? '⭐ Nouvel Avis' : '⚠️ Nouvelle Réclamation'}</h2>
            <p><strong>Note:</strong> ${review.rating ? review.rating + '/5' : '-'}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid ${color}; padding-left: 10px; margin: 10px 0; color: #555;">
                ${review.message}
            </blockquote>
        </div>
    `;
    await sendEmail(ADMIN_EMAIL, `${review.type === 'avis' ? '⭐ NOUVEL AVIS' : '⚠️ RÉCLAMATION'}`, html);
};

