const { User } = require('./models');

async function checkUser(email) {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`❌ Utilisateur introuvable : ${email}`);
            return;
        }

        console.log(`--- Diagnostic pour ${email} ---`);
        console.log(`ID: ${user.id}`);
        console.log(`Rôle: ${user.role}`);
        console.log(`FCM Token: ${user.fcmToken ? '✅ Présent (Commence par ' + user.fcmToken.substring(0, 10) + '...)' : '❌ Absent'}`);
        
        if (!user.fcmToken) {
            console.log("\n💡 Conseil : Si le token est absent, c'est que le navigateur n'a pas encore envoyé les droits.");
            console.log("Assurez-vous d'avoir autorisé les notifications sur le site et d'avoir rafraîchi la page.");
        }
    } catch (error) {
        console.error("Erreur diagnostic :", error);
    } finally {
        process.exit();
    }
}

checkUser('attiekedekoungbe01@gmail.com');
