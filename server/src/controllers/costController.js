const PDFDocument = require('pdfkit');
const { calculateCost } = require('../utils/costCalculator');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const Project = require('../models/Project');

/**
 * @desc    Calculate detailed cost estimate
 * @route   POST /api/cost-estimate
 * @access  Private
 */
const getCostEstimate = asyncHandler(async (req, res, next) => {
  const { plotWidth, plotLength, floors, houseStyle, location, budget, projectId } = req.body;

  if (!plotWidth || !plotLength) {
    return next(new AppError('Plot width and length are required', 400));
  }

  const params = {
    plotWidth: Number(plotWidth),
    plotLength: Number(plotLength),
    floors: Number(floors) || 1,
    houseStyle: houseStyle || 'modern',
    location: location || '',
    budget: budget ? Number(budget) : null,
  };

  if (params.plotWidth <= 0 || params.plotLength <= 0) {
    return next(new AppError('Plot dimensions must be positive numbers', 400));
  }

  const estimate = calculateCost(params);

  // If linked to a project, include project name
  let projectInfo = null;
  if (projectId) {
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: req.user._id }, { 'collaborators.user': req.user._id }],
    }).select('projectName location');

    if (project) projectInfo = { id: project._id, name: project.projectName };
  }

  res.status(200).json({
    success: true,
    projectInfo,
    estimate,
  });
});

/**
 * @desc    Generate PDF cost report
 * @route   POST /api/cost-estimate/pdf
 * @access  Private
 */
const generatePDFReport = asyncHandler(async (req, res, next) => {
  const { plotWidth, plotLength, floors, houseStyle, location, budget, projectName } = req.body;

  if (!plotWidth || !plotLength) {
    return next(new AppError('Plot dimensions are required', 400));
  }

  const params = {
    plotWidth: Number(plotWidth),
    plotLength: Number(plotLength),
    floors: Number(floors) || 1,
    houseStyle: houseStyle || 'modern',
    location: location || 'India',
    budget: budget ? Number(budget) : null,
  };

  const estimate = calculateCost(params);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="HouseOS-Cost-Estimate-${Date.now()}.pdf"`
  );

  doc.pipe(res);

  // ── Header ──────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 100).fill('#1a1a2e');
  doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('HouseOS', 50, 30);
  doc.fontSize(12).font('Helvetica').fillColor('#94a3b8').text('AI-Powered Architecture Builder', 50, 62);
  doc.fillColor('#ffffff').fontSize(14).text('Construction Cost Estimate Report', 330, 40, { align: 'right' });
  doc.fontSize(10).fillColor('#94a3b8').text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), 330, 65, { align: 'right' });

  doc.moveDown(3);

  // ── Project Details ──────────────────────────────────────────
  doc.fillColor('#1f2937').fontSize(18).font('Helvetica-Bold').text('Project Details', 50, 120);
  doc.moveTo(50, 142).lineTo(545, 142).strokeColor('#e5e7eb').stroke();

  doc.moveDown(0.5);
  const details = [
    ['Project Name', projectName || 'New Project'],
    ['Location', estimate.summary.location],
    ['Plot Dimensions', `${params.plotWidth} ft × ${params.plotLength} ft`],
    ['Plot Area', `${estimate.summary.plotArea.toLocaleString()} sq.ft`],
    ['Built-up Area', `${estimate.summary.builtUpArea.toLocaleString()} sq.ft`],
    ['Carpet Area', `${estimate.summary.carpetArea.toLocaleString()} sq.ft`],
    ['Number of Floors', params.floors.toString()],
    ['House Style', houseStyle ? houseStyle.charAt(0).toUpperCase() + houseStyle.slice(1) : 'Modern'],
  ];

  details.forEach(([label, value], i) => {
    const y = 155 + i * 22;
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(label + ':', 60, y);
    doc.fillColor('#1f2937').fontSize(10).font('Helvetica-Bold').text(value, 220, y);
  });

  doc.moveDown(8);

  // ── Cost Summary ─────────────────────────────────────────────
  doc.fillColor('#1f2937').fontSize(18).font('Helvetica-Bold').text('Cost Summary', 50, 340);
  doc.moveTo(50, 362).lineTo(545, 362).strokeColor('#e5e7eb').stroke();

  const summaryItems = [
    ['Construction Cost', estimate.totals.construction],
    ['Materials', estimate.totals.materials],
    ['Labor', estimate.totals.labor],
    ['Interior', estimate.totals.interior],
    ['Landscaping', estimate.totals.landscaping],
    ['Architect Fee (5%)', estimate.totals.architectFee],
    ['Contingency (8%)', estimate.totals.contingency],
  ];

  summaryItems.forEach(([label, amount], i) => {
    const y = 375 + i * 24;
    const isOdd = i % 2 !== 0;
    if (isOdd) {
      doc.rect(48, y - 4, 497, 22).fill('#f9fafb');
    }
    doc.fillColor('#374151').fontSize(11).font('Helvetica').text(label, 60, y);
    doc.fillColor('#374151').fontSize(11).font('Helvetica-Bold').text(
      `₹${amount.toLocaleString('en-IN')}`,
      400,
      y,
      { width: 140, align: 'right' }
    );
  });

  // Grand Total
  const totalY = 375 + summaryItems.length * 24 + 10;
  doc.rect(48, totalY, 497, 36).fill('#1a1a2e');
  doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold').text('GRAND TOTAL', 60, totalY + 10);
  doc.fillColor('#60a5fa').fontSize(14).font('Helvetica-Bold').text(
    `₹${estimate.totals.grandTotal.toLocaleString('en-IN')}`,
    400,
    totalY + 10,
    { width: 140, align: 'right' }
  );

  const costPerSqftY = totalY + 50;
  doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(
    `Cost per sq.ft: ₹${estimate.totals.costPerSqft.toLocaleString('en-IN')}`,
    60,
    costPerSqftY
  );

  // ── Budget Status ─────────────────────────────────────────────
  if (estimate.budgetStatus) {
    const bsY = costPerSqftY + 30;
    doc.fillColor('#1f2937').fontSize(14).font('Helvetica-Bold').text('Budget Analysis', 50, bsY);
    doc.moveTo(50, bsY + 18).lineTo(545, bsY + 18).strokeColor('#e5e7eb').stroke();

    const bs = estimate.budgetStatus;
    const statusColor = bs.withinBudget ? '#059669' : '#dc2626';
    doc.fillColor(statusColor).fontSize(12).font('Helvetica-Bold').text(
      bs.withinBudget ? `Within Budget (${bs.percentageDiff}% under)` : `Over Budget by ₹${Math.abs(bs.difference).toLocaleString('en-IN')}`,
      60,
      bsY + 28
    );
  }

  // ── Timeline ─────────────────────────────────────────────────
  doc.addPage();

  doc.fillColor('#1f2937').fontSize(18).font('Helvetica-Bold').text('Construction Timeline', 50, 50);
  doc.moveTo(50, 72).lineTo(545, 72).strokeColor('#e5e7eb').stroke();

  const timeline = estimate.timeline;
  doc.fillColor('#374151').fontSize(11).font('Helvetica').text(`Minimum: ${timeline.minimum} months`, 60, 85);
  doc.fillColor('#374151').fontSize(11).text(`Realistic: ${timeline.realistic} months`, 60, 105);
  doc.fillColor('#374151').fontSize(11).text(`With Delays: ${timeline.withDelays} months`, 60, 125);

  doc.fillColor('#1f2937').fontSize(14).font('Helvetica-Bold').text('Phase Breakdown', 50, 155);
  timeline.phases.forEach((phase, i) => {
    const y = 175 + i * 24;
    if (i % 2 === 0) doc.rect(48, y - 4, 497, 22).fill('#f9fafb');
    doc.fillColor('#374151').fontSize(10).font('Helvetica').text(`${i + 1}. ${phase.phase}`, 60, y);
    doc.fillColor('#4f46e5').fontSize(10).font('Helvetica-Bold').text(phase.duration, 400, y, { width: 140, align: 'right' });
  });

  // ── Footer ───────────────────────────────────────────────────
  doc.fillColor('#9ca3af').fontSize(9).font('Helvetica').text(
    'This estimate is generated by HouseOS AI and is indicative. Actual costs may vary based on material quality, contractor rates, and site conditions. Consult a licensed architect for final estimates.',
    50,
    doc.page.height - 80,
    { width: 495, align: 'center' }
  );

  doc.end();
});

module.exports = { getCostEstimate, generatePDFReport };
