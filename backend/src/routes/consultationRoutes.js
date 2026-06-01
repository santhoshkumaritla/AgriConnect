const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../utils/constants');
const {
  createConsultation,
  listConsultations,
  replyConsultation,
  resolveConsultation,
} = require('../controllers/consultationController');

router.post(
  '/',
  auth,
  requireRole(ROLES.FARMER),
  upload.single('image'),
  createConsultation
);
router.get('/', auth, listConsultations);
router.patch('/:id/reply', auth, requireRole(ROLES.EXPERT), replyConsultation);
router.patch('/:id/resolve', auth, resolveConsultation);

module.exports = router;
