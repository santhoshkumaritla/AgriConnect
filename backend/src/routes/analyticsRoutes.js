const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  getFarmerAnalytics,
  getConsumerAnalytics,
  getExpertAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');

router.get('/farmer', auth, requireRole(ROLES.FARMER), getFarmerAnalytics);
router.get('/consumer', auth, requireRole(ROLES.CONSUMER), getConsumerAnalytics);
router.get('/expert', auth, requireRole(ROLES.EXPERT), getExpertAnalytics);
router.get('/admin', auth, requireRole(ROLES.ADMIN), getAdminAnalytics);

module.exports = router;
