/**
 * HouseOS Cost Calculator
 * Construction cost calculator for India
 * All rates in INR per square foot
 */

const CONSTRUCTION_RATES = {
  foundation: 800,
  superstructure: 1200,
  roofing: 200,
  electrical: 150,
  plumbing: 100,
  flooring: 200,
  painting: 80,
  finishing: 150,
};

const MATERIAL_RATES = {
  cement: { unit: 'bags', ratePerBag: 400, bagsPerSqft: 0.4 },
  bricks: { unit: 'pieces', ratePerPiece: 8, piecesPerSqft: 8 },
  sand: { unit: 'cubic feet', ratePerCuft: 50, cuftPerSqft: 0.5 },
  steel: { unit: 'kg', ratePerKg: 70, kgPerSqft: 4 },
  tiles: { unit: 'sqft', ratePerSqft: 60 },
};

const LABOR_RATES = {
  mason: { ratePerDay: 800, daysPerSqft: 0.1 },
  electrician: { ratePerDay: 700, daysPerSqft: 0.05 },
  plumber: { ratePerDay: 700, daysPerSqft: 0.04 },
  carpenter: { ratePerDay: 750, daysPerSqft: 0.06 },
};

const STYLE_MULTIPLIERS = {
  minimalist: 1.0,
  traditional: 1.1,
  modern: 1.2,
  contemporary: 1.3,
  luxury: 1.6,
};

const CITY_MULTIPLIERS = {
  mumbai: 1.5,
  delhi: 1.4,
  bangalore: 1.35,
  hyderabad: 1.25,
  chennai: 1.2,
  pune: 1.2,
  kolkata: 1.1,
  default: 1.0,
};

/**
 * Calculate full construction cost estimate
 * @param {Object} params
 * @param {number} params.plotWidth - in feet
 * @param {number} params.plotLength - in feet
 * @param {number} params.floors - number of floors
 * @param {string} params.houseStyle - style enum
 * @param {string} params.location - city name
 * @param {number} params.budget - optional user budget
 */
const calculateCost = (params) => {
  const {
    plotWidth = 30,
    plotLength = 40,
    floors = 1,
    houseStyle = 'modern',
    location = '',
    budget = null,
  } = params;

  // Calculate base area
  const builtUpArea = plotWidth * plotLength * floors;
  const carpetArea = builtUpArea * 0.75; // 75% carpet area factor

  // Get multipliers
  const styleMultiplier = STYLE_MULTIPLIERS[houseStyle] || STYLE_MULTIPLIERS.modern;
  const cityKey = location.toLowerCase().trim();
  const cityMultiplier =
    Object.entries(CITY_MULTIPLIERS).find(([key]) => cityKey.includes(key))?.[1] ||
    CITY_MULTIPLIERS.default;

  // Construction breakdown
  const constructionBreakdown = {};
  let totalConstructionCost = 0;

  for (const [item, rate] of Object.entries(CONSTRUCTION_RATES)) {
    const cost = Math.round(builtUpArea * rate * styleMultiplier * cityMultiplier);
    constructionBreakdown[item] = cost;
    totalConstructionCost += cost;
  }

  // Material estimate
  const materialBreakdown = {};
  let totalMaterialCost = 0;

  for (const [material, data] of Object.entries(MATERIAL_RATES)) {
    let cost;
    if (material === 'tiles') {
      cost = Math.round(carpetArea * data.ratePerSqft * styleMultiplier);
    } else {
      const units = builtUpArea * data[`${Object.keys(data)[2]}`];
      cost = Math.round(units * data[Object.keys(data)[1]]);
    }
    materialBreakdown[material] = {
      cost: cost * cityMultiplier,
      unit: data.unit,
    };
    totalMaterialCost += cost;
  }

  // Labor estimate
  const laborBreakdown = {};
  let totalLaborCost = 0;

  for (const [labor, data] of Object.entries(LABOR_RATES)) {
    const days = Math.ceil(builtUpArea * data.daysPerSqft);
    const cost = Math.round(days * data.ratePerDay * cityMultiplier);
    laborBreakdown[labor] = { cost, days };
    totalLaborCost += cost;
  }

  // Additional costs
  const interiorCost = Math.round(carpetArea * 400 * styleMultiplier);
  const landscapingCost = Math.round(plotWidth * plotLength * 50);
  const architectFee = Math.round(totalConstructionCost * 0.05); // 5% of construction
  const contingency = Math.round(totalConstructionCost * 0.08); // 8% contingency

  const grandTotal =
    totalConstructionCost +
    totalMaterialCost +
    totalLaborCost +
    interiorCost +
    landscapingCost +
    architectFee +
    contingency;

  const budgetStatus = budget
    ? {
        provided: budget,
        estimated: grandTotal,
        difference: budget - grandTotal,
        withinBudget: budget >= grandTotal,
        percentageDiff: Math.round(((budget - grandTotal) / grandTotal) * 100),
      }
    : null;

  return {
    summary: {
      plotArea: plotWidth * plotLength,
      builtUpArea,
      carpetArea,
      floors,
      houseStyle,
      location: location || 'Not specified',
      styleMultiplier,
      cityMultiplier,
    },
    breakdown: {
      construction: { items: constructionBreakdown, total: totalConstructionCost },
      materials: { items: materialBreakdown, total: totalMaterialCost },
      labor: { items: laborBreakdown, total: totalLaborCost },
      interior: { total: interiorCost },
      landscaping: { total: landscapingCost },
      architectFee: { total: architectFee },
      contingency: { total: contingency },
    },
    totals: {
      construction: totalConstructionCost,
      materials: totalMaterialCost,
      labor: totalLaborCost,
      interior: interiorCost,
      landscaping: landscapingCost,
      architectFee,
      contingency,
      grandTotal,
      costPerSqft: Math.round(grandTotal / builtUpArea),
    },
    budgetStatus,
    timeline: estimateTimeline(builtUpArea, floors),
  };
};

/**
 * Estimate construction timeline
 */
const estimateTimeline = (builtUpArea, floors) => {
  const baseMonths = Math.ceil(builtUpArea / 500) + floors * 2;
  return {
    minimum: baseMonths,
    realistic: baseMonths + 2,
    withDelays: baseMonths + 5,
    phases: [
      { phase: 'Foundation & Excavation', duration: '4-6 weeks' },
      { phase: 'Superstructure (per floor)', duration: '6-8 weeks' },
      { phase: 'Roofing', duration: '2-3 weeks' },
      { phase: 'Electrical & Plumbing', duration: '4-6 weeks' },
      { phase: 'Plastering & Finishing', duration: '4-6 weeks' },
      { phase: 'Flooring & Tiling', duration: '3-4 weeks' },
      { phase: 'Painting & Final Touches', duration: '2-3 weeks' },
    ],
  };
};

module.exports = { calculateCost, estimateTimeline, CONSTRUCTION_RATES, MATERIAL_RATES };
