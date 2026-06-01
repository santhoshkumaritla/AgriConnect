const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  addReply,
} = require('../controllers/forumController');

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.post('/:id/reply', auth, addReply);

module.exports = router;
