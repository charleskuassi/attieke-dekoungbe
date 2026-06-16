const notificationService = require('./services/notificationService');

async function runTest() {
    console.log("🚀 Lancement du test de notification...");
    
    try {
        const results = await notificationService.notifyAdmins({
            title: "🔥 TEST SYSTÈME",
            body: "Ceci est un test manuel pour vérifier le Push et l'Email.",
            data: { type: 'test' }
        });
        
        console.log("\n📊 Résultats du test :");
        console.log(JSON.stringify(results, null, 2));
        
        console.log("\n✅ Test terminé. Vérifiez votre téléphone et votre boîte mail.");
    } catch (error) {
        console.error("\n❌ ERREUR CRITIQUE lors du test :", error);
    } finally {
        process.exit();
    }
}

runTest();
