// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Alert, Stack,
  TextField, Button, Slider, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  Divider, Switch, FormControlLabel,
} from '@mui/material'
import {
  AccountBalance, Nature, Home, TrendingUp, Calculate, CheckCircle,
  Warning, Star,
} from '@mui/icons-material'
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'

// ─── Feature 21: AI Quantity Surveyor ─────────────────────────────────────────
function AIQuantitySurveyorTab() {
  const [params, setParams] = useState({ plotArea: 2000, floors: 2, wallThickness: '9in', ceilingHeight: 10, finishLevel: 'standard' })

  const qs = useMemo(() => {
    const pa = params.plotArea
    const carpetArea = pa * params.floors * 0.85
    const wallArea = Math.sqrt(pa) * 4 * params.floors * params.ceilingHeight * 0.85
    const wallThkMult = params.wallThickness === '9in' ? 1 : params.wallThickness === '4.5in' ? 0.5 : 1.5

    const items = [
      { cat: 'Foundation', item: 'Excavation', qty: Math.ceil(pa * 0.0929 * 1.2), unit: 'm³', rate: 200 },
      { cat: 'Foundation', item: 'PCC 1:4:8', qty: Math.ceil(pa * 0.0929 * 0.1), unit: 'm³', rate: 5000 },
      { cat: 'Foundation', item: 'RCC Foundation (M20)', qty: Math.ceil(pa * 0.0929 * 0.15 * params.floors), unit: 'm³', rate: 7500 },
      { cat: 'Structure', item: 'Column Concrete', qty: Math.ceil(pa * 0.0929 * 0.04 * params.floors), unit: 'm³', rate: 8500 },
      { cat: 'Structure', item: 'Beam Concrete', qty: Math.ceil(pa * 0.0929 * 0.06 * params.floors), unit: 'm³', rate: 8000 },
      { cat: 'Structure', item: 'Slab Concrete (125mm)', qty: Math.ceil(pa * 0.0929 * 0.125 * params.floors), unit: 'm³', rate: 7000 },
      { cat: 'Structure', item: 'Fe 500 Steel', qty: Math.ceil(pa * 0.0929 * 95 * params.floors), unit: 'kg', rate: 68 },
      { cat: 'Masonry', item: 'AAC Blocks (200mm)', qty: Math.ceil(wallArea * 0.0929 * 10 * wallThkMult), unit: 'blocks', rate: 85 },
      { cat: 'Masonry', item: 'OPC 53 Cement (masonry)', qty: Math.ceil(wallArea * 0.0929 * 0.35), unit: 'bags', rate: 420 },
      { cat: 'Flooring', item: 'Vitrified Tiles (600×600)', qty: Math.ceil(carpetArea), unit: 'sq ft', rate: { standard: 80, premium: 150, luxury: 280 }[params.finishLevel] },
      { cat: 'Flooring', item: 'Floor Adhesive & Grout', qty: Math.ceil(carpetArea / 100), unit: 'bags', rate: 850 },
      { cat: 'Plaster', item: 'Internal Plaster (12mm)', qty: Math.ceil(wallArea * 1.1), unit: 'sq ft', rate: 28 },
      { cat: 'Plaster', item: 'External Plaster (20mm)', qty: Math.ceil(wallArea * 0.5 * 1.1), unit: 'sq ft', rate: 35 },
      { cat: 'Paint', item: `${params.finishLevel === 'luxury' ? 'Premium Luxury' : params.finishLevel === 'premium' ? 'Royale Shyne' : 'Interior Emulsion'} Paint`, qty: Math.ceil(wallArea * 1.1), unit: 'sq ft', rate: { standard: 18, premium: 28, luxury: 45 }[params.finishLevel] },
      { cat: 'Paint', item: 'Exterior Texture/Paint', qty: Math.ceil(wallArea * 0.5), unit: 'sq ft', rate: 32 },
      { cat: 'Electrical', item: 'Wiring & Conduits', qty: Math.ceil(carpetArea), unit: 'sq ft', rate: 55 },
      { cat: 'Plumbing', item: 'Supply + Drainage', qty: Math.ceil(carpetArea), unit: 'sq ft', rate: 45 },
      { cat: 'Windows/Doors', item: 'Doors (uPVC/Wooden)', qty: Math.ceil(params.floors * 7), unit: 'nos', rate: 9500 },
      { cat: 'Windows/Doors', item: 'Windows (uPVC)', qty: Math.ceil(params.floors * 8), unit: 'nos', rate: 7500 },
    ]

    return items.map(i => ({ ...i, amount: Math.round(i.qty * i.rate) }))
  }, [params])

  const totalCost = qs.reduce((s, q) => s + q.amount, 0)
  const byCat = Object.entries(qs.reduce((acc, q) => ({ ...acc, [q.cat]: (acc[q.cat] || 0) + q.amount }), {} as Record<string, number>))
  const COLORS = ['#6C63FF','#FF6584','#4fc3f7','#81c784','#ffb74d','#f06292','#ba68c8','#4db6ac']

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Project Parameters</Typography>
          <Stack spacing={2}>
            <TextField label="Plot Area (sq ft)" type="number" size="small" fullWidth value={params.plotArea} onChange={e => setParams(p => ({ ...p, plotArea: Number(e.target.value) }))} />
            <Box>
              <Typography variant="body2" mb={0.5}>Floors: {params.floors}</Typography>
              <Slider value={params.floors} min={1} max={5} onChange={(_, v) => setParams(p => ({ ...p, floors: v as number }))} marks />
            </Box>
            <Box>
              <Typography variant="body2" mb={0.5}>Ceiling Height: {params.ceilingHeight}ft</Typography>
              <Slider value={params.ceilingHeight} min={8} max={14} onChange={(_, v) => setParams(p => ({ ...p, ceilingHeight: v as number }))} marks={[{ value: 8, label: '8ft' }, { value: 10, label: '10ft' }, { value: 14, label: '14ft' }]} />
            </Box>
            <ToggleButtonGroup size="small" value={params.wallThickness} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, wallThickness: v }))}>
              <ToggleButton value="4.5in">4.5"</ToggleButton>
              <ToggleButton value="9in">9"</ToggleButton>
              <ToggleButton value="13.5in">13.5"</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup size="small" value={params.finishLevel} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, finishLevel: v }))}>
              {['standard','premium','luxury'].map(l => <ToggleButton key={l} value={l} sx={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>{l}</ToggleButton>)}
            </ToggleButtonGroup>
          </Stack>
          <Box mt={2} p={2} sx={{ background: 'linear-gradient(135deg,#6C63FF,#FF6584)', borderRadius: 2 }}>
            <Typography variant="caption" color="white">Total Estimate</Typography>
            <Typography variant="h5" fontWeight={900} color="white">₹{(totalCost / 100000).toFixed(1)} L</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>₹{Math.round(totalCost / (params.plotArea * params.floors))}/sq ft</Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3, maxHeight: 520, overflowY: 'auto' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Bill of Quantities</Typography>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="center">Unit</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qs.map((q, i) => (
                <TableRow key={i} hover sx={{ '& td': { fontSize: '0.75rem' } }}>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">[{q.cat}]</Typography>
                    <Typography variant="caption" display="block">{q.item}</Typography>
                  </TableCell>
                  <TableCell align="center">{q.qty.toLocaleString()}</TableCell>
                  <TableCell align="center">{q.unit}</TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" fontWeight={700}>₹{(q.amount / 1000).toFixed(0)}k</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>Cost Distribution</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCat.map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value">
                {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RTooltip formatter={v => [`₹${((v as number) / 100000).toFixed(1)}L`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <Stack spacing={0.8}>
            {byCat.map(([cat, val], i) => (
              <Box key={cat} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: COLORS[i % COLORS.length] }} />
                  <Typography variant="caption">{cat}</Typography>
                </Box>
                <Typography variant="caption" fontWeight={700}>₹{(val / 100000).toFixed(1)}L ({Math.round(val / totalCost * 100)}%)</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 26: Home Insurance Estimator ─────────────────────────────────────
function InsuranceEstimatorTab() {
  const [params, setParams] = useState({ constructionCost: 5000000, landValue: 3000000, age: 8, city: 'Kolkata', construction: 'RCC', contents: 1500000 })

  const estimate = useMemo(() => {
    const cityRiskMult = { mumbai: 1.25, delhi: 1.15, bangalore: 1.0, kolkata: 1.05, chennai: 1.1 }
    const cm = Object.entries(cityRiskMult).find(([k]) => params.city.toLowerCase().includes(k))?.[1] ?? 1.0
    const ageMult = 1 + params.age * 0.01
    const constMult = params.construction === 'RCC' ? 1 : params.construction === 'load-bearing' ? 1.15 : 1.3

    const buildingPremium = Math.round(params.constructionCost * 0.0012 * cm * ageMult * constMult)
    const contentsPremium = Math.round(params.contents * 0.005)
    const totalPremium = buildingPremium + contentsPremium
    const replacementCost = params.constructionCost * (1 + params.age * 0.04)
    return { buildingPremium, contentsPremium, totalPremium, replacementCost: Math.round(replacementCost), sumInsured: params.constructionCost + params.contents }
  }, [params])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Property Details</Typography>
          <Stack spacing={2}>
            <TextField label="Construction Cost (₹)" type="number" size="small" fullWidth value={params.constructionCost} onChange={e => setParams(p => ({ ...p, constructionCost: Number(e.target.value) }))} />
            <TextField label="Contents Value (₹)" type="number" size="small" fullWidth value={params.contents} onChange={e => setParams(p => ({ ...p, contents: Number(e.target.value) }))} helperText="Furniture, electronics, valuables" />
            <TextField label="City" size="small" fullWidth value={params.city} onChange={e => setParams(p => ({ ...p, city: e.target.value }))} />
            <Box>
              <Typography variant="body2" mb={0.5}>Building Age: {params.age} years</Typography>
              <Slider value={params.age} min={0} max={40} onChange={(_, v) => setParams(p => ({ ...p, age: v as number }))} />
            </Box>
            <ToggleButtonGroup size="small" value={params.construction} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, construction: v }))}>
              <ToggleButton value="RCC">RCC Frame</ToggleButton>
              <ToggleButton value="load-bearing">Load Bearing</ToggleButton>
              <ToggleButton value="steel">Steel</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Insurance Estimate</Typography>
          <Grid container spacing={2} mb={2}>
            {[
              { label: 'Sum Insured (Building + Contents)', value: `₹${(estimate.sumInsured / 100000).toFixed(1)}L`, icon: '🏠' },
              { label: 'Current Replacement Cost', value: `₹${(estimate.replacementCost / 100000).toFixed(1)}L`, icon: '🔨' },
              { label: 'Annual Building Premium', value: `₹${estimate.buildingPremium.toLocaleString()}`, icon: '📋' },
              { label: 'Annual Contents Premium', value: `₹${estimate.contentsPremium.toLocaleString()}`, icon: '🛋️' },
              { label: 'Total Annual Premium', value: `₹${estimate.totalPremium.toLocaleString()}`, icon: '💰', highlight: true },
              { label: 'Monthly Cost', value: `₹${Math.round(estimate.totalPremium / 12).toLocaleString()}`, icon: '📅' },
            ].map(item => (
              <Grid item xs={6} key={item.label}>
                <Box p={2} sx={{ bgcolor: item.highlight ? 'primary.main' : 'action.hover', borderRadius: 2 }}>
                  <Typography fontSize="1.2rem">{item.icon}</Typography>
                  <Typography variant="h6" fontWeight={800} color={item.highlight ? 'white' : 'text.primary'}>{item.value}</Typography>
                  <Typography variant="caption" color={item.highlight ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Alert severity="info">Coverage typically includes fire, flood, earthquake, theft, and structural damage. Compare quotes from LIC, New India Assurance, HDFC Ergo.</Alert>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 28: Sustainability & Green Building ──────────────────────────────
function SustainabilityTab() {
  const [features, setFeatures] = useState<Record<string, boolean>>({
    solarPanels: false, rainwaterHarvesting: false, drip: false, eerWindows: false,
    roofInsulation: false, ledLighting: true, greywater: false, sustainableMaterials: false,
    greenRoof: false, evCharging: false,
  })

  const toggle = (k: string) => setFeatures(f => ({ ...f, [k]: !f[k] }))

  const featureList = [
    { key: 'solarPanels', label: 'Solar PV Panels', points: { leed: 5, igbc: 6 }, co2: 2.8, water: 0, energy: 35 },
    { key: 'rainwaterHarvesting', label: 'Rainwater Harvesting', points: { leed: 4, igbc: 5 }, co2: 0.2, water: 40, energy: 2 },
    { key: 'drip', label: 'Drip/Smart Irrigation', points: { leed: 2, igbc: 3 }, co2: 0.1, water: 30, energy: 1 },
    { key: 'eerWindows', label: 'High-EER Double Glazing', points: { leed: 3, igbc: 4 }, co2: 0.8, water: 0, energy: 12 },
    { key: 'roofInsulation', label: 'Roof Insulation (100mm)', points: { leed: 3, igbc: 3 }, co2: 0.6, water: 0, energy: 15 },
    { key: 'ledLighting', label: 'Full LED Lighting', points: { leed: 2, igbc: 2 }, co2: 0.4, water: 0, energy: 8 },
    { key: 'greywater', label: 'Greywater Recycling', points: { leed: 3, igbc: 4 }, co2: 0.3, water: 25, energy: 3 },
    { key: 'sustainableMaterials', label: 'Sustainable / Local Materials', points: { leed: 4, igbc: 4 }, co2: 1.5, water: 0, energy: 5 },
    { key: 'greenRoof', label: 'Green Roof / Terrace Garden', points: { leed: 2, igbc: 3 }, co2: 0.5, water: 5, energy: 8 },
    { key: 'evCharging', label: 'EV Charging Infrastructure', points: { leed: 1, igbc: 2 }, co2: 0.8, water: 0, energy: 4 },
  ]

  const active = featureList.filter(f => features[f.key])
  const leedPts = active.reduce((s, f) => s + f.points.leed, 0)
  const igbcPts = active.reduce((s, f) => s + f.points.igbc, 0)
  const co2Saved = active.reduce((s, f) => s + f.co2, 0)
  const waterSaved = active.reduce((s, f) => s + f.water, 0)
  const energySaved = active.reduce((s, f) => s + f.energy, 0)

  const leedLevel = leedPts >= 20 ? 'Platinum' : leedPts >= 15 ? 'Gold' : leedPts >= 10 ? 'Silver' : leedPts >= 5 ? 'Certified' : 'Not Certified'
  const leedColor = leedLevel === 'Platinum' ? '#9c27b0' : leedLevel === 'Gold' ? '#ffc107' : leedLevel === 'Silver' ? '#9e9e9e' : leedLevel === 'Certified' ? '#4caf50' : '#f44336'

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Nature color="success" /> Green Features
          </Typography>
          <Stack spacing={1}>
            {featureList.map(f => (
              <Box key={f.key} display="flex" alignItems="center" justifyContent="space-between"
                p={1.5} sx={{ bgcolor: features[f.key] ? 'success.main' + '12' : 'action.hover', borderRadius: 2, border: '1px solid', borderColor: features[f.key] ? 'success.main' : 'divider', transition: 'all 0.2s' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{f.label}</Typography>
                  <Box display="flex" gap={0.5}>
                    <Chip label={`LEED +${f.points.leed}`} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                    <Chip label={`IGBC +${f.points.igbc}`} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                </Box>
                <Switch size="small" checked={features[f.key]} onChange={() => toggle(f.key)} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Certification Progress</Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Box textAlign="center" p={2} sx={{ bgcolor: leedColor + '20', borderRadius: 2 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: leedColor }}>{leedPts} pts</Typography>
                <Typography variant="caption">LEED — {leedLevel}</Typography>
                <LinearProgress variant="determinate" value={Math.min(100, leedPts / 26 * 100)} sx={{ mt: 0.5, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: leedColor } }} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center" p={2} sx={{ bgcolor: '#4caf50' + '20', borderRadius: 2 }}>
                <Typography variant="h5" fontWeight={900} color="success.main">{igbcPts} pts</Typography>
                <Typography variant="caption">IGBC — {igbcPts >= 25 ? 'Platinum' : igbcPts >= 20 ? 'Gold' : igbcPts >= 10 ? 'Silver' : 'Basic'}</Typography>
                <LinearProgress variant="determinate" value={Math.min(100, igbcPts / 30 * 100)} color="success" sx={{ mt: 0.5, height: 6, borderRadius: 3 }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Environmental Impact</Typography>
          <Stack spacing={2}>
            {[
              { label: 'CO₂ Saved', value: `${co2Saved.toFixed(1)} tonnes/yr`, icon: '🌱', color: '#4caf50' },
              { label: 'Water Saved', value: `${waterSaved}%`, icon: '💧', color: '#2196f3' },
              { label: 'Energy Savings', value: `${energySaved}%`, icon: '⚡', color: '#ff9800' },
            ].map(item => (
              <Box key={item.label}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{item.icon} {item.label}</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>{item.value}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, item.label === 'CO₂ Saved' ? co2Saved * 8 : waterSaved + energySaved)} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: item.color } }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 29: Home Resale Preparation ──────────────────────────────────────
function ResalePrepTab() {
  const [age, setAge] = useState(12)
  const [condition, setCondition] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good')

  const improvements = [
    { action: 'Fresh interior paint', cost: 45000, roiPct: 180, timeWeeks: 2 },
    { action: 'Kitchen renovation (counters + cabinets)', cost: 120000, roiPct: 140, timeWeeks: 6 },
    { action: 'Bathroom upgrade (tiles + fixtures)', cost: 80000, roiPct: 130, timeWeeks: 4 },
    { action: 'Exterior paint + facade work', cost: 60000, roiPct: 160, timeWeeks: 3 },
    { action: 'Landscaping and garden cleanup', cost: 25000, roiPct: 200, timeWeeks: 2 },
    { action: 'LED lighting upgrade', cost: 15000, roiPct: 150, timeWeeks: 1 },
    { action: 'Smart home basic package', cost: 35000, roiPct: 120, timeWeeks: 1 },
    { action: 'Roof waterproofing', cost: 40000, roiPct: 110, timeWeeks: 2 },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Current Property State</Typography>
          <Box mb={2}>
            <Typography variant="body2" mb={1}>Building Age: {age} years</Typography>
            <Slider value={age} min={1} max={40} onChange={(_, v) => setAge(v as number)} marks={[{ value: 5, label: '5yr' }, { value: 20, label: '20yr' }, { value: 40, label: '40yr' }]} />
          </Box>
          <Typography variant="body2" mb={1}>Current Condition</Typography>
          <ToggleButtonGroup size="small" value={condition} exclusive fullWidth onChange={(_, v) => v && setCondition(v)}>
            {(['poor','fair','good','excellent'] as const).map(c => <ToggleButton key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</ToggleButton>)}
          </ToggleButtonGroup>
          <Alert severity="info" sx={{ mt: 2 }}>
            Strategic renovations before sale can increase resale value by 15–25%.
          </Alert>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Pre-Sale Improvement ROI Analysis</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Improvement</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="center">Value Added</TableCell>
                <TableCell align="center">ROI</TableCell>
                <TableCell align="center">Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {improvements.sort((a, b) => b.roiPct - a.roiPct).map(imp => (
                <TableRow key={imp.action} hover>
                  <TableCell><Typography variant="body2">{imp.action}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2">₹{imp.cost.toLocaleString()}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      +₹{Math.round(imp.cost * imp.roiPct / 100).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={`${imp.roiPct}%`} size="small" color={imp.roiPct >= 150 ? 'success' : imp.roiPct >= 120 ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell align="center"><Typography variant="caption">{imp.timeWeeks}wk</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default function FinanceHubPage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Finance & Analysis Hub</Typography>
        <Typography variant="body1" color="text.secondary">AI quantity surveyor, home insurance estimator, sustainability tracker, and resale preparation advisor.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['🧮 AI Quantity Surveyor', '🛡️ Insurance Estimator', '🌱 Green Certification', '📈 Resale Preparation'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <AIQuantitySurveyorTab />}
      {tab === 1 && <InsuranceEstimatorTab />}
      {tab === 2 && <SustainabilityTab />}
      {tab === 3 && <ResalePrepTab />}
    </Box>
  )
}
