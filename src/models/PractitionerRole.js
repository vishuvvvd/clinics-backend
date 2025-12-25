const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PractitionerRoleSchema = new mongoose.Schema(
  {
    resourceType: { type: String, default: 'PractitionerRole', immutable: true, index: true },
    fhir: { type: mongoose.Schema.Types.Mixed, required: true },
    practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Practitioner', index: true, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    search: {
      specialties: [{ type: String, index: true }],
      daysOfWeek: [{ type: String, index: true }],
      city: { type: String, index: true }
    },
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

PractitionerRoleSchema.index({ practitionerId: 1, organizationId: 1 }, { unique: true });
PractitionerRoleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('PractitionerRole', PractitionerRoleSchema);
