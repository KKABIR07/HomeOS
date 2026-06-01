// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Alert, Stack,
  LinearProgress, Button, CircularProgress, Slider, ToggleButton,
  ToggleButtonGroup, Table, TableBody, TableCell, TableHead, TableRow,
  Card, CardContent, Divider,
} from '@mui/material'
import {
  Home, CameraAlt, HealthAndSafety, Build, Warning, CheckCircle,
  WaterDrop, Air, Thermostat, Upload, BrokenImage,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'

// ─── Feature 13: Home Digital Twin ────────────────────────────────────────────
function DigitalTwinTab() {
  const [activeLayer, setActiveLayer] = useState('electrical')

  const layers = [
    { id: 'structural', name: 'Structural', icon: '🏛️', color: '#607d8b', items: ['Columns: 12 nos, 300×300mm RCC', 'Beams: Primary 230×450mm', 'Slab thickness: 125mm', 'Foundation: Strip, 1200mm deep', 'Steel grade: Fe 500 TMT'] },
    { id: 'electrical', name: 'Electrical', icon: '⚡', color: '#ff9800', items: ['Main panel: 40A, 3-phase', 'Circuits: 8 lighting, 6 power', 'EV charging point: Garage', 'Solar inverter: Rooftop terrace', 'Earthing: 3 electrode system'] },
    { id: 'plumbing', name: 'Plumbing', icon: '🚿', color: '#2196f3', items: ['Water supply: CPVC 25mm mains', 'Drainage: PVC 110mm main line', 'Sewage: 160mm to septic', 'Hot water: Roof-mounted solar', 'Water meter location: Main gate'] },
    { id: 'hvac', name: 'HVAC', icon: '❄️', color: '#00bcd4', items: ['AC units: 5 split ACs (1.5T each)', 'Ducts: 3 master/living/kitchen', 'Exhaust fans: All bathrooms + kitchen', 'Ventilation: Cross-ventilation + ceiling fans'] },
    { id: 'finishes', name: 'Finishes', icon: '🎨', color: '#9c27b0', items: ['Flooring: Italian marble (living), vitrified (bedrooms)', 'Walls: Asian Paints Royale Shyne', 'Ceiling: POP false ceiling, 9ft height', 'Exterior: Texture coat, RAL 7035'] },
  ]

  const currentLayer = layers.find(l => l.id === activeLayer)!

  const history = [
    { date: '2024-06-15', event: 'Plumbing leak repair — bathroom 2', cost: 4500, status: 'completed' },
    { date: '2024-03-22', event: 'AC servicing — all 5 units', cost: 8000, status: 'completed' },
    { date: '2024-01-10', event: 'Exterior repaint', cost: 45000, status: 'completed' },
    { date: '2023-11-05', event: 'Roof waterproofing — bitumen membrane', cost: 28000, status: 'completed' },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Building Layers</Typography>
          <Stack spacing={1}>
            {layers.map(l => (
              <Box key={l.id} onClick={() => setActiveLayer(l.id)}
                sx={{ p: 2, borderRadius: 2, cursor: 'pointer', border: '2px solid',
                  borderColor: activeLayer === l.id ? l.color : 'divider',
                  bgcolor: activeLayer === l.id ? `${l.color}12` : 'transparent',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography fontSize="1.4rem">{l.icon}</Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{l.name} Layer</Typography>
                  <Typography variant="caption" color="text.secondary">{l.items.length} recorded elements</Typography>
                </Box>
                {activeLayer === l.id && <CheckCircle sx={{ ml: 'auto', color: l.color }} />}
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Typography fontSize="1.8rem">{currentLayer.icon}</Typography>
            <Typography variant="h6" fontWeight={700}>{currentLayer.name} Layer — Digital Record</Typography>
          </Box>
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, mb: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            {currentLayer.items.map(item => (
              <Box key={item} display="flex" gap={1} alignItems="flex-start">
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: currentLayer.color, mt: 0.8, flexShrink: 0 }} />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
          <Chip label="Last updated: 2024-06-15" size="small" variant="outlined" />
          <Chip label="Add/Edit Records" size="small" color="primary" sx={{ ml: 1 }} />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Maintenance History</Typography>
          <Table size="small">
            <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Event</TableCell><TableCell align="right">Cost</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
            <TableBody>
              {history.map(h => (
                <TableRow key={h.date} hover>
                  <TableCell><Typography variant="caption">{h.date}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{h.event}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={700}>₹{h.cost.toLocaleString()}</Typography></TableCell>
                  <TableCell><Chip label={h.status} size="small" color="success" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 14: AI Crack Detection ───────────────────────────────────────────
function CrackDetectionTab() {
  const [uploaded, setUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)

  const handleUpload = () => {
    setUploaded(true); setAnalyzing(true)
    setTimeout(() => { setAnalyzing(false); setDone(true) }, 2200)
  }

  const findings = [
    { type: 'Hairline Crack', location: 'South wall, 1.2m height', severity: 'minor', cause: 'Thermal expansion/contraction', repair: 'Fill with cement slurry and repaint', urgency: 'low' },
    { type: 'Settlement Crack', location: 'Northeast column junction', severity: 'moderate', cause: 'Foundation differential settlement', repair: 'Epoxy injection + structural inspection', urgency: 'medium' },
    { type: 'Water Damage', location: 'Bathroom wall (1st floor)', severity: 'moderate', cause: 'Plumbing leak behind wall', repair: 'Fix plumbing, waterproof and replaster', urgency: 'high' },
    { type: 'Efflorescence', location: 'Exterior north wall', severity: 'minor', cause: 'Water seepage through masonry', repair: 'Clean, waterproof coating, repaint', urgency: 'low' },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraAlt color="primary" /> Upload Photo
          </Typography>
          <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', mb: 2, '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }} onClick={handleUpload}>
            {uploaded ? <BrokenImage sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} /> : <Upload sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />}
            <Typography variant="subtitle2">{uploaded ? 'wall_south_crack.jpg' : 'Upload wall/surface photo'}</Typography>
            <Typography variant="caption" color="text.secondary">{uploaded ? '2.4MB · JPEG · Ready for analysis' : 'JPG, PNG up to 20MB'}</Typography>
          </Box>
          {analyzing && (
            <Box textAlign="center" py={2}>
              <CircularProgress sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">AI scanning image for defects...</Typography>
            </Box>
          )}
          {done && <Alert severity="warning">4 issues detected in uploaded image</Alert>}
          <Alert severity="info" sx={{ mt: 2 }}>AI analyzes crack patterns, depth indicators, moisture stains, mold growth, and structural deformation markers.</Alert>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        {done ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>AI Crack Detection Report</Typography>
            <Stack spacing={2}>
              {findings.map(f => (
                <Box key={f.type} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: f.urgency === 'high' ? 'error.main' : f.urgency === 'medium' ? 'warning.main' : 'divider' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={700}>{f.type}</Typography>
                    <Box display="flex" gap={1}>
                      <Chip label={f.severity} size="small" color={f.severity === 'minor' ? 'info' : 'warning'} />
                      <Chip label={`Urgency: ${f.urgency}`} size="small" color={f.urgency === 'high' ? 'error' : f.urgency === 'medium' ? 'warning' : 'default'} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>📍 {f.location}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>🔍 Cause: {f.cause}</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={500}>🔧 Repair: {f.repair}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <Typography fontSize="3rem" mb={2}>🔍</Typography>
            <Typography variant="h6" color="text.secondary">Upload a photo to detect cracks and damage</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

// ─── Feature 15: Home Health Score ────────────────────────────────────────────
function HomeHealthTab() {
  const [readings, setReadings] = useState({ humidity: 68, co2: 850, temp: 28, pm25: 18, voc: 0.4, mold: 'low', ventilation: 'medium' })

  const score = useMemo(() => {
    const humScore = readings.humidity > 70 ? 40 : readings.humidity < 40 ? 50 : 95
    const co2Score = readings.co2 > 1200 ? 30 : readings.co2 > 800 ? 70 : 95
    const pm25Score = readings.pm25 > 35 ? 30 : readings.pm25 > 12 ? 65 : 95
    const vocScore = readings.voc > 1 ? 40 : readings.voc > 0.5 ? 70 : 95
    const moldScore = { low: 95, medium: 60, high: 20 }[readings.mold] ?? 95
    const ventScore = { poor: 35, medium: 70, good: 95 }[readings.ventilation] ?? 70
    return Math.round((humScore + co2Score + pm25Score + vocScore + moldScore + ventScore) / 6)
  }, [readings])

  const scoreColor = score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336'

  const sensors = [
    { label: 'Humidity', key: 'humidity', unit: '%', min: 20, max: 90, ideal: '40–60%', value: readings.humidity, bad: readings.humidity > 70 || readings.humidity < 40 },
    { label: 'CO₂', key: 'co2', unit: 'ppm', min: 400, max: 2000, ideal: '< 800 ppm', value: readings.co2, bad: readings.co2 > 1000 },
    { label: 'Temperature', key: 'temp', unit: '°C', min: 15, max: 40, ideal: '22–26°C', value: readings.temp, bad: readings.temp > 30 },
    { label: 'PM2.5', key: 'pm25', unit: 'µg/m³', min: 0, max: 100, ideal: '< 12 µg/m³', value: readings.pm25, bad: readings.pm25 > 25 },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box textAlign="center" mb={2}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
              <CircularProgress variant="determinate" value={score} size={110} sx={{ color: scoreColor }} thickness={6} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: scoreColor }}>{score}</Typography>
                <Typography variant="caption" color="text.secondary">/100</Typography>
              </Box>
            </Box>
            <Typography variant="h6" fontWeight={700}>Home Health Score</Typography>
            <Chip label={score >= 80 ? 'Healthy Home' : score >= 60 ? 'Needs Attention' : 'Unhealthy Environment'} color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'} />
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} mb={1}>Mold Risk</Typography>
          <ToggleButtonGroup size="small" value={readings.mold} exclusive fullWidth onChange={(_, v) => v && setReadings(r => ({ ...r, mold: v }))}>
            {['low','medium','high'].map(v => <ToggleButton key={v} value={v} sx={{ textTransform: 'capitalize' }}>{v}</ToggleButton>)}
          </ToggleButtonGroup>
          <Typography variant="subtitle2" fontWeight={600} mb={1} mt={2}>Ventilation Quality</Typography>
          <ToggleButtonGroup size="small" value={readings.ventilation} exclusive fullWidth onChange={(_, v) => v && setReadings(r => ({ ...r, ventilation: v }))}>
            {['poor','medium','good'].map(v => <ToggleButton key={v} value={v} sx={{ textTransform: 'capitalize' }}>{v}</ToggleButton>)}
          </ToggleButtonGroup>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Air Quality Sensors</Typography>
          <Grid container spacing={2}>
            {sensors.map(s => (
              <Grid item xs={6} key={s.label}>
                <Box p={2} sx={{ bgcolor: s.bad ? 'error.light' + '22' : 'action.hover', borderRadius: 2, border: '1px solid', borderColor: s.bad ? 'error.main' : 'divider' }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                    {s.bad ? <Warning sx={{ color: 'error.main', fontSize: 16 }} /> : <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />}
                  </Box>
                  <Typography variant="h5" fontWeight={800} color={s.bad ? 'error.main' : 'text.primary'}>{s.value}{s.unit}</Typography>
                  <Typography variant="caption" color="text.secondary">Ideal: {s.ideal}</Typography>
                  <Slider size="small" min={s.min} max={s.max} value={s.value}
                    onChange={(_, v) => setReadings(r => ({ ...r, [s.key]: v as number }))}
                    sx={{ mt: 0.5, '& .MuiSlider-thumb': { width: 12, height: 12 } }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {score < 80 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>Recommendations</Typography>
            <Stack spacing={1}>
              {readings.humidity > 70 && <Alert severity="warning">High humidity — run dehumidifier, fix plumbing leaks, improve ventilation</Alert>}
              {readings.co2 > 1000 && <Alert severity="error">High CO₂ — open windows, install mechanical ventilation (MVHR) unit</Alert>}
              {readings.pm25 > 25 && <Alert severity="warning">High PM2.5 — install HEPA air purifier, seal gaps, check air filters</Alert>}
              {readings.mold === 'high' && <Alert severity="error">High mold risk — treat with antifungal, fix moisture source, increase ventilation</Alert>}
            </Stack>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

// ─── Feature 16: Predictive Maintenance AI ────────────────────────────────────
function PredictiveMaintenanceTab() {
  const [buildingAge, setBuildingAge] = useState(8)
  const [quality, setQuality] = useState<'basic' | 'standard' | 'premium'>('standard')

  const maintenanceSchedule = useMemo(() => {
    const qMult = { basic: 0.7, standard: 1.0, premium: 1.4 }[quality]
    return [
      { item: 'Exterior Paint', cycle: Math.round(5 * qMult), lastDone: 4, nextDue: Math.round(5 * qMult) - 4, urgency: Math.round(5 * qMult) - 4 <= 1 ? 'urgent' : 'scheduled' },
      { item: 'Roof Waterproofing', cycle: Math.round(8 * qMult), lastDone: buildingAge, nextDue: Math.round(8 * qMult) - buildingAge % Math.round(8 * qMult), urgency: (Math.round(8 * qMult) - buildingAge % Math.round(8 * qMult)) <= 1 ? 'urgent' : 'scheduled' },
      { item: 'Plumbing Inspection', cycle: 3, lastDone: 2, nextDue: 1, urgency: 'urgent' },
      { item: 'Electrical Re-inspection', cycle: Math.round(10 * qMult), lastDone: buildingAge, nextDue: Math.round(10 * qMult) - buildingAge, urgency: Math.round(10 * qMult) - buildingAge <= 2 ? 'upcoming' : 'scheduled' },
      { item: 'Interior Paint', cycle: Math.round(7 * qMult), lastDone: 5, nextDue: Math.round(7 * qMult) - 5, urgency: Math.round(7 * qMult) - 5 <= 1 ? 'urgent' : 'scheduled' },
      { item: 'AC Deep Service', cycle: 1, lastDone: 0.5, nextDue: 0.5, urgency: 'upcoming' },
      { item: 'Solar Panel Cleaning', cycle: 0.25, lastDone: 0.2, nextDue: 0.05, urgency: 'urgent' },
      { item: 'Pest Control Treatment', cycle: 1, lastDone: 0.8, nextDue: 0.2, urgency: 'upcoming' },
    ]
  }, [buildingAge, quality])

  const urgent = maintenanceSchedule.filter(m => m.urgency === 'urgent').length

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Building Profile</Typography>
          <Box mb={3}>
            <Typography variant="body2" mb={1}>Building Age: {buildingAge} years</Typography>
            <Slider value={buildingAge} min={0} max={40} onChange={(_, v) => setBuildingAge(v as number)} marks={[{ value: 0, label: 'New' }, { value: 20, label: '20yr' }, { value: 40, label: '40yr' }]} />
          </Box>
          <Typography variant="body2" mb={1}>Construction Quality</Typography>
          <ToggleButtonGroup size="small" value={quality} exclusive fullWidth onChange={(_, v) => v && setQuality(v)}>
            {(['basic','standard','premium'] as const).map(q => <ToggleButton key={q} value={q} sx={{ textTransform: 'capitalize' }}>{q}</ToggleButton>)}
          </ToggleButtonGroup>

          {urgent > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>{urgent} items need immediate attention</Typography>
            </Alert>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Predictive Maintenance Schedule</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Maintenance Item</TableCell>
                <TableCell align="center">Cycle</TableCell>
                <TableCell align="center">Last Done</TableCell>
                <TableCell align="center">Next Due</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceSchedule.map(m => (
                <TableRow key={m.item} sx={{ bgcolor: m.urgency === 'urgent' ? 'error.main' + '08' : 'inherit' }}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{m.item}</Typography></TableCell>
                  <TableCell align="center"><Typography variant="caption">{m.cycle < 1 ? `${Math.round(m.cycle * 12)}mo` : `${m.cycle}yr`}</Typography></TableCell>
                  <TableCell align="center"><Typography variant="caption">{m.lastDone < 1 ? `${Math.round(m.lastDone * 12)}mo ago` : `${m.lastDone}yr ago`}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" color={m.nextDue <= 0.25 ? 'error.main' : m.nextDue <= 1 ? 'warning.main' : 'text.secondary'} fontWeight={700}>
                      {m.nextDue <= 0 ? 'Overdue!' : m.nextDue < 1 ? `${Math.round(m.nextDue * 12)}mo` : `${m.nextDue.toFixed(0)}yr`}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={m.urgency} size="small" color={m.urgency === 'urgent' ? 'error' : m.urgency === 'upcoming' ? 'warning' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default function HomeIntelligencePage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Home Intelligence</Typography>
        <Typography variant="body1" color="text.secondary">Digital twin, crack detection, home health monitoring, and predictive maintenance AI.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['🏠 Digital Twin', '🔍 Crack Detection', '💚 Home Health Score', '🔧 Predictive Maintenance'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <DigitalTwinTab />}
      {tab === 1 && <CrackDetectionTab />}
      {tab === 2 && <HomeHealthTab />}
      {tab === 3 && <PredictiveMaintenanceTab />}
    </Box>
  )
}
