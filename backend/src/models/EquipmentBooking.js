const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../utils/constants');

const equipmentBookingSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    bookingDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: BOOKING_STATUS, default: BOOKING_STATUS[0] },
    totalPrice: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquipmentBooking', equipmentBookingSchema);
