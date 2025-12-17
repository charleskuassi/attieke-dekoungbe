const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const content = fs.readFileSync(envPath, 'utf8');

fs.writeFileSync('server/debug_env.txt', content);
console.log("Wrote .env to debug_env.txt");
