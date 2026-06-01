const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  listMessages,
  listConversations,
  sendMessage,
} = require('../controllers/messageController');

router.get('/conversations', auth, listConversations);
router.get('/', auth, listMessages);
router.post('/', auth, sendMessage);

module.exports = router;
