const mongoose = require('mongoose');
const { DELIVERY_STATUS } = require('../utils/constants');

const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: DELIVERY_STATUS, default: DELIVERY_STATUS[0] },
    eta: { type: Date },
    history: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
