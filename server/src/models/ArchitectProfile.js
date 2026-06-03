const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String },
    year: { type: Number },
  },
  { _id: false }
);

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    year: { type: Number },
  },
  { _id: true }
);

const architectProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    specializations: [{ type: String, trim: true }],
    experience: {
      type: Number,
      min: [0, 'Experience must be positive'],
      default: 0,
    },
    certifications: [certificationSchema],
    portfolio: [portfolioItemSchema],
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate must be positive'],
    },
    projectRate: {
      type: Number,
      min: [0, 'Project rate must be positive'],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    languages: [{ type: String, trim: true }],
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    website: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    totalProjects: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

architectProfileSchema.index({ rating: -1 });
architectProfileSchema.index({ availability: 1 });
architectProfileSchema.index({ isVerified: 1 });

module.exports = mongoose.model('ArchitectProfile', architectProfileSchema);
