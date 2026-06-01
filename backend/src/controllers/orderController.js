const Order = require('../models/Order');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery');
const { ORDER_STATUS } = require('../utils/constants');
const { createNotification } = require('../services/notifyService');
const { createDeliveryForOrder } = require('./deliveryController');

const canAccessOrder = (order, user) => {
  const role = user.role;
  const uid = user._id.toString();
  if (role === 'admin') return true;
  if (order.consumerId?.toString() === uid) return true;
  if (order.farmerId?.toString() === uid) return true;
  if (role === 'delivery') return true;
  return false;
};

const createOrder = async (req, res, next) => {
  try {
    const { farmerId, products, amount, payment, delivery } = req.body;
    if (!farmerId || !products || !products.length) {
      return res.status(400).json({ message: 'farmerId and products are required' });
    }

    const lineItems = [];
    let computedAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product not available: ${item.title || item.productId}` });
      }
      if (product.farmerId.toString() !== farmerId.toString()) {
        return res.status(400).json({ message: 'All products must belong to the same farmer' });
      }
      const qty = Number(item.quantity) || 1;
      if (product.quantity < qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}. Available: ${product.quantity} kg`,
        });
      }
      const price = Number(product.price);
      lineItems.push({
        productId: product._id,
        title: product.title,
        quantity: qty,
        price,
      });
      computedAmount += price * qty;
      product.quantity -= qty;
      await product.save();
    }

    const order = await Order.create({
      consumerId: req.user._id,
      farmerId,
      products: lineItems,
      amount: amount || computedAmount,
      payment: payment || { method: 'simulated', status: 'completed' },
      delivery: delivery || {},
      status: 'pending',
    });

    await createNotification(
      farmerId,
      'New order received',
      `Order #${order._id.toString().slice(-6)} — ₹${order.amount}`
    );
    await createNotification(
      req.user._id,
      'Order placed',
      `Your order #${order._id.toString().slice(-6)} was placed successfully.`
    );

    const populated = await Order.findById(order._id)
      .populate('consumerId', 'name email phone')
      .populate('farmerId', 'name email phone');

    return res.status(201).json({ order: populated });
  } catch (error) {
    return next(error);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const role = req.user.role;
    let filter = {};
    if (role === 'farmer') {
      filter.farmerId = req.user._id;
    } else if (role === 'consumer') {
      filter.consumerId = req.user._id;
    } else if (role === 'delivery') {
      const deliveries = await Delivery.find({ deliveryPartnerId: req.user._id }).select('orderId');
      filter._id = { $in: deliveries.map((d) => d.orderId) };
    } else if (role === 'admin') {
      filter = {};
    } else {
      return res.json({ orders: [] });
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('consumerId', 'name email phone')
      .populate('farmerId', 'name email phone');

    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('consumerId', 'name email phone')
      .populate('farmerId', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json({ order });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const role = req.user.role;
    const isFarmer = role === 'farmer' && order.farmerId.toString() === req.user._id.toString();
    const isConsumer = role === 'consumer' && order.consumerId.toString() === req.user._id.toString();

    if (isConsumer && status !== 'cancelled') {
      return res.status(403).json({ message: 'Consumers can only cancel orders' });
    }
    if (!isFarmer && !isConsumer && !['delivery', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    order.status = status;
    await order.save();

    if (isFarmer && status === 'packed') {
      await createDeliveryForOrder(order);
    }

    const notifyId = isFarmer ? order.consumerId : order.farmerId;
    await createNotification(
      notifyId,
      'Order status updated',
      `Order #${order._id.toString().slice(-6)} is now: ${status.replace(/_/g, ' ')}`
    );

    const populated = await Order.findById(order._id)
      .populate('consumerId', 'name')
      .populate('farmerId', 'name');

    return res.json({ order: populated });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
};
