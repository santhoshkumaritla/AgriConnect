const mongoose = require('mongoose');
const { CONSULTATION_STATUS } = require('../utils/constants');

const consultationSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question: { type: String, required: true },
    image: { type: String },
    response: { type: String },
    documents: [{ type: String }],
    status: { type: String, enum: CONSULTATION_STATUS, default: CONSULTATION_STATUS[0] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
