const express = require('express');
const path = require('path');

function checkController(name, controller) {
    console.log(`\n🔍 Vérification de ${name}...`);
    if (!controller) {
        console.error(`  ❌ ERREUR : Le contrôleur ${name} est NULL ou UNDEFINED !`);
        return;
    }
    const keys = Object.keys(controller);
    if (keys.length === 0) {
        console.warn(`  ⚠️ ATTENTION : Le contrôleur ${name} est un objet vide {}.`);
    } else {
        console.log(`  ✅ Fonctions trouvées : ${keys.join(', ')}`);
        keys.forEach(k => {
            if (typeof controller[k] !== 'function') {
                console.error(`  ❌ ERREUR : ${name}.${k} n'est PAS une fonction ! (Type: ${typeof controller[k]})`);
            }
        });
    }
}

try {
    console.log("🚀 Lancement du diagnostic des contrôleurs...");
    
    const adminController = require('./controllers/adminController');
    const authController = require('./controllers/authController');
    const productController = require('./controllers/productController');
    const libraryController = require('./controllers/libraryController');
    const maintenanceController = require('./controllers/maintenanceController');
    const zoneController = require('./controllers/zoneController');
    const { protect, admin } = require('./middleware/authMiddleware');

    checkController('adminController', adminController);
    checkController('authController', authController);
    checkController('productController', productController);
    checkController('libraryController', libraryController);
    checkController('maintenanceController', maintenanceController);
    checkController('zoneController', zoneController);

    console.log("\n🛡️ Vérification des Middlewares...");
    console.log("  protect:", typeof protect);
    console.log("  admin:", typeof admin);

    if (typeof admin !== 'function') console.error("  ❌ ERREUR : Middleware 'admin' est UNDEFINED !");

    console.log("\n✨ Diagnostic terminé. Vérifiez les erreurs ci-dessus.");

} catch (err) {
    console.error("\n❌ CRASH DU DIAGNOSTIC :", err.message);
    if (err.stack) console.error(err.stack);
}
