const mongoose = require('mongoose');

const featuresSchema = new mongoose.Schema(
  {
    maxProjects: { type: Number, default: 3 },
    aiGenerations: { type: Number, default: 5 },
    hdExport: { type: Boolean, default: false },
    collaboration: { type: Boolean, default: false },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      required: [true, 'Plan is required'],
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    features: {
      type: featuresSchema,
      default: () => ({
        maxProjects: 3,
        aiGenerations: 5,
        hdExport: false,
        collaboration: false,
      }),
    },
    paymentId: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function (plan) {
  const features = {
    free: { maxProjects: 3, aiGenerations: 5, hdExport: false, collaboration: false },
    pro: { maxProjects: 25, aiGenerations: 100, hdExport: true, collaboration: true },
    enterprise: { maxProjects: -1, aiGenerations: -1, hdExport: true, collaboration: true },
  };
  return features[plan] || features.free;
};

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
