const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PractitionerSchema = new mongoose.Schema(
  {
    resourceType: { type: String, default: 'Practitioner', immutable: true, index: true },
    fhir: { type: mongoose.Schema.Types.Mixed, required: true },
    search: {
      name: { type: String, index: true },
      gender: { type: String, index: true },
      specialties: [{ type: String, index: true }],
      city: { type: String, index: true },
      isTopDoctor: { type: Boolean, default: false, index: true },
      likesCount: { type: Number, default: 0, index: true },
      commentsCount: { type: Number, default: 0 },
      viewsCount: { type: Number, default: 0, index: true },
      averageRating: { type: Number, default: 0, index: true },
      ratingsCount: { type: Number, default: 0 },
      consultationFee: { type: Number, default: 0, index: true },
      experienceYears: { type: Number, default: 0, index: true }
    },
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
  },
  { timestamps: true }
);

PractitionerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Practitioner', PractitionerSchema);
