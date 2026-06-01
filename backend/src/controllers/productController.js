const Product = require('../models/Product');

const listProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      organic,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      farmerId,
      mine,
    } = req.query;

    const filter = {};
    if (mine === 'true' && req.user) {
      filter.farmerId = req.user._id;
      filter.isActive = { $in: [true, false] };
    } else {
      filter.isActive = true;
    }
    if (farmerId) {
      filter.farmerId = farmerId;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (organic !== undefined) {
      filter.organicStatus = organic === 'true';
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popularity: { quantity: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;
    const numericLimit = Math.min(Number(limit) || 12, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(numericLimit)
        .populate('farmerId', 'name profileImage'),
      Product.countDocuments(filter),
    ]);

    return res.json({
      items,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
    });
  } catch (error) {
    return next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'farmerId',
      'name profileImage'
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const product = await Product.create({
      farmerId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      organicStatus: req.body.organicStatus === 'true' || req.body.organicStatus === true,
      harvestDate: req.body.harvestDate || undefined,
      images,
    });
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const updates = {};
    ['title', 'description', 'category', 'isActive'].forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.body.price !== undefined) updates.price = Number(req.body.price);
    if (req.body.quantity !== undefined) updates.quantity = Number(req.body.quantity);
    if (req.body.organicStatus !== undefined) {
      updates.organicStatus = req.body.organicStatus === 'true' || req.body.organicStatus === true;
    }
    if (req.body.harvestDate) updates.harvestDate = req.body.harvestDate;
    if (req.files && req.files.length) {
      updates.images = req.files.map((file) => `/uploads/${file.filename}`);
    }
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user._id },
      updates,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user._id,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ message: 'Product deleted' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
