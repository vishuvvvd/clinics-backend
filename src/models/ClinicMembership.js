const mongoose = require('mongoose');

const ClinicMembershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    role: {
      type: String,
      enum: ['CLINIC_ADMIN', 'CLINIC_EDITOR', 'CLINIC_VIEWER'],
      required: true,
      index: true
    },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

ClinicMembershipSchema.index({ userId: 1, clinicId: 1 }, { unique: true });

module.exports = mongoose.model('ClinicMembership', ClinicMembershipSchema);
