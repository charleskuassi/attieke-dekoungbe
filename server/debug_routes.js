try {
    const libraryRoutes = require('./routes/libraryRoutes');
    console.log('libraryRoutes loaded');
} catch (e) {
    console.error('libraryRoutes failed', e);
}
