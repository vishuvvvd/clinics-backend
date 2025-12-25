const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: '' },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
      index: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
