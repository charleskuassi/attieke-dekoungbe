const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../debug.log');

function log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
    fs.appendFileSync(logFile, logEntry);
}

module.exports = log;
