const EquipmentBooking = require('../models/EquipmentBooking');
const Equipment = require('../models/Equipment');
const { BOOKING_STATUS } = require('../utils/constants');
const { createNotification } = require('../services/notifyService');

const createBooking = async (req, res, next) => {
  try {
    const { equipmentId, bookingDate, duration } = req.body;
    if (!equipmentId || !bookingDate || !duration) {
      return res.status(400).json({ message: 'equipmentId, bookingDate, duration required' });
    }
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    const totalPrice = Number(duration) * Number(equipment.rentalPrice);
    const booking = await EquipmentBooking.create({
      farmerId: req.user._id,
      equipmentId,
      bookingDate,
      duration: Number(duration),
      totalPrice,
    });

    await createNotification(
      equipment.ownerId,
      'Equipment booking request',
      `New rental request for ${equipment.equipmentName}`
    );
    await createNotification(
      req.user._id,
      'Rental request sent',
      `Your request for ${equipment.equipmentName} is pending owner approval.`
    );

    const populated = await EquipmentBooking.findById(booking._id)
      .populate('equipmentId')
      .populate('farmerId', 'name');
    return res.status(201).json({
      message: 'Rental request sent successfully',
      booking: populated,
    });
  } catch (error) {
    return next(error);
  }
};

const listBookings = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'farmer') {
      filter.farmerId = req.user._id;
    } else if (req.user.role === 'equipment_owner') {
      const equipmentIds = await Equipment.find({ ownerId: req.user._id }).select('_id');
      filter.equipmentId = { $in: equipmentIds.map((e) => e._id) };
    }
    const bookings = await EquipmentBooking.find(filter)
      .sort({ createdAt: -1 })
      .populate('equipmentId')
      .populate('farmerId', 'name phone');
    return res.json({ bookings });
  } catch (error) {
    return next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!BOOKING_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const booking = await EquipmentBooking.findById(req.params.id).populate('equipmentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const equipment = await Equipment.findById(booking.equipmentId._id || booking.equipmentId);
    if (
      req.user.role === 'equipment_owner' &&
      equipment.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    booking.status = status;
    await booking.save();

    await createNotification(
      booking.farmerId,
      'Booking status updated',
      `Your equipment booking is now: ${status}`
    );

    return res.json({ booking });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBooking,
  listBookings,
  updateBookingStatus,
};
