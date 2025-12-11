console.log('Testing dependencies...');
try { require('fs'); console.log('fs ok'); } catch (e) { console.error('fs failed', e); }
try { require('path'); console.log('path ok'); } catch (e) { console.error('path failed', e); }
try { require('express'); console.log('express ok'); } catch (e) { console.error('express failed', e); }
try { require('cors'); console.log('cors ok'); } catch (e) { console.error('cors failed', e); }
try { require('helmet'); console.log('helmet ok'); } catch (e) { console.error('helmet failed', e); }
try { require('express-rate-limit'); console.log('express-rate-limit ok'); } catch (e) { console.error('express-rate-limit failed', e); }
try { require('dotenv'); console.log('dotenv ok'); } catch (e) { console.error('dotenv failed', e); }
try { require('sequelize'); console.log('sequelize ok'); } catch (e) { console.error('sequelize failed', e); }
try { require('pg'); console.log('pg ok'); } catch (e) { console.error('pg failed', e); }
try { require('passport'); console.log('passport ok'); } catch (e) { console.error('passport failed', e); }
console.log('Done.');
