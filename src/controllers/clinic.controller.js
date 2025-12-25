const { validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const { EXT } = require('../utils/fhirExtensions');

function buildClinicSearch(fhir) {
  const name = fhir?.name || '';
  const addr = (fhir?.address && fhir.address[0]) || {};
  const city = addr?.city || '';
  const state = addr?.state || '';

  const specialties = [];
  const exts = fhir?.extension || [];
  const specExt = exts.find((e) => e.url === EXT.specialties);
  if (specExt?.valueCodeableConcept?.text) specialties.push(specExt.valueCodeableConcept.text);

  let consultationFee = 0;
  const feeExt = exts.find((e) => e.url === EXT.consultationFee);
  if (feeExt?.valueMoney?.value) consultationFee = Number(feeExt.valueMoney.value) || 0;

  let isPopular = false;
  const popExt = exts.find((e) => e.url === EXT.isPopular);
  if (typeof popExt?.valueBoolean === 'boolean') isPopular = popExt.valueBoolean;

  let likesCount = 0;
  let commentsCount = 0;
  let viewsCount = 0;
  let averageRating = 0;
  let ratingsCount = 0;

  const engagementExt = exts.find((e) => e.url === EXT.engagement);
  if (engagementExt?.extension) {
    const map = new Map(engagementExt.extension.map((e) => [e.url, e]));
    likesCount = map.get('likesCount')?.valueUnsignedInt || 0;
    commentsCount = map.get('commentsCount')?.valueUnsignedInt || 0;
    viewsCount = map.get('viewsCount')?.valueUnsignedInt || 0;
    averageRating = map.get('averageRating')?.valueDecimal || 0;
    ratingsCount = map.get('ratingsCount')?.valueUnsignedInt || 0;
  }

  return { name, city, state, specialties, consultationFee, isPopular, likesCount, commentsCount, viewsCount, averageRating, ratingsCount };
}

exports.createClinic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const fhir = req.body;
  if (fhir?.resourceType !== 'Organization') {
    return res.status(400).json({ message: 'resourceType must be Organization' });
  }
  if (!fhir.name) return res.status(400).json({ message: 'Organization.name is required' });

  const search = buildClinicSearch(fhir);
  const doc = await Organization.create({
    fhir,
    search,
    active: fhir.active !== false,
    createdBy: req.user?.sub
  });

  return res.status(201).json({ data: doc });
};

exports.listClinics = async (req, res) => {
  const { page, limit } = req.pagination;

  const q = (req.query.q || '').trim();
  const city = (req.query.city || '').trim();
  const state = (req.query.state || '').trim();
  const specialty = (req.query.specialty || '').trim();
  const isPopular = req.query.isPopular;
  const minFee = req.query.minFee ? Number(req.query.minFee) : undefined;
  const maxFee = req.query.maxFee ? Number(req.query.maxFee) : undefined;

  const sort = (req.query.sort || '-views').toString();
  const sortMap = {
    '-views': { 'search.viewsCount': -1 },
    '-rating': { 'search.averageRating': -1 },
    name: { 'search.name': 1 },
    '-fee': { 'search.consultationFee': -1 },
    fee: { 'search.consultationFee': 1 }
  };

  const filter = { active: true };

  if (q) filter['search.name'] = { $regex: q, $options: 'i' };
  if (city) filter['search.city'] = { $regex: `^${city}$`, $options: 'i' };
  if (state) filter['search.state'] = { $regex: `^${state}$`, $options: 'i' };
  if (specialty) filter['search.specialties'] = { $in: [specialty] };
  if (isPopular !== undefined) filter['search.isPopular'] = isPopular === 'true';

  if (minFee !== undefined || maxFee !== undefined) {
    filter['search.consultationFee'] = {};
    if (minFee !== undefined) filter['search.consultationFee'].$gte = minFee;
    if (maxFee !== undefined) filter['search.consultationFee'].$lte = maxFee;
  }

  const result = await Organization.paginate(filter, {
    page,
    limit,
    lean: true,
    sort: sortMap[sort] || { 'search.viewsCount': -1 },
    select: { fhir: 1, search: 1, active: 1, createdAt: 1 }
  });

  return res.json({
    data: result.docs,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.totalDocs,
      totalPages: result.totalPages,
      hasNext: result.hasNextPage
    }
  });
};

exports.getClinicById = async (req, res) => {
  const doc = await Organization.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Clinic not found' });
  return res.json({ data: doc });
};

exports.updateClinic = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType && fhir.resourceType !== 'Organization') {
    return res.status(400).json({ message: 'resourceType must be Organization' });
  }

  const existing = await Organization.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Clinic not found' });

  existing.fhir = fhir;
  existing.search = { ...existing.search, ...buildClinicSearch(fhir) };
  existing.active = fhir.active !== false;

  await existing.save();
  return res.json({ data: existing });
};

exports.deleteClinic = async (req, res) => {
  const doc = await Organization.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Clinic not found' });

  doc.active = false;
  await doc.save();

  return res.json({ message: 'Clinic deactivated' });
};

exports.popularClinics = async (_req, res) => {
  const docs = await Organization.find({ active: true, 'search.isPopular': true })
    .sort({ 'search.viewsCount': -1 })
    .limit(20)
    .lean();

  return res.json({ data: docs });
};
