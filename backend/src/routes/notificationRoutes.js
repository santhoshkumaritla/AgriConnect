const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  listNotifications,
  markRead,
  createNotification,
} = require('../controllers/notificationController');

router.get('/', auth, listNotifications);
router.patch('/:id/read', auth, markRead);
router.post('/', auth, requireRole(ROLES.ADMIN), createNotification);

module.exports = router;
