const Organization = require('../models/Organization');
const Practitioner = require('../models/Practitioner');
const Specialty = require('../models/Specialty');

exports.home = async (req, res) => {
  const [popularClinics, topDoctors, topSpecialties] = await Promise.all([
    Organization.find({ active: true, 'search.isPopular': true }).sort({ 'search.viewsCount': -1 }).limit(5).lean(),
    Practitioner.find({ active: true, 'search.isTopDoctor': true }).sort({ 'search.viewsCount': -1 }).limit(5).lean(),
    Specialty.find({ active: true, 'search.isTop': true }).sort({ createdAt: -1 }).limit(5).lean()
  ]);

  return res.json({
    data: {
      banners: popularClinics,
      topDoctors,
      topSpecialties
    }
  });
};
