let OpenAIClass = null;
try {
  const openaiModule = require('openai');
  // openai v4 exports: module.exports = OpenAI (the class), also exports.OpenAI
  OpenAIClass = openaiModule.OpenAI || openaiModule.default || openaiModule;
} catch {
  OpenAIClass = null;
}

let openaiClient = null;

const getClient = () => {
  if (!openaiClient && OpenAIClass && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAIClass({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const hasApiKey = () => !!process.env.OPENAI_API_KEY;

// ─── Mock Responses ────────────────────────────────────────────────────────────

const mockFloorPlan = (params) => {
  const { plotWidth = 30, plotLength = 40, floors = 1, houseStyle = 'modern', rooms = [] } = params;
  const totalArea = plotWidth * plotLength;
  const carpetAreaPerFloor = Math.round(totalArea * 0.75);

  const defaultRooms = rooms.length > 0 ? rooms : ['living', 'kitchen', 'bedroom', 'bathroom'];
  const roomCount = defaultRooms.length;
  const approxRoomArea = Math.round(carpetAreaPerFloor / roomCount);

  const elements = [];
  let elementId = 1;

  // Outer walls
  elements.push(
    { id: `wall-${elementId++}`, type: 'wall', x: 0, y: 0, width: plotWidth * 10, height: 10, rotation: 0, label: 'North Wall', color: '#374151', properties: { thickness: 9 } },
    { id: `wall-${elementId++}`, type: 'wall', x: 0, y: plotLength * 10, width: plotWidth * 10, height: 10, rotation: 0, label: 'South Wall', color: '#374151', properties: { thickness: 9 } },
    { id: `wall-${elementId++}`, type: 'wall', x: 0, y: 0, width: 10, height: plotLength * 10, rotation: 0, label: 'West Wall', color: '#374151', properties: { thickness: 9 } },
    { id: `wall-${elementId++}`, type: 'wall', x: plotWidth * 10, y: 0, width: 10, height: plotLength * 10, rotation: 0, label: 'East Wall', color: '#374151', properties: { thickness: 9 } }
  );

  // Main entrance door
  elements.push(
    { id: `door-${elementId++}`, type: 'door', x: Math.round(plotWidth * 5), y: plotLength * 10, width: 30, height: 10, rotation: 0, label: 'Main Door', color: '#8B4513', properties: { swing: 'inward', material: 'wood' } }
  );

  // Windows
  elements.push(
    { id: `win-${elementId++}`, type: 'window', x: Math.round(plotWidth * 2), y: 0, width: 25, height: 8, rotation: 0, label: 'Window', color: '#60a5fa', properties: { material: 'glass', type: 'sliding' } },
    { id: `win-${elementId++}`, type: 'window', x: Math.round(plotWidth * 7), y: 0, width: 25, height: 8, rotation: 0, label: 'Window', color: '#60a5fa', properties: { material: 'glass', type: 'sliding' } }
  );

  // Rooms based on style
  const roomColors = {
    living: '#dbeafe', kitchen: '#dcfce7', bedroom: '#fef3c7',
    bathroom: '#e0e7ff', dining: '#fce7f3', garage: '#f3f4f6',
  };

  const roomLayouts = [
    { name: 'Living Room', x: 20, y: 20, width: Math.round(plotWidth * 4), height: Math.round(plotLength * 4) },
    { name: 'Kitchen', x: Math.round(plotWidth * 5), y: 20, width: Math.round(plotWidth * 3), height: Math.round(plotLength * 3) },
    { name: 'Master Bedroom', x: 20, y: Math.round(plotLength * 5), width: Math.round(plotWidth * 4), height: Math.round(plotLength * 4) },
    { name: 'Bathroom', x: Math.round(plotWidth * 5), y: Math.round(plotLength * 5), width: Math.round(plotWidth * 2), height: Math.round(plotLength * 2) },
  ];

  roomLayouts.forEach((room, idx) => {
    elements.push({
      id: `room-${elementId++}`,
      type: 'room',
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      rotation: 0,
      label: room.name,
      color: Object.values(roomColors)[idx % Object.keys(roomColors).length],
      properties: { area: Math.round((room.width * room.height) / 100) },
    });
  });

  if (floors > 1) {
    elements.push({
      id: `stair-${elementId++}`,
      type: 'stair',
      x: Math.round(plotWidth * 4),
      y: Math.round(plotLength * 3),
      width: 30,
      height: 60,
      rotation: 0,
      label: 'Staircase',
      color: '#e5e7eb',
      properties: { rise: 7, run: 11, totalSteps: 14 },
    });
  }

  return {
    name: `${houseStyle.charAt(0).toUpperCase() + houseStyle.slice(1)} Floor Plan - Floor 1`,
    floor: 1,
    elements,
    dimensions: { width: plotWidth * 10 + 20, height: plotLength * 10 + 20, scale: 1 },
    gridSize: 10,
    measurements: {
      totalArea,
      carpetArea: carpetAreaPerFloor,
      rooms: roomLayouts.map((r) => ({
        name: r.name,
        area: Math.round((r.width * r.height) / 100),
      })),
    },
    isAIGenerated: true,
  };
};

const mockCostEstimate = (params) => {
  const { calculateCost } = require('../utils/costCalculator');
  return calculateCost(params);
};

const mockChatResponse = (messages, context) => {
  const lastMessage = messages[messages.length - 1]?.content || '';

  const responses = {
    'floor plan': 'For a well-designed floor plan, consider the sun path for natural lighting — bedrooms ideally face east, living areas south. Ensure a clear separation between public zones (living, dining) and private zones (bedrooms). A minimum of 3-4 ft corridor width improves accessibility.',
    'vastu': 'Key Vastu guidelines: The main entrance should ideally face North or East. Kitchen in the South-East (Agni corner). Master bedroom in South-West for stability. Avoid placing toilets in the North-East corner. Staircase in South or West is preferred.',
    'budget': 'For cost optimization in Indian construction: Use standard brick sizes to minimize cutting waste. Opt for vitrified tiles over marble for better cost-performance. Aluminum windows vs. UPVC save 20-30%. Pre-engineered trusses reduce roofing costs significantly.',
    'material': 'Recommended materials for modern Indian construction: M20 grade concrete for residential slabs, Fe-500 TMT steel for reinforcement, AAC blocks for partition walls (lighter, better insulation), double-glazed windows for thermal comfort in extreme climates.',
    'default': `Great question about ${lastMessage.slice(0, 30)}. As your AI architecture assistant, I recommend consulting with a structural engineer for load-bearing calculations. For aesthetic design, the ${context?.houseStyle || 'modern'} style works excellently with clean lines, functional spaces, and optimal natural light integration. Would you like specific recommendations for your ${context?.plotWidth || 30}x${context?.plotLength || 40} ft plot?`,
  };

  const key = Object.keys(responses).find((k) =>
    lastMessage.toLowerCase().includes(k)
  ) || 'default';

  return {
    role: 'assistant',
    content: responses[key],
    model: 'mock-gpt-4o',
    usage: { prompt_tokens: 150, completion_tokens: 80, total_tokens: 230 },
  };
};

const mockInteriorDesign = (params) => {
  const { houseStyle = 'modern', rooms = ['living', 'bedroom', 'kitchen'] } = params;

  const styleGuides = {
    modern: {
      colorPalette: ['#1f2937', '#f9fafb', '#4f46e5', '#06b6d4'],
      materials: ['concrete', 'glass', 'steel', 'engineered wood'],
      furniture: 'Clean-lined, low-profile furniture with hidden storage',
      lighting: 'Recessed LED lighting, pendant lights over dining, floor lamps',
    },
    luxury: {
      colorPalette: ['#1c1917', '#f5f5f4', '#d4af37', '#8b7355'],
      materials: ['Italian marble', 'solid wood', 'brass fixtures', 'silk upholstery'],
      furniture: 'Custom millwork, statement pieces, plush seating',
      lighting: 'Chandeliers, cove lighting, wall sconces',
    },
    minimalist: {
      colorPalette: ['#ffffff', '#f3f4f6', '#e5e7eb', '#374151'],
      materials: ['white walls', 'light oak wood', 'matte tiles', 'natural stone'],
      furniture: 'Multi-functional, hidden storage, neutral tones',
      lighting: 'Diffused natural light, slim track lighting',
    },
    traditional: {
      colorPalette: ['#7c2d12', '#fef3c7', '#14532d', '#1e3a5f'],
      materials: ['teak wood', 'stone flooring', 'terracotta', 'brass'],
      furniture: 'Carved wood furniture, traditional motifs, upholstered seating',
      lighting: 'Diyas, lanterns, warm incandescent bulbs',
    },
    contemporary: {
      colorPalette: ['#0f172a', '#f8fafc', '#0ea5e9', '#10b981'],
      materials: ['textured walls', 'bamboo', 'recycled materials', 'smart glass'],
      furniture: 'Ergonomic design, modular systems, mixed materials',
      lighting: 'Smart LED systems, natural integration, accent lighting',
    },
  };

  const guide = styleGuides[houseStyle] || styleGuides.modern;

  return {
    style: houseStyle,
    colorPalette: guide.colorPalette,
    materialSuggestions: guide.materials,
    furnitureGuidance: guide.furniture,
    lightingPlan: guide.lighting,
    roomSuggestions: rooms.map((room) => ({
      room,
      suggestions: [
        `For ${room}: Use ${guide.materials[0]} as the primary surface material`,
        `Consider ${guide.colorPalette[0]} as the dominant color`,
        `Add ${guide.lighting.split(',')[0].toLowerCase()} for ambiance`,
      ],
    })),
    plants: ['Snake plant (air purifying)', 'Pothos (low maintenance)', 'Peace lily (bedroom)'],
    tips: [
      'Use mirrors to create an illusion of space in smaller rooms',
      'Stick to a maximum of 3 primary colors throughout the home',
      'Invest in quality lighting — it transforms any space',
      'Layer textures to add depth without clutter',
    ],
  };
};

const mockVastuAnalysis = (params) => {
  const { plotFacing = 'north', rooms = [], plotWidth = 30, plotLength = 40 } = params;

  const facingScore = { north: 9, east: 9, northeast: 10, south: 6, west: 7, southwest: 5, northwest: 7, southeast: 7 };
  const score = facingScore[plotFacing.toLowerCase()] || 7;

  return {
    overallScore: score,
    plotFacing,
    summary: score >= 8
      ? 'Excellent Vastu compliance. This plot has very favorable energy flow.'
      : score >= 6
      ? 'Good Vastu compliance with minor corrections recommended.'
      : 'Several Vastu corrections needed for optimal energy flow.',
    positiveAspects: [
      plotFacing.includes('north') || plotFacing.includes('east')
        ? 'Main entrance facing favourable direction (North/East) allows positive energy'
        : 'Consider adding a Vastu yantra at the main entrance',
      'Rectangular plot shape promotes balanced energy',
      `${plotWidth}x${plotLength} ft dimensions are suitable for residential construction`,
    ],
    corrections: [
      { issue: 'Toilet placement', recommendation: 'Avoid North-East corner. Best in South or West zone.', severity: 'high' },
      { issue: 'Kitchen location', recommendation: 'Ideal in South-East (Agni corner). Cook facing East.', severity: 'medium' },
      { issue: 'Master bedroom', recommendation: 'South-West corner for stability and good health.', severity: 'medium' },
      { issue: 'Pooja room', recommendation: 'North-East corner is most auspicious.', severity: 'low' },
    ],
    roomRecommendations: {
      'Master Bedroom': 'South-West',
      'Kitchen': 'South-East',
      'Pooja Room': 'North-East',
      'Study': 'North or East',
      'Children Bedroom': 'North-West or West',
      'Guest Room': 'North-West',
      'Bathroom/Toilet': 'South or West',
      'Living Room': 'North or East',
    },
    remedies: [
      'Plant Tulsi (Holy Basil) in the North-East corner',
      'Use light colors (white, cream, light yellow) for walls',
      'Keep the North-East corner clean and clutter-free',
      'Place a copper water pot in the Brahmasthan (center) area',
    ],
  };
};

// ─── Real OpenAI Calls ──────────────────────────────────────────────────────────

const generateFloorPlan = async (params) => {
  const client = getClient();
  if (!client) return { ...mockFloorPlan(params), source: 'mock' };

  const prompt = `You are an expert architect. Generate a JSON floor plan layout for a ${params.houseStyle} style house.
Plot: ${params.plotWidth}ft x ${params.plotLength}ft, ${params.floors} floor(s).
Required rooms: ${params.rooms?.join(', ') || 'living room, kitchen, 2 bedrooms, 2 bathrooms'}.
Budget: ${params.budget ? `₹${params.budget}` : 'standard'}.

Return a JSON object with this exact structure:
{
  "name": "string",
  "elements": [
    {"id": "string", "type": "wall|door|window|room|column|stair|roof", "x": number, "y": number, "width": number, "height": number, "rotation": number, "label": "string", "color": "#hex", "properties": {}}
  ],
  "measurements": {"totalArea": number, "carpetArea": number, "rooms": [{"name": "string", "area": number}]}
}
Coordinates are in pixels at 1ft = 10px. Return ONLY valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { ...result, isAIGenerated: true, source: 'openai' };
  } catch (err) {
    console.error('OpenAI generateFloorPlan error:', err.message);
    return { ...mockFloorPlan(params), source: 'mock-fallback' };
  }
};

const estimateCost = async (params) => {
  const client = getClient();
  if (!client) return { ...mockCostEstimate(params), source: 'mock' };

  const prompt = `You are a construction cost expert for India. Estimate construction costs for:
- Plot: ${params.plotWidth}ft x ${params.plotLength}ft
- Floors: ${params.floors}
- Style: ${params.houseStyle}
- Location: ${params.location || 'India'}
- Budget provided: ${params.budget ? `₹${params.budget}` : 'none'}

Provide a detailed breakdown in JSON with keys: construction, materials, labor, interior, total, costPerSqft, timeline.
Return ONLY valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { ...result, source: 'openai' };
  } catch (err) {
    console.error('OpenAI estimateCost error:', err.message);
    return { ...mockCostEstimate(params), source: 'mock-fallback' };
  }
};

const architectChat = async (messages, context = {}) => {
  const client = getClient();
  if (!client) return mockChatResponse(messages, context);

  const systemPrompt = `You are HouseOS AI — an expert architect and construction consultant for India.
You help users design homes, optimize floor plans, estimate costs, and provide Vastu guidance.
Context: ${JSON.stringify(context)}
Be concise, practical, and always relate advice to Indian construction standards and conditions.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return {
      role: 'assistant',
      content: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      source: 'openai',
    };
  } catch (err) {
    console.error('OpenAI architectChat error:', err.message);
    return { ...mockChatResponse(messages, context), source: 'mock-fallback' };
  }
};

const interiorDesign = async (params) => {
  const client = getClient();
  if (!client) return { ...mockInteriorDesign(params), source: 'mock' };

  const prompt = `You are an interior designer specializing in Indian homes. Provide interior design suggestions for a ${params.houseStyle} style home.
Rooms: ${params.rooms?.join(', ') || 'all rooms'}.
Budget category: ${params.budgetCategory || 'mid-range'}.
Climate: ${params.climate || 'tropical'}.
Return detailed JSON with: colorPalette, materials, furniture, lighting, roomSuggestions, tips.
Return ONLY valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { ...result, source: 'openai' };
  } catch (err) {
    console.error('OpenAI interiorDesign error:', err.message);
    return { ...mockInteriorDesign(params), source: 'mock-fallback' };
  }
};

const vastuAnalysis = async (params) => {
  const client = getClient();
  if (!client) return { ...mockVastuAnalysis(params), source: 'mock' };

  const prompt = `You are a Vastu Shastra expert. Analyze this property:
Plot facing: ${params.plotFacing}
Dimensions: ${params.plotWidth}ft x ${params.plotLength}ft
Room layout: ${JSON.stringify(params.rooms || {})}

Provide a comprehensive Vastu analysis in JSON with: overallScore (1-10), positiveAspects, corrections (with severity), roomRecommendations, remedies.
Return ONLY valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { ...result, source: 'openai' };
  } catch (err) {
    console.error('OpenAI vastuAnalysis error:', err.message);
    return { ...mockVastuAnalysis(params), source: 'mock-fallback' };
  }
};

module.exports = {
  generateFloorPlan,
  estimateCost,
  architectChat,
  interiorDesign,
  vastuAnalysis,
  hasApiKey,
};
