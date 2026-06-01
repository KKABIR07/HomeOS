const FloorPlan = require('../models/FloorPlan');
const Project = require('../models/Project');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Helper: check if user has access to a project
 */
const checkProjectAccess = async (projectId, userId, requiredPermission = 'view') => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, hasAccess: false };

  const isOwner = project.owner.toString() === userId.toString();
  const collaborator = project.collaborators.find((c) => c.user.toString() === userId.toString());

  const permissionLevel = { view: 1, edit: 2, admin: 3 };
  const requiredLevel = permissionLevel[requiredPermission] || 1;

  if (isOwner) return { project, hasAccess: true };
  if (collaborator) {
    const collabLevel = permissionLevel[collaborator.permission] || 1;
    return { project, hasAccess: collabLevel >= requiredLevel };
  }

  return { project, hasAccess: false };
};

/**
 * @desc    Get all floor plans for a project
 * @route   GET /api/floorplans?projectId=xxx
 * @access  Private
 */
const getFloorPlans = asyncHandler(async (req, res, next) => {
  const { projectId } = req.query;

  if (!projectId) {
    return next(new AppError('Project ID is required', 400));
  }

  const { project, hasAccess } = await checkProjectAccess(projectId, req.user._id);
  if (!project) return next(new AppError('Project not found', 404));
  if (!hasAccess && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this project\'s floor plans', 403));
  }

  const floorPlans = await FloorPlan.find({ project: projectId })
    .sort('floor')
    .populate('owner', 'name avatar');

  res.status(200).json({
    success: true,
    count: floorPlans.length,
    floorPlans,
  });
});

/**
 * @desc    Get single floor plan
 * @route   GET /api/floorplans/:id
 * @access  Private
 */
const getFloorPlan = asyncHandler(async (req, res, next) => {
  const floorPlan = await FloorPlan.findById(req.params.id)
    .populate('owner', 'name avatar')
    .populate('project', 'projectName owner collaborators');

  if (!floorPlan) {
    return next(new AppError('Floor plan not found', 404));
  }

  const { hasAccess } = await checkProjectAccess(
    floorPlan.project._id,
    req.user._id
  );

  if (!hasAccess && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this floor plan', 403));
  }

  res.status(200).json({
    success: true,
    floorPlan,
  });
});

/**
 * @desc    Save/create floor plan
 * @route   POST /api/floorplans
 * @access  Private
 */
const saveFloorPlan = asyncHandler(async (req, res, next) => {
  const {
    projectId,
    name,
    floor,
    elements,
    dimensions,
    gridSize,
    measurements,
    isAIGenerated,
    aiPrompt,
  } = req.body;

  if (!projectId) {
    return next(new AppError('Project ID is required', 400));
  }

  const { project, hasAccess } = await checkProjectAccess(projectId, req.user._id, 'edit');
  if (!project) return next(new AppError('Project not found', 404));
  if (!hasAccess && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to save floor plans for this project', 403));
  }

  const floorPlan = await FloorPlan.create({
    project: projectId,
    owner: req.user._id,
    name: name || `Floor ${floor || 1} Plan`,
    floor: floor || 1,
    elements: elements || [],
    dimensions: dimensions || { width: 800, height: 600, scale: 1 },
    gridSize: gridSize || 20,
    measurements: measurements || { totalArea: 0, carpetArea: 0, rooms: [] },
    isAIGenerated: isAIGenerated || false,
    aiPrompt,
    version: 1,
  });

  await floorPlan.populate('owner', 'name avatar');

  res.status(201).json({
    success: true,
    floorPlan,
  });
});

/**
 * @desc    Update floor plan
 * @route   PUT /api/floorplans/:id
 * @access  Private
 */
const updateFloorPlan = asyncHandler(async (req, res, next) => {
  let floorPlan = await FloorPlan.findById(req.params.id);

  if (!floorPlan) {
    return next(new AppError('Floor plan not found', 404));
  }

  const { hasAccess } = await checkProjectAccess(floorPlan.project, req.user._id, 'edit');
  if (!hasAccess && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this floor plan', 403));
  }

  const allowedFields = ['name', 'elements', 'dimensions', 'gridSize', 'measurements'];
  const updateData = { version: floorPlan.version + 1 };

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  floorPlan = await FloorPlan.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name avatar');

  res.status(200).json({
    success: true,
    floorPlan,
  });
});

/**
 * @desc    Delete floor plan
 * @route   DELETE /api/floorplans/:id
 * @access  Private
 */
const deleteFloorPlan = asyncHandler(async (req, res, next) => {
  const floorPlan = await FloorPlan.findById(req.params.id);

  if (!floorPlan) {
    return next(new AppError('Floor plan not found', 404));
  }

  const isOwner = floorPlan.owner.toString() === req.user._id.toString();
  const { hasAccess } = await checkProjectAccess(floorPlan.project, req.user._id, 'admin');

  if (!isOwner && !hasAccess && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this floor plan', 403));
  }

  await floorPlan.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Floor plan deleted successfully',
  });
});

/**
 * @desc    Duplicate a floor plan
 * @route   POST /api/floorplans/:id/duplicate
 * @access  Private
 */
const duplicateFloorPlan = asyncHandler(async (req, res, next) => {
  const original = await FloorPlan.findById(req.params.id);

  if (!original) {
    return next(new AppError('Floor plan not found', 404));
  }

  const { hasAccess } = await checkProjectAccess(original.project, req.user._id, 'edit');
  if (!hasAccess && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const duplicate = await FloorPlan.create({
    project: original.project,
    owner: req.user._id,
    name: `${original.name} (Copy)`,
    floor: original.floor,
    elements: original.elements,
    dimensions: original.dimensions,
    gridSize: original.gridSize,
    measurements: original.measurements,
    isAIGenerated: false,
    version: 1,
  });

  res.status(201).json({
    success: true,
    floorPlan: duplicate,
  });
});

module.exports = {
  getFloorPlans,
  getFloorPlan,
  saveFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  duplicateFloorPlan,
};
