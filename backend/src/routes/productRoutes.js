const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../utils/constants');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', auth, upload.array('images', 5), requireRole(ROLES.FARMER), createProduct);
router.put('/:id', auth, upload.array('images', 5), requireRole(ROLES.FARMER), updateProduct);
router.delete('/:id', auth, requireRole(ROLES.FARMER), deleteProduct);

module.exports = router;
