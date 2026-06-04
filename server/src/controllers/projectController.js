const Project = require('../models/Project');
const FloorPlan = require('../models/FloorPlan');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all projects for current user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
  const {
    status,
    houseStyle,
    search,
    page = 1,
    limit = 10,
    sort = '-createdAt',
  } = req.query;

  const query = {
    $or: [
      { owner: req.user._id },
      { 'collaborators.user': req.user._id },
    ],
  };

  if (status) query.status = status;
  if (houseStyle) query.houseStyle = houseStyle;
  if (search) {
    query.$and = [
      { $or: [
        { projectName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]},
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(query);

  const projects = await Project.find(query)
    .populate('owner', 'name avatar email')
    .populate('collaborators.user', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    projects,
  });
});

/**
 * @desc    Create a project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = asyncHandler(async (req, res, next) => {
  const {
    projectName,
    location,
    plotWidth,
    plotLength,
    budget,
    floors,
    houseStyle,
    description,
    tags,
    boundary,
  } = req.body;

  if (!projectName || !String(projectName).trim()) {
    return next(new AppError('Project name is required', 400));
  }

  const validStyles = ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist', 'industrial', 'mediterranean', 'colonial', 'craftsman'];
  const resolvedStyle = validStyles.includes(houseStyle) ? houseStyle : 'modern';
  const resolvedFloors = Math.min(50, Math.max(1, Number(floors) || 1));
  const resolvedPlotWidth = (plotWidth != null && !isNaN(Number(plotWidth))) ? Math.max(0, Number(plotWidth)) : undefined;
  const resolvedPlotLength = (plotLength != null && !isNaN(Number(plotLength))) ? Math.max(0, Number(plotLength)) : undefined;
  const resolvedBudget = (budget != null && !isNaN(Number(budget))) ? Math.max(0, Number(budget)) : undefined;
  const resolvedDesc = description ? String(description).trim().slice(0, 4000) : undefined;

  try {
    const project = await Project.create({
      owner: req.user._id,
      projectName: String(projectName).trim(),
      location: location ? String(location).trim() : undefined,
      plotWidth: resolvedPlotWidth,
      plotLength: resolvedPlotLength,
      budget: resolvedBudget,
      floors: resolvedFloors,
      houseStyle: resolvedStyle,
      description: resolvedDesc,
      tags: Array.isArray(tags) ? tags : [],
      status: 'draft',
      ...(boundary?.corners?.length >= 3 && {
        boundary: {
          corners: boundary.corners,
          area: Number(boundary.area) || 0,
          perimeter: Number(boundary.perimeter) || 0,
        },
      }),
    });

    await project.populate('owner', 'name avatar email');
    return res.status(201).json({ success: true, project });
  } catch (dbErr) {
    console.error('[createProject] DB error:', dbErr.name, '-', dbErr.message);
    return next(dbErr);
  }
});

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name avatar email')
    .populate('collaborators.user', 'name avatar email');

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Check access
  const isOwner = project.owner._id.toString() === req.user._id.toString();
  const isCollaborator = project.collaborators.some(
    (c) => c.user._id.toString() === req.user._id.toString()
  );
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isCollaborator && !isAdmin) {
    return next(new AppError('Not authorized to view this project', 403));
  }

  // Increment view count
  await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.status(200).json({
    success: true,
    project,
  });
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const isAdmin = project.collaborators.find(
    (c) => c.user.toString() === req.user._id.toString() && c.permission === 'admin'
  );

  if (!isOwner && !isAdmin && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this project', 403));
  }

  const allowedFields = [
    'projectName', 'location', 'plotWidth', 'plotLength',
    'budget', 'floors', 'houseStyle', 'description', 'status', 'tags', 'thumbnail',
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (req.body.boundary?.corners?.length >= 3) {
    updateData.boundary = {
      corners: req.body.boundary.corners,
      area: Number(req.body.boundary.area) || 0,
      perimeter: Number(req.body.boundary.perimeter) || 0,
    };
  }

  project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name avatar email');

  res.status(200).json({
    success: true,
    project,
  });
});

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this project', 403));
  }

  // Delete associated floor plans
  await FloorPlan.deleteMany({ project: project._id });

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Project and all associated floor plans deleted successfully',
  });
});

/**
 * @desc    Toggle archive project
 * @route   POST /api/projects/:id/archive
 * @access  Private
 */
const toggleArchive = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  project.status = project.status === 'archived' ? 'active' : 'archived';
  await project.save();

  res.status(200).json({
    success: true,
    status: project.status,
    message: `Project ${project.status === 'archived' ? 'archived' : 'unarchived'} successfully`,
  });
});

/**
 * @desc    Generate share link
 * @route   POST /api/projects/:id/share
 * @access  Private
 */
const shareProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const { enable = true } = req.body;

  if (!enable) {
    project.isShared = false;
    project.shareToken = undefined;
    await project.save();
    return res.status(200).json({ success: true, message: 'Sharing disabled', isShared: false });
  }

  if (!project.shareToken) {
    project.generateShareToken();
  } else {
    project.isShared = true;
  }
  await project.save();

  const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${project.shareToken}`;

  res.status(200).json({
    success: true,
    shareToken: project.shareToken,
    shareUrl,
    isShared: true,
  });
});

/**
 * @desc    Get shared project (public)
 * @route   GET /api/projects/shared/:token
 * @access  Public
 */
const getSharedProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findOne({
    shareToken: req.params.token,
    isShared: true,
  })
    .populate('owner', 'name avatar')
    .select('-collaborators -shareToken');

  if (!project) {
    return next(new AppError('Shared project not found or sharing has been disabled', 404));
  }

  await Project.findByIdAndUpdate(project._id, { $inc: { views: 1 } });

  const floorPlans = await FloorPlan.find({ project: project._id }).select(
    'name floor elements dimensions measurements isAIGenerated'
  );

  res.status(200).json({
    success: true,
    project,
    floorPlans,
  });
});

/**
 * @desc    Add collaborator to project
 * @route   POST /api/projects/:id/collaborators
 * @access  Private
 */
const addCollaborator = asyncHandler(async (req, res, next) => {
  const { userId, permission = 'view' } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the project owner can add collaborators', 403));
  }

  const alreadyCollab = project.collaborators.some((c) => c.user.toString() === userId);
  if (alreadyCollab) {
    return next(new AppError('User is already a collaborator', 400));
  }

  project.collaborators.push({ user: userId, permission });
  await project.save();

  await project.populate('collaborators.user', 'name avatar email');

  res.status(200).json({
    success: true,
    collaborators: project.collaborators,
  });
});

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  toggleArchive,
  shareProject,
  getSharedProject,
  addCollaborator,
};
