const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const OrganizationSchema = new mongoose.Schema(
  {
    resourceType: { type: String, default: 'Organization', immutable: true, index: true },
    fhir: { type: mongoose.Schema.Types.Mixed, required: true },
    search: {
      name: { type: String, index: true },
      city: { type: String, index: true },
      state: { type: String, index: true },
      specialties: [{ type: String, index: true }],
      isPopular: { type: Boolean, default: false, index: true },
      likesCount: { type: Number, default: 0, index: true },
      commentsCount: { type: Number, default: 0 },
      viewsCount: { type: Number, default: 0, index: true },
      averageRating: { type: Number, default: 0, index: true },
      ratingsCount: { type: Number, default: 0 },
      consultationFee: { type: Number, default: 0, index: true },
      geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined }
      }
    },
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
  },
  { timestamps: true }
);

OrganizationSchema.index({ 'search.geo': '2dsphere' });
OrganizationSchema.index({ 'search.city': 1, 'search.specialties': 1, active: 1 });
OrganizationSchema.index({ 'search.isPopular': 1, 'search.viewsCount': -1 });

OrganizationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Organization', OrganizationSchema);
