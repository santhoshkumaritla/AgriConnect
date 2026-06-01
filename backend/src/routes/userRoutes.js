const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../utils/constants');
const {
  getMe,
  updateMe,
  getWishlist,
  addWishlist,
  removeWishlist,
  followFarmer,
  unfollowFarmer,
  listUsers,
  listExperts,
  getUserById,
} = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/me/wishlist', auth, getWishlist);
router.post('/me/wishlist', auth, addWishlist);
router.delete('/me/wishlist', auth, removeWishlist);
router.post('/me/following', auth, followFarmer);
router.delete('/me/following', auth, unfollowFarmer);
router.get('/experts', listExperts);
router.get('/', auth, requireRole(ROLES.ADMIN), listUsers);
router.get('/:id', getUserById);

module.exports = router;
