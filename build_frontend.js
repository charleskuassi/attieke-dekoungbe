const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Chemins
const rootDir = __dirname;
const clientDir = path.join(rootDir, 'client');
const serverPublicDir = path.join(rootDir, 'server', 'public');
const clientDistDir = path.join(clientDir, 'dist');

console.log('📦 Début de la compilation du frontend...');

try {
  // 1. Build du client
  console.log('⚙️ Exécution de "npm run build" dans le dossier client...');
  execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

  // 2. Nettoyage de server/public
  console.log('🧹 Nettoyage du dossier server/public...');
  if (fs.existsSync(serverPublicDir)) {
    fs.rmSync(serverPublicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(serverPublicDir, { recursive: true });

  // 3. Copie de client/dist vers server/public
  console.log('📂 Copie des fichiers compilés de client/dist vers server/public...');
  copyFolderSync(clientDistDir, serverPublicDir);

  console.log('✅ Compilation et copie terminées avec succès !');
  console.log('ℹ️ Vous pouvez maintenant commit et push pour déployer sur Hostinger.');
} catch (error) {
  console.error('❌ Erreur lors du build ou de la copie :', error.message);
  process.exit(1);
}

// Fonction utilitaire de copie récursive
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}
