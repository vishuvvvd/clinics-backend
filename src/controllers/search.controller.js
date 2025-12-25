const Organization = require('../models/Organization');
const Practitioner = require('../models/Practitioner');
const Specialty = require('../models/Specialty');

exports.search = async (req, res) => {
  const q = (req.query.q || '').trim();
  const city = (req.query.city || '').trim();
  const limit = Math.min(Number(req.query.limit) || 5, 20);

  const filterName = q ? { $regex: q, $options: 'i' } : undefined;
  const cityFilter = city ? { $regex: `^${city}$`, $options: 'i' } : undefined;

  const [clinics, doctors, specialties] = await Promise.all([
    Organization.find({
      ...(filterName ? { 'search.name': filterName } : {}),
      ...(cityFilter ? { 'search.city': cityFilter } : {}),
      active: true
    })
      .limit(limit)
      .lean(),
    Practitioner.find({
      ...(filterName ? { 'search.name': filterName } : {}),
      ...(cityFilter ? { 'search.city': cityFilter } : {}),
      active: true
    })
      .limit(limit)
      .lean(),
    Specialty.find({ ...(filterName ? { 'search.name': filterName } : {}), active: true }).limit(limit).lean()
  ]);

  return res.json({
    data: {
      clinics,
      doctors,
      specialties
    }
  });
};
