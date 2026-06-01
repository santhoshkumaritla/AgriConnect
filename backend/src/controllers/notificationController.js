const Notification = require('../models/Notification');

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ notifications });
  } catch (error) {
    return next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.json({ notification });
  } catch (error) {
    return next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { userId, title, description } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: 'userId and title are required' });
    }
    const notification = await Notification.create({ userId, title, description });
    return res.status(201).json({ notification });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listNotifications,
  markRead,
  createNotification,
};
