const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    equipmentName: { type: String, required: true },
    description: { type: String },
    rentalPrice: { type: Number, required: true },
    availability: [
      {
        start: { type: Date },
        end: { type: Date },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    images: [{ type: String }],
    category: { type: String },
    location: { type: String },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
