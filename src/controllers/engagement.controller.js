const Organization = require('../models/Organization');
const Practitioner = require('../models/Practitioner');
const { setEngagementCounters } = require('../utils/fhirExtensions');

async function bump(resourceType, resourceId, updates) {
  const Model = resourceType === 'Organization' ? Organization : Practitioner;
  const doc = await Model.findById(resourceId);
  if (!doc) return null;

  const search = { ...doc.search };
  Object.entries(updates).forEach(([k, v]) => {
    if (v === undefined) return;
    search[k] = (search[k] || 0) + v;
  });

  setEngagementCounters(doc.fhir, {
    likesCount: search.likesCount,
    commentsCount: search.commentsCount,
    viewsCount: search.viewsCount,
    averageRating: search.averageRating,
    ratingsCount: search.ratingsCount
  });

  doc.search = search;
  await doc.save();
  return doc;
}

exports.like = async (req, res) => {
  const { resourceType, resourceId } = req.body;
  const updated = await bump(resourceType, resourceId, { likesCount: 1 });
  if (!updated) return res.status(404).json({ message: 'Resource not found' });
  return res.json({ data: updated.search });
};

exports.view = async (req, res) => {
  const { resourceType, resourceId } = req.body;
  const updated = await bump(resourceType, resourceId, { viewsCount: 1 });
  if (!updated) return res.status(404).json({ message: 'Resource not found' });
  return res.json({ data: updated.search });
};

exports.rate = async (req, res) => {
  const { resourceType, resourceId, rating } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'rating 1-5 required' });

  const Model = resourceType === 'Organization' ? Organization : Practitioner;
  const doc = await Model.findById(resourceId);
  if (!doc) return res.status(404).json({ message: 'Resource not found' });

  const totalRating = (doc.search.averageRating || 0) * (doc.search.ratingsCount || 0) + rating;
  const ratingsCount = (doc.search.ratingsCount || 0) + 1;
  const averageRating = totalRating / ratingsCount;

  doc.search = {
    ...doc.search,
    ratingsCount,
    averageRating
  };

  setEngagementCounters(doc.fhir, {
    likesCount: doc.search.likesCount,
    commentsCount: doc.search.commentsCount,
    viewsCount: doc.search.viewsCount,
    averageRating: doc.search.averageRating,
    ratingsCount: doc.search.ratingsCount
  });

  await doc.save();
  return res.json({ data: doc.search });
};

exports.getEngagement = async (req, res) => {
  const { resourceType, resourceId } = req.query;
  const Model = resourceType === 'Organization' ? Organization : Practitioner;
  const doc = await Model.findById(resourceId).lean();
  if (!doc) return res.status(404).json({ message: 'Resource not found' });
  return res.json({ data: doc.search });
};
