const Consultation = require('../models/Consultation');
const { CONSULTATION_STATUS } = require('../utils/constants');
const { createNotification } = require('../services/notifyService');

const createConsultation = async (req, res, next) => {
  try {
    const { question, expertId } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const consultation = await Consultation.create({
      farmerId: req.user._id,
      expertId: expertId || undefined,
      question,
      image,
    });

    if (expertId) {
      await createNotification(expertId, 'New consultation', 'A farmer requested your advice.');
    }
    await createNotification(
      req.user._id,
      'Consultation submitted',
      'Your question was sent. An expert will reply soon.'
    );

    const populated = await Consultation.findById(consultation._id)
      .populate('farmerId', 'name profileImage')
      .populate('expertId', 'name profileImage');

    return res.status(201).json({
      message: 'Consultation submitted successfully',
      consultation: populated,
    });
  } catch (error) {
    return next(error);
  }
};

const listConsultations = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'farmer') {
      filter.farmerId = req.user._id;
    } else if (req.user.role === 'expert') {
      filter = {
        $or: [{ expertId: req.user._id }, { expertId: null }, { expertId: { $exists: false } }],
      };
    } else if (req.user.role === 'admin') {
      filter = {};
    } else {
      return res.json({ consultations: [] });
    }

    const consultations = await Consultation.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name profileImage phone')
      .populate('expertId', 'name profileImage');

    return res.json({ consultations });
  } catch (error) {
    return next(error);
  }
};

const replyConsultation = async (req, res, next) => {
  try {
    const { response, status } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    if (req.user.role === 'expert') {
      consultation.expertId = req.user._id;
    }
    if (response !== undefined) {
      consultation.response = response;
    }
    if (status && CONSULTATION_STATUS.includes(status)) {
      consultation.status = status;
    } else if (response) {
      consultation.status = 'replied';
    }
    await consultation.save();

    await createNotification(
      consultation.farmerId,
      'Consultation reply',
      'An expert responded to your question.'
    );

    const populated = await Consultation.findById(consultation._id)
      .populate('farmerId', 'name')
      .populate('expertId', 'name');

    return res.json({
      message: 'Reply sent to farmer',
      consultation: populated,
    });
  } catch (error) {
    return next(error);
  }
};

const resolveConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    const allowed =
      req.user.role === 'admin' ||
      req.user.role === 'expert' ||
      consultation.farmerId.toString() === req.user._id.toString();
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    consultation.status = 'resolved';
    await consultation.save();
    return res.json({
      message: 'Consultation marked as resolved',
      consultation,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createConsultation,
  listConsultations,
  replyConsultation,
  resolveConsultation,
};
