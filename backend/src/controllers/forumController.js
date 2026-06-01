const ForumPost = require('../models/ForumPost');

const populatePost = (query) =>
  query
    .populate('authorId', 'name profileImage role')
    .populate('comments.userId', 'name profileImage')
    .populate('comments.replies.userId', 'name profileImage');

const listPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(ForumPost.find().sort({ createdAt: -1 }));
    return res.json({ posts });
  } catch (error) {
    return next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await populatePost(ForumPost.findById(req.params.id));
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.json({ post });
  } catch (error) {
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const post = await ForumPost.create({
      authorId: req.user._id,
      title,
      content,
    });
    const populated = await populatePost(ForumPost.findById(post._id));
    return res.status(201).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findOneAndUpdate(
      { _id: req.params.id, authorId: req.user._id },
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const populated = await populatePost(ForumPost.findById(post._id));
    return res.json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findOneAndDelete({
      _id: req.params.id,
      authorId: req.user._id,
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.json({ message: 'Post deleted' });
  } catch (error) {
    return next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const userId = req.user._id.toString();
    const index = post.likes.findIndex((id) => id.toString() === userId);
    if (index >= 0) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    return res.json({ likes: post.likes.length });
  } catch (error) {
    return next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({ userId: req.user._id, text });
    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    return res.json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

const addReply = async (req, res, next) => {
  try {
    const { text, commentId } = req.body;
    if (!text || !commentId) {
      return res.status(400).json({ message: 'text and commentId are required' });
    }
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.replies.push({ userId: req.user._id, text });
    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    return res.json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  addReply,
};
