const normalizeRole = (role) =>
  String(role || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace('equipmentowner', 'equipment_owner')
    .replace('deliverypartner', 'delivery');

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const allowed = roles.map(normalizeRole);
    const userRole = normalizeRole(req.user.role);
    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden: this action requires role "${allowed.join('" or "')}" (you are "${req.user.role}")`,
        requiredRoles: allowed,
        yourRole: req.user.role,
      });
    }
    return next();
  };

module.exports = requireRole;
