const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  assignDelivery,
  updateDeliveryStatus,
  listDeliveries,
} = require('../controllers/deliveryController');

router.post('/', auth, requireRole(ROLES.ADMIN), assignDelivery);
router.get('/', auth, listDeliveries);
router.patch('/:id/status', auth, requireRole(ROLES.DELIVERY), updateDeliveryStatus);

module.exports = router;
