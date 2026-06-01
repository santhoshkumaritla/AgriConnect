const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/constants');

const orderSchema = new mongoose.Schema(
  {
    consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: { type: String },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    amount: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUS, default: ORDER_STATUS[0] },
    delivery: {
      address: { type: String },
      eta: { type: Date },
      status: { type: String },
    },
    payment: {
      method: { type: String },
      status: { type: String },
      transactionId: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
