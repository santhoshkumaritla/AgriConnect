const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  assignDelivery,
  claimDelivery,
  updateDeliveryStatus,
  listDeliveries,
} = require('../controllers/deliveryController');

router.post('/', auth, requireRole(ROLES.FARMER, ROLES.ADMIN), assignDelivery);
router.get('/', auth, listDeliveries);
router.patch('/:id/claim', auth, requireRole(ROLES.DELIVERY), claimDelivery);
router.patch('/:id/status', auth, requireRole(ROLES.DELIVERY, ROLES.ADMIN), updateDeliveryStatus);

module.exports = router;
