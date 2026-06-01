const User = require('../models/User');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    ['name', 'phone', 'address', 'profileImage'].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select('-passwordHash');
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    return res.json({ wishlist: user?.wishlist || [] });
  } catch (error) {
    return next(error);
  }
};

const addWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');
    return res.json({ wishlist: user.wishlist });
  } catch (error) {
    return next(error);
  }
};

const removeWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');
    return res.json({ wishlist: user.wishlist });
  } catch (error) {
    return next(error);
  }
};

const followFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.body;
    if (!farmerId) {
      return res.status(400).json({ message: 'farmerId is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { followingFarmers: farmerId } },
      { new: true }
    ).select('followingFarmers');
    return res.json({ followingFarmers: user.followingFarmers });
  } catch (error) {
    return next(error);
  }
};

const unfollowFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.body;
    if (!farmerId) {
      return res.status(400).json({ message: 'farmerId is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { followingFarmers: farmerId } },
      { new: true }
    ).select('followingFarmers');
    return res.json({ followingFarmers: user.followingFarmers });
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
};

const listExperts = async (req, res, next) => {
  try {
    const experts = await User.find({ role: 'expert' }).select('name profileImage phone');
    return res.json({ experts });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name role profileImage phone address followingFarmers'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  getWishlist,
  addWishlist,
  removeWishlist,
  followFarmer,
  unfollowFarmer,
  listUsers,
  listExperts,
  getUserById,
};
