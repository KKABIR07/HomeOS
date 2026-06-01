const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['wall', 'door', 'window', 'room', 'column', 'stair', 'roof'],
      required: true,
    },
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
    rotation: { type: Number, default: 0 },
    label: { type: String, default: '' },
    color: { type: String, default: '#CCCCCC' },
    properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const roomMeasurementSchema = new mongoose.Schema(
  {
    name: { type: String },
    area: { type: Number },
  },
  { _id: false }
);

const dimensionsSchema = new mongoose.Schema(
  {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 },
    scale: { type: Number, default: 1 },
  },
  { _id: false }
);

const measurementsSchema = new mongoose.Schema(
  {
    totalArea: { type: Number, default: 0 },
    carpetArea: { type: Number, default: 0 },
    rooms: [roomMeasurementSchema],
  },
  { _id: false }
);

const floorPlanSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Floor plan owner is required'],
    },
    name: {
      type: String,
      required: [true, 'Floor plan name is required'],
      trim: true,
      default: 'Floor Plan',
    },
    floor: {
      type: Number,
      required: true,
      default: 1,
      min: [0, 'Floor number must be non-negative'],
    },
    elements: [elementSchema],
    dimensions: {
      type: dimensionsSchema,
      default: () => ({ width: 800, height: 600, scale: 1 }),
    },
    gridSize: {
      type: Number,
      default: 20,
    },
    measurements: {
      type: measurementsSchema,
      default: () => ({ totalArea: 0, carpetArea: 0, rooms: [] }),
    },
    version: {
      type: Number,
      default: 1,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    aiPrompt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

floorPlanSchema.index({ project: 1, floor: 1 });
floorPlanSchema.index({ owner: 1 });

module.exports = mongoose.model('FloorPlan', floorPlanSchema);
