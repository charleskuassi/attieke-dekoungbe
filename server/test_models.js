try {
    const db = require('./models');
    console.log('Models loaded');
} catch (e) {
    console.error('Models failed', e);
}
