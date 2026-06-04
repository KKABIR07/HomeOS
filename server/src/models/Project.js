const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permission: {
    type: String,
    enum: ['view', 'edit', 'admin'],
    default: 'view',
  },
  addedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
    },
    collaborators: [collaboratorSchema],
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      trim: true,
    },
    plotWidth: {
      type: Number,
      min: [0, 'Plot width must be positive'],
    },
    plotLength: {
      type: Number,
      min: [0, 'Plot length must be positive'],
    },
    budget: {
      type: Number,
      min: [0, 'Budget must be positive'],
    },
    floors: {
      type: Number,
      min: [1, 'Floors must be at least 1'],
      max: [50, 'Floors cannot exceed 50'],
      default: 1,
    },
    houseStyle: {
      type: String,
      enum: ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist', 'industrial', 'mediterranean', 'colonial', 'craftsman'],
      default: 'modern',
    },
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed', 'draft'],
      default: 'draft',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    tags: [{ type: String, trim: true }],
    isShared: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    boundary: {
      corners: { type: [[Number]], default: [] },
      area: { type: Number, default: 0 },
      perimeter: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Generate share token before sharing
projectSchema.methods.generateShareToken = function () {
  this.shareToken = uuidv4();
  this.isShared = true;
  return this.shareToken;
};

// Indexes for common queries
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ houseStyle: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
