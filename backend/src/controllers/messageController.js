const Message = require('../models/Message');
const User = require('../models/User');
const Order = require('../models/Order');
const Consultation = require('../models/Consultation');
const { buildConversationId } = require('../utils/chat');
const { emitChatToUser } = require('../sockets');

const listMessages = async (req, res, next) => {
  try {
    const { withUserId } = req.query;
    if (!withUserId) {
      return res.status(400).json({ message: 'withUserId is required' });
    }
    const conversationId = buildConversationId(req.user._id.toString(), withUserId);
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');
    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
};

const listConversations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const msgs = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(500);

    const partnerMap = new Map();
    msgs.forEach((m) => {
      const partner =
        m.senderId.toString() === userId ? m.receiverId.toString() : m.senderId.toString();
      if (!partnerMap.has(partner)) {
        partnerMap.set(partner, m);
      }
    });

    const contactIds = new Set(partnerMap.keys());

    if (req.user.role === 'consumer') {
      const farmerIds = await Order.distinct('farmerId', { consumerId: req.user._id });
      farmerIds.forEach((id) => contactIds.add(id.toString()));
      const farmers = await User.find({ role: 'farmer' }).select('_id').limit(20);
      farmers.forEach((f) => contactIds.add(f._id.toString()));
    } else if (req.user.role === 'farmer') {
      const consumerIds = await Order.distinct('consumerId', { farmerId: req.user._id });
      consumerIds.forEach((id) => contactIds.add(id.toString()));
      const experts = await User.find({ role: 'expert' }).select('_id');
      experts.forEach((e) => contactIds.add(e._id.toString()));
    } else if (req.user.role === 'expert') {
      const farmerIds = await Consultation.distinct('farmerId', {
        $or: [{ expertId: req.user._id }, { expertId: null }],
      });
      farmerIds.forEach((id) => contactIds.add(id.toString()));
    }

    const users = await User.find({ _id: { $in: [...contactIds] } }).select(
      'name role profileImage email'
    );

    const conversations = users.map((u) => ({
      user: u,
      lastMessage: partnerMap.get(u._id.toString()) || null,
    }));

    return res.json({ conversations });
  } catch (error) {
    return next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'receiverId and message are required' });
    }
    const conversationId = buildConversationId(req.user._id.toString(), receiverId);
    const created = await Message.create({
      senderId: req.user._id,
      receiverId,
      conversationId,
      message: message.trim(),
    });

    const populated = await Message.findById(created._id)
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');

    emitChatToUser(receiverId, populated);

    return res.status(201).json({ message: populated });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMessages,
  listConversations,
  sendMessage,
};
