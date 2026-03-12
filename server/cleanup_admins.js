const { User } = require('./models');

async function cleanupAdmins() {
    try {
        console.log("🧹 Démarrage du nettoyage des administrateurs...");
        
        // 1. On retire le rôle admin à TOUT LE MONDE d'abord (pour repartir à zéro)
        const [updatedCount] = await User.update(
            { role: 'client' },
            { where: { role: 'admin' } }
        );
        console.log(`✅ ${updatedCount} anciens administrateurs ont été remis en rôle 'client'.`);

        // 2. On définit les deux admins autorisés
        const officialAdmins = [
            'attiekedekoungbe01@gmail.com',
            'legerolt@gmail.com'
        ];

        for (const email of officialAdmins) {
            const user = await User.findOne({ where: { email } });
            if (user) {
                user.role = 'admin';
                await user.save();
                console.log(`👑 ${email} est désormais ADMIN.`);
            } else {
                console.log(`⚠️ Note : L'utilisateur ${email} n'existe pas encore dans la base.`);
            }
        }

        console.log("\n✨ Nettoyage terminé. Seuls vos deux comptes recevront les notifications désormais.");
    } catch (error) {
        console.error("❌ Erreur lors du nettoyage :", error);
    } finally {
        process.exit();
    }
}

cleanupAdmins();
