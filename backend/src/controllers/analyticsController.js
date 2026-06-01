const Order = require('../models/Order');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const EquipmentBooking = require('../models/EquipmentBooking');
const Product = require('../models/Product');

const aggregateBestSellers = (orders) => {
  const map = {};
  orders.forEach((order) => {
    order.products?.forEach((p) => {
      const key = p.title || String(p.productId);
      if (!map[key]) map[key] = { title: key, quantity: 0, revenue: 0 };
      map[key].quantity += p.quantity || 0;
      map[key].revenue += (p.price || 0) * (p.quantity || 0);
    });
  });
  return Object.values(map)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

const getFarmerAnalytics = async (req, res, next) => {
  try {
    const farmerId = req.user._id;
    const orders = await Order.find({ farmerId });
    const deliveredOrders = orders.filter((order) => order.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.amount, 0);
    const products = await Product.find({ farmerId });

    return res.json({
      totalRevenue,
      totalOrders: orders.length,
      bestSellingProducts: aggregateBestSellers(deliveredOrders),
      inventoryTrends: products.map((p) => ({
        title: p.title,
        quantity: p.quantity,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const getConsumerAnalytics = async (req, res, next) => {
  try {
    const consumerId = req.user._id;
    const orders = await Order.find({ consumerId });
    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
    const categories = {};
    orders.forEach((o) => {
      o.products?.forEach((p) => {
        categories[p.title] = (categories[p.title] || 0) + 1;
      });
    });
    const favoriteCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return res.json({
      totalOrders: orders.length,
      totalSpent,
      favoriteCategories,
    });
  } catch (error) {
    return next(error);
  }
};

const getExpertAnalytics = async (req, res, next) => {
  try {
    const expertId = req.user._id;
    const consultations = await Consultation.find({
      $or: [{ expertId }, { expertId: null }],
    });
    const mine = consultations.filter(
      (c) => c.expertId && c.expertId.toString() === expertId.toString()
    );
    const resolved = mine.filter((c) => c.status === 'resolved').length;
    return res.json({
      consultationsHandled: mine.length,
      resolutionRate: mine.length ? resolved / mine.length : 0,
      ratings: '4.8',
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const [userCount, orderCount, bookingCount] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      EquipmentBooking.countDocuments(),
    ]);
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const revenue = deliveredOrders.reduce((sum, order) => sum + order.amount, 0);

    return res.json({
      totalUsers: userCount,
      totalOrders: orderCount,
      revenue,
      equipmentRentals: bookingCount,
      consultations: await Consultation.countDocuments(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFarmerAnalytics,
  getConsumerAnalytics,
  getExpertAnalytics,
  getAdminAnalytics,
};
