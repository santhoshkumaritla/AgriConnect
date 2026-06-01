const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../utils/constants');
const { createFarm, getMyFarm, updateMyFarm, listFarms } = require('../controllers/farmController');

router.get('/', listFarms);
router.get('/me', auth, requireRole(ROLES.FARMER), getMyFarm);
router.post('/', auth, requireRole(ROLES.FARMER), upload.array('images', 5), createFarm);
router.put('/me', auth, requireRole(ROLES.FARMER), upload.array('images', 5), updateMyFarm);

module.exports = router;
