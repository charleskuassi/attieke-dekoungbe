const { Sequelize } = require('sequelize');
const pg = require('pg');
const https = require('https');

const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_1TxGZbNtD5pm@ep-still-tree-ag7tcryf.c-2.eu-central-1.aws.neon.tech:5432/neondb?sslmode=require';

console.log("=== DIAGNOSTIC SYSTÈME DE CONNEXION BDD ===");
console.log("Node version:", process.version);
console.log("OpenSSL version:", process.versions.openssl);
console.log("DATABASE_URL length:", url ? url.length : 0);

// Test 1 : Est-ce que le réseau sortant HTTPS vers Neon fonctionne ?
const testHttps = () => {
  return new Promise((resolve) => {
    console.log("\n[Test 1] Test de connexion HTTPS simple vers le serveur Neon...");
    https.get('https://ep-still-tree-ag7tcryf.c-2.eu-central-1.aws.neon.tech', (res) => {
      console.log("👉 Succès HTTPS (Status Code):", res.statusCode);
      resolve(true);
    }).on('error', (e) => {
      console.error("❌ Échec HTTPS :", e.message);
      resolve(false);
    });
  });
};

// Test 2 : Connexion avec Sequelize + SSL (rejectUnauthorized: false)
const testSequelizeFalse = async () => {
  console.log("\n[Test 2] Test avec Sequelize + rejectUnauthorized: false...");
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
  try {
    await sequelize.authenticate();
    console.log("👉 Succès Sequelize (rejectUnauthorized: false) !");
    await sequelize.close();
    return true;
  } catch (err) {
    console.error("❌ Échec Sequelize (rejectUnauthorized: false) :", err.message);
    return false;
  }
};

// Test 3 : Connexion avec Sequelize + SSL (rejectUnauthorized: true)
const testSequelizeTrue = async () => {
  console.log("\n[Test 3] Test avec Sequelize + rejectUnauthorized: true...");
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    }
  });
  try {
    await sequelize.authenticate();
    console.log("👉 Succès Sequelize (rejectUnauthorized: true) !");
    await sequelize.close();
    return true;
  } catch (err) {
    console.error("❌ Échec Sequelize (rejectUnauthorized: true) :", err.message);
    return false;
  }
};

// Test 4 : Connexion avec raw pg client + SSL
const testRawPg = async () => {
  console.log("\n[Test 4] Test avec le module 'pg' brut...");
  const client = new pg.Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });
  try {
    await client.connect();
    console.log("👉 Succès raw PG client !");
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ Échec raw PG client :", err.message);
    return false;
  }
};

(async () => {
  await testHttps();
  await testSequelizeFalse();
  await testSequelizeTrue();
  await testRawPg();
  console.log("\n=== FIN DU DIAGNOSTIC ===");
})();
