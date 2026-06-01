const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../utils/constants');
const {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');

router.get('/', listEquipment);
router.get('/:id', getEquipment);
router.post(
  '/',
  auth,
  requireRole(ROLES.EQUIPMENT_OWNER),
  upload.array('images', 5),
  createEquipment
);
router.put(
  '/:id',
  auth,
  requireRole(ROLES.EQUIPMENT_OWNER),
  upload.array('images', 5),
  updateEquipment
);
router.delete('/:id', auth, requireRole(ROLES.EQUIPMENT_OWNER), deleteEquipment);

module.exports = router;
