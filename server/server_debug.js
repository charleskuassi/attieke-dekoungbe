const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');

console.log('--- Testing Requires ---');
try { require('./routes/productRoutes'); console.log('productRoutes ok'); } catch (e) { console.error('productRoutes failed', e); }
try { require('./routes/orderRoutes'); console.log('orderRoutes ok'); } catch (e) { console.error('orderRoutes failed', e); }
try { require('./routes/uploadRoutes'); console.log('uploadRoutes ok'); } catch (e) { console.error('uploadRoutes failed', e); }
try { require('./routes/authRoutes'); console.log('authRoutes ok'); } catch (e) { console.error('authRoutes failed', e); }
try { require('./routes/reservationRoutes'); console.log('reservationRoutes ok'); } catch (e) { console.error('reservationRoutes failed', e); }
try { require('./routes/messageRoutes'); console.log('messageRoutes ok'); } catch (e) { console.error('messageRoutes failed', e); }
try { require('./routes/driverRoutes'); console.log('driverRoutes ok'); } catch (e) { console.error('driverRoutes failed', e); }
try { require('./routes/reviewRoutes'); console.log('reviewRoutes ok'); } catch (e) { console.error('reviewRoutes failed', e); }
try { require('./routes/adminRoutes'); console.log('adminRoutes ok'); } catch (e) { console.error('adminRoutes failed', e); }
try { require('./routes/libraryRoutes'); console.log('libraryRoutes ok'); } catch (e) { console.error('libraryRoutes failed', e); }
console.log('--- End Requires ---');

app.use(helmet());
app.use(passport.initialize());

async function start() {
    try {
        // await sequelize.sync({ alter: true });
        console.log('Database connected (Sync SKIPPED)');
        app.listen(PORT, () => console.log(`Debug Server running on port ${PORT}`));
    } catch (e) {
        console.error('DB Failed', e);
    }
}
start();
