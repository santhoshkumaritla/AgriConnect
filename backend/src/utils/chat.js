const buildConversationId = (senderId, receiverId) => {
  return [senderId, receiverId].sort().join('_');
};

module.exports = { buildConversationId };
