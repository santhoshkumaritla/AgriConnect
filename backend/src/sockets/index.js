const { Server } = require('socket.io');
const { setNotificationEmitter } = require('../services/notifyService');

let io;

const { allowedOrigins } = require('../utils/corsConfig');

const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    },
  });

  setNotificationEmitter((userId, notification) => {
    if (io) io.to(userId.toString()).emit('notification:receive', notification);
  });

  io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
      if (userId) socket.join(userId.toString());
    });

    // Messages are delivered via emitChatToUser after REST POST /messages (no client relay)
  });
};

const emitChatToUser = (receiverId, messageDoc) => {
  if (io && receiverId && messageDoc) {
    io.to(receiverId.toString()).emit('chat:receive', messageDoc);
  }
};

module.exports = { initSockets, emitChatToUser };
