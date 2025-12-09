const { User, sequelize } = require('./models');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const users = await User.findAll();
        console.log('Total users:', users.length);
        console.log('Users:', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
