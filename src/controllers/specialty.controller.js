const Specialty = require('../models/Specialty');

function buildSearch(fhir) {
  const name = fhir?.name || '';
  const code = fhir?.concept?.[0]?.code || '';
  const exts = fhir?.extension || [];
  const topExt = exts.find((e) => e.url === 'isTop');
  const isTop = typeof topExt?.valueBoolean === 'boolean' ? topExt.valueBoolean : false;
  return { name, code, isTop };
}

exports.create = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType !== 'CodeSystem') {
    return res.status(400).json({ message: 'resourceType must be CodeSystem' });
  }
  const doc = await Specialty.create({
    fhir,
    search: buildSearch(fhir),
    active: fhir.active !== false
  });
  return res.status(201).json({ data: doc });
};

exports.list = async (req, res) => {
  const { page, limit } = req.pagination;
  const filter = { active: true };
  if (req.query.q) filter['search.name'] = { $regex: req.query.q, $options: 'i' };
  if (req.query.isTop !== undefined) filter['search.isTop'] = req.query.isTop === 'true';

  const result = await Specialty.paginate(filter, {
    page,
    limit,
    lean: true,
    sort: { createdAt: -1 }
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

exports.getById = async (req, res) => {
  const doc = await Specialty.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'Specialty not found' });
  return res.json({ data: doc });
};

exports.update = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType && fhir.resourceType !== 'CodeSystem') {
    return res.status(400).json({ message: 'resourceType must be CodeSystem' });
  }

  const existing = await Specialty.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Specialty not found' });

  existing.fhir = fhir;
  existing.search = { ...existing.search, ...buildSearch(fhir) };
  existing.active = fhir.active !== false;

  await existing.save();
  return res.json({ data: existing });
};

exports.remove = async (req, res) => {
  const doc = await Specialty.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Specialty not found' });
  doc.active = false;
  await doc.save();
  return res.json({ message: 'Specialty deactivated' });
};
