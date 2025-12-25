const PractitionerRole = require('../models/PractitionerRole');

function buildSearch(fhir) {
  const specialties = [];
  const daysOfWeek = [];
  const city = fhir?.location?.[0]?.physicalType?.text || '';

  const exts = fhir?.extension || [];
  const spec = exts.find((e) => e.url === 'specialties');
  if (spec?.valueCodeableConcept?.text) specialties.push(spec.valueCodeableConcept.text);

  const availability = fhir?.availableTime || [];
  availability.forEach((a) => {
    (a.daysOfWeek || []).forEach((d) => daysOfWeek.push(d));
  });

  return { specialties, daysOfWeek, city };
}

exports.create = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType !== 'PractitionerRole') {
    return res.status(400).json({ message: 'resourceType must be PractitionerRole' });
  }

  const practitionerId = fhir?.practitioner?.reference?.split('/')[1];
  const organizationId = fhir?.organization?.reference?.split('/')[1];
  if (!practitionerId || !organizationId) {
    return res.status(400).json({ message: 'practitioner and organization reference required' });
  }

  const doc = await PractitionerRole.create({
    fhir,
    practitionerId,
    organizationId,
    search: buildSearch(fhir)
  });

  return res.status(201).json({ data: doc });
};

exports.list = async (req, res) => {
  const { page, limit } = req.pagination;
  const filter = { active: true };

  if (req.query.clinicId) filter.organizationId = req.query.clinicId;
  if (req.query.doctorId) filter.practitionerId = req.query.doctorId;
  if (req.query.specialty) filter['search.specialties'] = { $in: [req.query.specialty] };
  if (req.query.availableDay) filter['search.daysOfWeek'] = { $in: [req.query.availableDay] };

  const result = await PractitionerRole.paginate(filter, {
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
  const doc = await PractitionerRole.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: 'PractitionerRole not found' });
  return res.json({ data: doc });
};

exports.update = async (req, res) => {
  const fhir = req.body;
  if (fhir?.resourceType && fhir.resourceType !== 'PractitionerRole') {
    return res.status(400).json({ message: 'resourceType must be PractitionerRole' });
  }

  const existing = await PractitionerRole.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'PractitionerRole not found' });

  existing.fhir = fhir;
  existing.search = { ...existing.search, ...buildSearch(fhir) };
  existing.active = fhir.active !== false;

  await existing.save();
  return res.json({ data: existing });
};

exports.remove = async (req, res) => {
  const doc = await PractitionerRole.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'PractitionerRole not found' });

  doc.active = false;
  await doc.save();

  return res.json({ message: 'PractitionerRole deactivated' });
};
