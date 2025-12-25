const Practitioner = require('../models/Practitioner');
const { EXT } = require('../utils/fhirExtensions');

function buildDoctorSearch(fhir) {
  const name = fhir?.name?.[0]?.text || '';
  const gender = fhir?.gender || '';

  const specialties = [];
  const exts = fhir?.extension || [];
  const specExt = exts.find((e) => e.url === EXT.specialties);
  if (specExt?.valueCodeableConcept?.text) specialties.push(specExt.valueCodeableConcept.text);

  let consultationFee = 0;
  let experienceYears = 0;
  let isTopDoctor = false;
  let likesCount = 0;
  let commentsCount = 0;
  let viewsCount = 0;
  let averageRating = 0;
  let ratingsCount = 0;

  const feeExt = exts.find((e) => e.url === EXT.consultationFee);
  if (feeExt?.valueMoney?.value) consultationFee = Number(feeExt.valueMoney.value) || 0;

  const expExt = exts.find((e) => e.url === EXT.experienceYears);
  if (expExt?.valueUnsignedInt !== undefined) experienceYears = Number(expExt.valueUnsignedInt) || 0;

  const topExt = exts.find((e) => e.url === EXT.isTopDoctor);
  if (typeof topExt?.valueBoolean === 'boolean') isTopDoctor = topExt.valueBoolean;

  const engagementExt = exts.find((e) => e.url === EXT.engagement);
  if (engagementExt?.extension) {
    const map = new Map(engagementExt.extension.map((e) => [e.url, e]));
    likesCount = map.get('likesCount')?.valueUnsignedInt || 0;
    commentsCount = map.get('commentsCount')?.valueUnsignedInt || 0;
    viewsCount = map.get('viewsCount')?.valueUnsignedInt || 0;
    averageRating = map.get('averageRating')?.valueDecimal || 0;
    ratingsCount = map.get('ratingsCount')?.valueUnsignedInt || 0;
  }

  const addr = (fhir?.address && fhir.address[0]) || {};
  const city = addr?.city || '';

  return {
    name,
    gender,
    specialties,
    consultationFee,
    experienceYears,
    isTopDoctor,
    likesCount,
    commentsCount,
    viewsCount,
    averageRating,
    ratingsCount,
    city
  };
}

exports.createDoctor = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType !== 'Practitioner') {
    return res.status(400).json({ message: 'resourceType must be Practitioner' });
  }

  const search = buildDoctorSearch(fhir);
  const doc = await Practitioner.create({
    fhir,
    search,
    active: fhir.active !== false,
    createdBy: req.user?.sub
  });

  return res.status(201).json({ data: doc });
};

exports.listDoctors = async (req, res) => {
  const { page, limit } = req.pagination;

  const q = (req.query.q || '').trim();
  const city = (req.query.city || '').trim();
  const specialty = (req.query.specialty || '').trim();
  const gender = (req.query.gender || '').trim();
  const isTopDoctor = req.query.isTopDoctor;
  const minFee = req.query.minFee ? Number(req.query.minFee) : undefined;
  const maxFee = req.query.maxFee ? Number(req.query.maxFee) : undefined;

  const sort = (req.query.sort || '-views').toString();
  const sortMap = {
    '-views': { 'search.viewsCount': -1 },
    '-rating': { 'search.averageRating': -1 },
    name: { 'search.name': 1 },
    '-fee': { 'search.consultationFee': -1 },
    fee: { 'search.consultationFee': 1 },
    '-experience': { 'search.experienceYears': -1 }
  };

  const filter = { active: true };

  if (q) filter['search.name'] = { $regex: q, $options: 'i' };
  if (city) filter['search.city'] = { $regex: `^${city}$`, $options: 'i' };
  if (specialty) filter['search.specialties'] = { $in: [specialty] };
  if (gender) filter['search.gender'] = { $regex: `^${gender}$`, $options: 'i' };
  if (isTopDoctor !== undefined) filter['search.isTopDoctor'] = isTopDoctor === 'true';

  if (minFee !== undefined || maxFee !== undefined) {
    filter['search.consultationFee'] = {};
    if (minFee !== undefined) filter['search.consultationFee'].$gte = minFee;
    if (maxFee !== undefined) filter['search.consultationFee'].$lte = maxFee;
  }

  const result = await Practitioner.paginate(filter, {
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

exports.getDoctorById = async (req, res) => {
  const doc = await Practitioner.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Doctor not found' });
  return res.json({ data: doc });
};

exports.updateDoctor = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType && fhir.resourceType !== 'Practitioner') {
    return res.status(400).json({ message: 'resourceType must be Practitioner' });
  }

  const existing = await Practitioner.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Doctor not found' });

  existing.fhir = fhir;
  existing.search = { ...existing.search, ...buildDoctorSearch(fhir) };
  existing.active = fhir.active !== false;

  await existing.save();
  return res.json({ data: existing });
};

exports.deleteDoctor = async (req, res) => {
  const doc = await Practitioner.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Doctor not found' });

  doc.active = false;
  await doc.save();

  return res.json({ message: 'Doctor deactivated' });
};

exports.topDoctors = async (_req, res) => {
  const docs = await Practitioner.find({ active: true, 'search.isTopDoctor': true })
    .sort({ 'search.viewsCount': -1 })
    .limit(20)
    .lean();

  return res.json({ data: docs });
};
