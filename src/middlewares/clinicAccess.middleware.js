const ClinicMembership = require('../models/ClinicMembership');

const ROLE_RANK = {
  CLINIC_VIEWER: 1,
  CLINIC_EDITOR: 2,
  CLINIC_ADMIN: 3
};

function clinicAccess(minRole = 'CLINIC_EDITOR') {
  return async (req, res, next) => {
    if (req.user?.role === 'ADMIN') return next();

    const clinicId = req.params.id || req.params.clinicId || req.body.clinicId;
    if (!clinicId) return res.status(400).json({ message: 'Missing clinic id for clinicAccess' });

    const membership = await ClinicMembership.findOne({
      userId: req.user.sub,
      clinicId,
      isActive: true
    }).lean();

    if (!membership) return res.status(403).json({ message: 'No clinic access' });

    const ok = ROLE_RANK[membership.role] >= ROLE_RANK[minRole];
    if (!ok) return res.status(403).json({ message: 'Insufficient clinic role' });

    req.clinicMembership = membership;
    next();
  };
}

module.exports = { clinicAccess };
