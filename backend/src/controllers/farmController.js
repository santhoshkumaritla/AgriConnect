const Farm = require('../models/Farm');

const createFarm = async (req, res, next) => {
  try {
    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const farm = await Farm.create({
      farmerId: req.user._id,
      ...req.body,
      images,
    });
    return res.status(201).json({ farm });
  } catch (error) {
    return next(error);
  }
};

const getMyFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ farmerId: req.user._id });
    return res.json({ farm });
  } catch (error) {
    return next(error);
  }
};

const updateMyFarm = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length) {
      updates.images = req.files.map((file) => `/uploads/${file.filename}`);
    }
    const farm = await Farm.findOneAndUpdate({ farmerId: req.user._id }, updates, {
      new: true,
      upsert: true,
    });
    return res.json({ farm });
  } catch (error) {
    return next(error);
  }
};

const listFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find().populate('farmerId', 'name profileImage');
    return res.json({ farms });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createFarm,
  getMyFarm,
  updateMyFarm,
  listFarms,
};
