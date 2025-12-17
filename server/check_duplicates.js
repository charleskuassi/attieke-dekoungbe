const { User, sequelize } = require('./models');

async function checkDuplicates() {
    try {
        const users = await User.findAll();
        const emails = users.map(u => u.email);
        const uniqueEmails = new Set(emails);
        if (emails.length !== uniqueEmails.size) {
            console.log("DUPLICATES FOUND in emails!");
            // Find duplicates
            const counts = {};
            emails.forEach(e => counts[e] = (counts[e] || 0) + 1);
            Object.keys(counts).forEach(e => {
                if (counts[e] > 1) console.log(e, counts[e]);
            });
        } else {
            console.log("No duplicates in emails.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

checkDuplicates();
