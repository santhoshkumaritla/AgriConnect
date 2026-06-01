const { Server } = require('socket.io');
const { setNotificationEmitter } = require('../services/notifyService');

let io;

const { allowedOrigins, isNetlifyApp, normalizeOrigin } = require('../utils/corsConfig');

const socketOriginAllowed = (origin) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) return true;
  if (process.env.DISALLOW_NETLIFY !== 'true' && isNetlifyApp(origin)) return true;
  return allowedOrigins.length === 0;
};

const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (socketOriginAllowed(origin)) {
          callback(null, origin || true);
        } else {
          callback(null, false);
        }
      },
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
