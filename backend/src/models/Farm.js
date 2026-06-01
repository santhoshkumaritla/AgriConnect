const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmName: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: Number },
    soilType: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farm', farmSchema);
