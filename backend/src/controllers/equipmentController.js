const Equipment = require('../models/Equipment');

const listEquipment = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { equipmentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const equipment = await Equipment.find(filter).sort({ createdAt: -1 });
    return res.json({ equipment });
  } catch (error) {
    return next(error);
  }
};

const getEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    return res.json({ equipment });
  } catch (error) {
    return next(error);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const equipment = await Equipment.create({
      ownerId: req.user._id,
      ...req.body,
      images,
    });
    return res.status(201).json({ equipment });
  } catch (error) {
    return next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length) {
      updates.images = req.files.map((file) => `/uploads/${file.filename}`);
    }
    const equipment = await Equipment.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      updates,
      { new: true }
    );
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    return res.json({ equipment });
  } catch (error) {
    return next(error);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
    });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    return res.json({ message: 'Equipment deleted' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
