const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    resourceType: { type: String, default: 'Communication' },
    subject: {
      reference: { type: String, required: true } // Practitioner/{id} or Organization/{id}
    },
    sender: { reference: { type: String } },
    payload: [{ contentString: String }],
    hidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', CommentSchema);

exports.create = async (req, res) => {
  const { subject, payload } = req.body;
  if (!subject?.reference || !payload?.length) return res.status(400).json({ message: 'subject.reference and payload required' });
  const doc = await Comment.create({
    resourceType: 'Communication',
    subject,
    sender: { reference: `User/${req.user?.sub || 'anonymous'}` },
    payload
  });
  return res.status(201).json({ data: doc });
};

exports.list = async (req, res) => {
  const { page = 1, limit = 10, resourceType, resourceId } = req.query;
  const filter = { hidden: false };
  if (resourceType && resourceId) filter['subject.reference'] = `${resourceType}/${resourceId}`;

  const docs = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Comment.countDocuments(filter);

  return res.json({
    data: docs,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      hasNext: Number(page) * Number(limit) < total
    }
  });
};

exports.remove = async (req, res) => {
  const doc = await Comment.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Comment not found' });
  await doc.deleteOne();
  return res.json({ message: 'Comment deleted' });
};
