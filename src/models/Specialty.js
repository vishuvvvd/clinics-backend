const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SpecialtySchema = new mongoose.Schema(
  {
    resourceType: { type: String, default: 'CodeSystem', immutable: true, index: true },
    fhir: { type: mongoose.Schema.Types.Mixed, required: true },
    search: {
      name: { type: String, index: true },
      code: { type: String, index: true },
      isTop: { type: Boolean, default: false, index: true }
    },
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

SpecialtySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Specialty', SpecialtySchema);
