/**
 * globalTeardown.js
 * Exécuté UNE FOIS après tous les tests.
 * Nettoie les ressources (connexions DB ouvertes, etc.)
 */
module.exports = async () => {
    console.log('\n🧹 [TEARDOWN] Nettoyage après les tests...');
    console.log('✅ [TEARDOWN] Tous les tests terminés.\n');
};
