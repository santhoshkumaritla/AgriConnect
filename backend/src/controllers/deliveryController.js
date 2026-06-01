const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');
const { DELIVERY_STATUS } = require('../utils/constants');
const { createNotification } = require('../services/notifyService');

const populateDelivery = (query) =>
  query.populate({
    path: 'orderId',
    populate: [
      { path: 'consumerId', select: 'name phone address' },
      { path: 'farmerId', select: 'name phone' },
    ],
  });

/** Create an open delivery job when farmer marks order packed (no partner yet). */
const createDeliveryForOrder = async (order) => {
  const existing = await Delivery.findOne({ orderId: order._id });
  if (existing) return existing;

  const delivery = await Delivery.create({
    orderId: order._id,
    deliveryPartnerId: null,
    status: 'assigned',
    history: [{ status: 'assigned', timestamp: new Date() }],
  });

  const partners = await User.find({ role: 'delivery' }).select('_id');
  await Promise.all(
    partners.map((p) =>
      createNotification(
        p._id,
        'New delivery job',
        `Order #${order._id.toString().slice(-6)} is ready for pickup. Claim it in Deliveries.`
      )
    )
  );

  await createNotification(
    order.consumerId,
    'Order packed',
    `Order #${order._id.toString().slice(-6)} is packed and waiting for a delivery partner.`
  );

  return delivery;
};

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

    let delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      delivery = await Delivery.create({
        orderId,
        deliveryPartnerId: deliveryPartnerId || null,
        eta,
        status: 'assigned',
        history: [{ status: 'assigned', timestamp: new Date() }],
      });
    } else if (deliveryPartnerId) {
      delivery.deliveryPartnerId = deliveryPartnerId;
      if (eta) delivery.eta = eta;
      await delivery.save();
    }

    if (deliveryPartnerId) {
      order.status = 'out_for_delivery';
      await order.save();
      await createNotification(
        order.consumerId,
        'Order out for delivery',
        `Your order #${order._id.toString().slice(-6)} is on the way.`
      );
    }

    const populated = await populateDelivery(Delivery.findById(delivery._id));
    return res.status(201).json({ delivery: populated });
  } catch (error) {
    return next(error);
  }
};

const claimDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    if (delivery.deliveryPartnerId) {
      return res.status(400).json({ message: 'This job is already claimed by another partner' });
    }

    delivery.deliveryPartnerId = req.user._id;
    await delivery.save();

    const order = await Order.findById(delivery.orderId);
    if (order) {
      order.status = 'out_for_delivery';
      await order.save();

      await createNotification(
        order.consumerId,
        'Delivery partner assigned',
        `Your order #${order._id.toString().slice(-6)} is out for delivery.`
      );
      await createNotification(
        order.farmerId,
        'Delivery claimed',
        `A delivery partner claimed order #${order._id.toString().slice(-6)}.`
      );
    }

    const populated = await populateDelivery(Delivery.findById(delivery._id));
    return res.json({
      message: 'Delivery claimed successfully',
      delivery: populated,
    });
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

    if (req.user.role === 'delivery') {
      if (!delivery.deliveryPartnerId) {
        return res.status(403).json({ message: 'Claim this delivery first' });
      }
      if (delivery.deliveryPartnerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    delivery.status = status;
    delivery.history.push({ status, timestamp: new Date() });
    await delivery.save();

    const order = await Order.findById(delivery.orderId);
    if (order) {
      if (status === 'picked_up' || status === 'in_transit') {
        order.status = 'out_for_delivery';
        await order.save();
      }
      if (status === 'delivered') {
        order.status = 'delivered';
        await order.save();
        await createNotification(
          order.consumerId,
          'Order delivered',
          `Order #${order._id.toString().slice(-6)} has been delivered.`
        );
        await createNotification(
          order.farmerId,
          'Order delivered',
          `Order #${order._id.toString().slice(-6)} was delivered to the customer.`
        );
      }
    }

    const populated = await populateDelivery(Delivery.findById(delivery._id));
    return res.json({ message: `Delivery status: ${status}`, delivery: populated });
  } catch (error) {
    return next(error);
  }
};

const listDeliveries = async (req, res, next) => {
  try {
    let filter = {};
    const role = req.user.role;

    if (role === 'delivery') {
      filter = {
        $or: [{ deliveryPartnerId: req.user._id }, { deliveryPartnerId: null }],
      };
    } else if (role === 'consumer') {
      const orders = await Order.find({ consumerId: req.user._id }).select('_id');
      filter.orderId = { $in: orders.map((o) => o._id) };
    } else if (role === 'farmer') {
      const orders = await Order.find({ farmerId: req.user._id }).select('_id');
      filter.orderId = { $in: orders.map((o) => o._id) };
    } else if (role !== 'admin') {
      return res.json({ deliveries: [], available: [], mine: [] });
    }

    const deliveries = await populateDelivery(Delivery.find(filter).sort({ createdAt: -1 }));

    if (role === 'delivery') {
      const available = deliveries.filter((d) => !d.deliveryPartnerId);
      const mine = deliveries.filter(
        (d) => d.deliveryPartnerId?.toString() === req.user._id.toString()
      );
      return res.json({ deliveries, available, mine });
    }

    return res.json({ deliveries, available: [], mine: deliveries });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDeliveryForOrder,
  assignDelivery,
  claimDelivery,
  updateDeliveryStatus,
  listDeliveries,
};
