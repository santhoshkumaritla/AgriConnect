const Notification = require('../models/Notification');

let emitNotification = () => {};

const setNotificationEmitter = (fn) => {
  emitNotification = fn;
};

const createNotification = async (userId, title, description) => {
  const notification = await Notification.create({
    userId,
    title,
    description,
  });
  emitNotification(userId, notification);
  return notification;
};

module.exports = { createNotification, setNotificationEmitter };
