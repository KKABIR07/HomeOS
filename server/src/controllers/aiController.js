const aiService = require('../services/aiService');
const FloorPlan = require('../models/FloorPlan');
const Project = require('../models/Project');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Generate AI floor plan
 * @route   POST /api/ai/generate-floorplan
 * @access  Private
 */
const generateFloorPlan = asyncHandler(async (req, res, next) => {
  const {
    projectId,
    plotWidth,
    plotLength,
    floors,
    houseStyle,
    rooms,
    budget,
    requirements,
    saveToProject,
  } = req.body;

  if (!plotWidth || !plotLength) {
    return next(new AppError('Plot dimensions (plotWidth and plotLength) are required', 400));
  }

  const params = {
    plotWidth: Number(plotWidth),
    plotLength: Number(plotLength),
    floors: Number(floors) || 1,
    houseStyle: houseStyle || 'modern',
    rooms: rooms || [],
    budget: budget ? Number(budget) : null,
    requirements: requirements || '',
  };

  const floorPlanData = await aiService.generateFloorPlan(params);

  let savedFloorPlan = null;

  if (saveToProject && projectId) {
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id },
      ],
    });

    if (project) {
      savedFloorPlan = await FloorPlan.create({
        project: projectId,
        owner: req.user._id,
        name: floorPlanData.name || `AI Floor Plan - Floor 1`,
        floor: 1,
        elements: floorPlanData.elements || [],
        dimensions: floorPlanData.dimensions || { width: 800, height: 600, scale: 1 },
        measurements: floorPlanData.measurements || { totalArea: 0, carpetArea: 0, rooms: [] },
        isAIGenerated: true,
        aiPrompt: JSON.stringify(params),
        version: 1,
      });
    }
  }

  res.status(200).json({
    success: true,
    source: floorPlanData.source || 'ai',
    floorPlan: floorPlanData,
    savedFloorPlan,
  });
});

/**
 * @desc    AI cost estimation
 * @route   POST /api/ai/estimate-cost
 * @access  Private
 */
const estimateCost = asyncHandler(async (req, res, next) => {
  const { plotWidth, plotLength, floors, houseStyle, location, budget } = req.body;

  if (!plotWidth || !plotLength) {
    return next(new AppError('Plot dimensions are required', 400));
  }

  const params = {
    plotWidth: Number(plotWidth),
    plotLength: Number(plotLength),
    floors: Number(floors) || 1,
    houseStyle: houseStyle || 'modern',
    location: location || '',
    budget: budget ? Number(budget) : null,
  };

  const estimate = await aiService.estimateCost(params);

  res.status(200).json({
    success: true,
    estimate,
  });
});

/**
 * @desc    AI architect chat assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chat = asyncHandler(async (req, res, next) => {
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return next(new AppError('Messages array is required', 400));
  }

  // Validate message format
  const validRoles = ['user', 'assistant', 'system'];
  for (const msg of messages) {
    if (!msg.role || !validRoles.includes(msg.role)) {
      return next(new AppError('Each message must have a valid role (user, assistant, system)', 400));
    }
    if (!msg.content || typeof msg.content !== 'string') {
      return next(new AppError('Each message must have a content string', 400));
    }
  }

  const response = await aiService.architectChat(messages, context || {});

  res.status(200).json({
    success: true,
    response,
  });
});

/**
 * @desc    AI interior design suggestions
 * @route   POST /api/ai/interior-design
 * @access  Private
 */
const interiorDesign = asyncHandler(async (req, res, next) => {
  const { houseStyle, rooms, budgetCategory, climate } = req.body;

  const params = {
    houseStyle: houseStyle || 'modern',
    rooms: rooms || ['living', 'bedroom', 'kitchen'],
    budgetCategory: budgetCategory || 'mid-range',
    climate: climate || 'tropical',
  };

  const suggestions = await aiService.interiorDesign(params);

  res.status(200).json({
    success: true,
    suggestions,
  });
});

/**
 * @desc    Vastu analysis
 * @route   POST /api/ai/vastu
 * @access  Private
 */
const vastuAnalysis = asyncHandler(async (req, res, next) => {
  const { plotFacing, plotWidth, plotLength, rooms } = req.body;

  if (!plotFacing) {
    return next(new AppError('Plot facing direction is required (north, south, east, west, etc.)', 400));
  }

  const params = {
    plotFacing,
    plotWidth: Number(plotWidth) || 30,
    plotLength: Number(plotLength) || 40,
    rooms: rooms || [],
  };

  const analysis = await aiService.vastuAnalysis(params);

  res.status(200).json({
    success: true,
    analysis,
  });
});

module.exports = {
  generateFloorPlan,
  estimateCost,
  chat,
  interiorDesign,
  vastuAnalysis,
};
