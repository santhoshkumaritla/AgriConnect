const ROLES = {
  FARMER: 'farmer',
  CONSUMER: 'consumer',
  EXPERT: 'expert',
  DELIVERY: 'delivery',
  EQUIPMENT_OWNER: 'equipment_owner',
  ADMIN: 'admin',
};

const ORDER_STATUS = [
  'pending',
  'accepted',
  'packed',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const BOOKING_STATUS = ['pending', 'approved', 'rejected', 'completed'];

const CONSULTATION_STATUS = ['open', 'replied', 'resolved'];

const DELIVERY_STATUS = ['assigned', 'picked_up', 'in_transit', 'delivered'];

module.exports = {
  ROLES,
  ORDER_STATUS,
  BOOKING_STATUS,
  CONSULTATION_STATUS,
  DELIVERY_STATUS,
};
