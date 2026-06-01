const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  createBooking,
  listBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

router.post('/', auth, requireRole(ROLES.FARMER), createBooking);
router.get('/', auth, listBookings);
router.patch('/:id/status', auth, requireRole(ROLES.EQUIPMENT_OWNER, ROLES.ADMIN), updateBookingStatus);

module.exports = router;
