const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const { DELIVERY_STATUS } = require('../utils/constants');
const { createNotification } = require('../services/notifyService');

const assignDelivery = async (req, res, next) => {
  try {
    const { orderId, deliveryPartnerId, eta } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const delivery = await Delivery.create({
      orderId,
      deliveryPartnerId: deliveryPartnerId || req.user._id,
      eta,
      history: [{ status: DELIVERY_STATUS[0], timestamp: new Date() }],
    });
    order.status = 'out_for_delivery';
    await order.save();

    await createNotification(
      order.consumerId,
      'Order out for delivery',
      `Your order #${orderId.toString().slice(-6)} is on the way.`
    );

    const populated = await Delivery.findById(delivery._id).populate({
      path: 'orderId',
      populate: [
        { path: 'consumerId', select: 'name phone address' },
        { path: 'farmerId', select: 'name phone' },
      ],
    });

    return res.status(201).json({ delivery: populated });
  } catch (error) {
    return next(error);
  }
};

const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!DELIVERY_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    if (
      req.user.role === 'delivery' &&
      delivery.deliveryPartnerId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    delivery.status = status;
    delivery.history.push({ status, timestamp: new Date() });
    await delivery.save();

    const order = await Order.findById(delivery.orderId);
    if (status === 'delivered' && order) {
      order.status = 'delivered';
      await order.save();
      await createNotification(
        order.consumerId,
        'Order delivered',
        `Order #${order._id.toString().slice(-6)} has been delivered.`
      );
    }

    return res.json({ delivery });
  } catch (error) {
    return next(error);
  }
};

const listDeliveries = async (req, res, next) => {
  try {
    let filter = {};
    const role = req.user.role;

    if (role === 'delivery') {
      filter.deliveryPartnerId = req.user._id;
    } else if (role === 'consumer') {
      const orders = await Order.find({ consumerId: req.user._id }).select('_id');
      filter.orderId = { $in: orders.map((o) => o._id) };
    } else if (role === 'farmer') {
      const orders = await Order.find({ farmerId: req.user._id }).select('_id');
      filter.orderId = { $in: orders.map((o) => o._id) };
    } else if (role !== 'admin') {
      return res.json({ deliveries: [] });
    }

    const deliveries = await Delivery.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'consumerId', select: 'name phone address' },
          { path: 'farmerId', select: 'name phone' },
        ],
      });

    return res.json({ deliveries });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  assignDelivery,
  updateDeliveryStatus,
  listDeliveries,
};
