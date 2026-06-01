const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', auth, requireRole(ROLES.CONSUMER), createOrder);
router.get('/', auth, listOrders);
router.get('/:id', auth, getOrder);
router.patch('/:id/status', auth, updateOrderStatus);

module.exports = router;
