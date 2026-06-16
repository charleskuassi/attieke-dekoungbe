const { User } = require('./models');

async function makeAdmin(email) {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`❌ Utilisateur introuvable avec l'email : ${email}`);
            console.log("Conseil : Connectez-vous d'abord sur le site avec cet email pour créer le compte.");
            return;
        }

        user.role = 'admin';
        await user.save();
        console.log(`✅ Succès : L'utilisateur ${email} est désormais ADMIN.`);
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
    } finally {
        process.exit();
    }
}

// Remplacez par l'email que vous voulez promouvoir
makeAdmin('attiekedekoungbe01@gmail.com');
