// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Alert, Stack,
  LinearProgress, TextField, Slider, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableHead, TableRow, Divider,
} from '@mui/material'
import {
  WbSunny, Air, WaterDrop, ElectricBolt, Thermostat, North,
  ArrowUpward, TrendingDown,
} from '@mui/icons-material'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import { motion } from 'framer-motion'

// ─── Feature 10: Sunlight Simulator ───────────────────────────────────────────
function SunlightSimulatorTab() {
  const [facing, setFacing] = useState<'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'>('south')
  const [latitude, setLatitude] = useState(22.5)

  const rooms = [
    { name: 'Living Room', facing: 'south', size: '18×15 ft', windows: 2 },
    { name: 'Master Bedroom', facing: 'east', size: '14×12 ft', windows: 1 },
    { name: 'Kitchen', facing: 'north', size: '12×10 ft', windows: 1 },
    { name: 'Guest Bedroom', facing: 'west', size: '12×11 ft', windows: 1 },
    { name: 'Study Room', facing: 'northeast', size: '10×10 ft', windows: 1 },
  ]

  const sunlightScore: Record<string, number> = {
    north: 20, south: 95, east: 75, west: 60, northeast: 65, northwest: 35, southeast: 85, southwest: 70,
  }

  const seasonalData = [
    { month: 'Jan', sunrise: '07:05', sunset: '17:30', hours: 10.4 },
    { month: 'Feb', sunrise: '06:48', sunset: '17:55', hours: 11.1 },
    { month: 'Mar', sunrise: '06:20', sunset: '18:15', hours: 11.9 },
    { month: 'Apr', sunrise: '05:52', sunset: '18:35', hours: 12.7 },
    { month: 'May', sunrise: '05:32', sunset: '18:55', hours: 13.4 },
    { month: 'Jun', sunrise: '05:20', sunset: '19:08', hours: 13.8 },
    { month: 'Jul', sunrise: '05:28', sunset: '19:02', hours: 13.6 },
    { month: 'Aug', sunrise: '05:42', sunset: '18:40', hours: 13.0 },
    { month: 'Sep', sunrise: '06:00', sunset: '18:10', hours: 12.2 },
    { month: 'Oct', sunrise: '06:18', sunset: '17:40', hours: 11.4 },
    { month: 'Nov', sunrise: '06:40', sunset: '17:20', hours: 10.7 },
    { month: 'Dec', sunrise: '07:00', sunset: '17:18', hours: 10.3 },
  ]

  const roomsWithScore = rooms.map(r => ({ ...r, score: sunlightScore[r.facing as string] ?? 50 }))
  const buildingScore = sunlightScore[facing]
  const solarEfficiency = Math.round(buildingScore * 0.85)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Building Orientation</Typography>
          <Typography variant="body2" mb={1}>Main entrance faces:</Typography>
          <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
            {(['north','south','east','west','northeast','northwest','southeast','southwest']).map(d => (
              <Chip key={d} label={d.toUpperCase()} size="small"
                onClick={() => setFacing(d as any)} color={facing === d ? 'primary' : 'default'}
                variant={facing === d ? 'filled' : 'outlined'} />
            ))}
          </Box>
          <TextField label="Site Latitude (°N)" type="number" size="small" fullWidth
            value={latitude} onChange={e => setLatitude(Number(e.target.value))}
            helperText="Mumbai: 19.1° | Delhi: 28.6° | Kolkata: 22.5° | Bangalore: 12.9°" />
          <Box mt={2} p={2} sx={{ background: 'linear-gradient(135deg,rgba(255,193,7,.15),rgba(255,152,0,.08))', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Solar Panel Efficiency</Typography>
            <Typography variant="h4" fontWeight={900} color="warning.main">{solarEfficiency}%</Typography>
            <Typography variant="caption" color="text.secondary">of maximum possible output for {facing}-facing roof</Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Room Sunlight Analysis</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Room</TableCell>
                <TableCell>Orientation</TableCell>
                <TableCell>Natural Light Score</TableCell>
                <TableCell>Peak Sunlight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomsWithScore.map(r => (
                <TableRow key={r.name}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{r.name}</Typography></TableCell>
                  <TableCell><Chip label={r.facing.toUpperCase()} size="small" /></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress variant="determinate" value={r.score} sx={{ width: 80, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: r.score > 70 ? '#ff9800' : r.score > 40 ? '#4caf50' : '#90a4ae' } }} />
                      <Typography variant="caption" fontWeight={700}>{r.score}/100</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {r.facing === 'east' ? 'Morning (6–11am)' : r.facing === 'west' ? 'Afternoon (2–6pm)' : r.facing === 'south' ? 'All day' : r.facing === 'north' ? 'Indirect only' : 'Morning–Noon'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Seasonal Daylight Hours (Lat: {latitude}°N)</Typography>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={seasonalData}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[9, 15]} unit="h" tick={{ fontSize: 10 }} />
              <RTooltip formatter={v => [`${v}h`, 'Daylight']} />
              <Area type="monotone" dataKey="hours" stroke="#ff9800" fill="rgba(255,152,0,0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 11: Wind Flow Simulator ──────────────────────────────────────────
function WindFlowTab() {
  const [windDir, setWindDir] = useState('SW')
  const [floors, setFloors] = useState(2)
  const [hasCourtyard, setHasCourtyard] = useState(false)

  const ventilationScore = useMemo(() => {
    const dirScore: Record<string, number> = { N: 70, NE: 85, E: 80, SE: 75, S: 65, SW: 90, W: 72, NW: 78 }
    const base = dirScore[windDir] ?? 75
    const courtyardBonus = hasCourtyard ? 12 : 0
    const floorsBonus = floors > 2 ? 5 : 0
    return Math.min(100, base + courtyardBonus + floorsBonus)
  }, [windDir, floors, hasCourtyard])

  const windowRecs: Record<string, string[]> = {
    N: ['Place large windows on south face', 'Use ventilators on north and south for cross-ventilation', 'Avoid north-only openings in cold climates'],
    NE: ['Primary windows NE for morning breeze', 'Secondary windows SW for cross-ventilation', 'NE is optimal for India — best natural ventilation'],
    E: ['Large east windows for morning light + ventilation', 'West overhangs to block afternoon heat', 'Use jaali / lattice screens on east'],
    SE: ['Good for south-east monsoon breeze capture', 'Place bedroom windows south-facing', 'Use louvres for directional airflow control'],
    S: ['South windows with deep overhangs (750mm min)', 'Very effective for stack ventilation', 'Avoid west-facing windows to reduce heat gain'],
    SW: ['Optimal for SW monsoon breeze (June–Sep)', 'Place living areas on SW face', 'Use wind catchers / vents on SW corner'],
    W: ['Avoid large west windows (max heat gain)', 'Use courtyard for ventilation instead', 'Plant deciduous trees on west side for shade'],
    NW: ['Good autumn/winter ventilation', 'Place utility areas on NW', 'NW windows work well in Rajasthan / dry climates'],
  }

  const radarData = [
    { dir: 'N', score: 70 }, { dir: 'NE', score: 85 }, { dir: 'E', score: 80 }, { dir: 'SE', score: 75 },
    { dir: 'S', score: 65 }, { dir: 'SW', score: 90 }, { dir: 'W', score: 72 }, { dir: 'NW', score: 78 },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Wind Parameters</Typography>
          <Typography variant="body2" mb={1}>Prevailing Wind Direction</Typography>
          <Box display="flex" flexWrap="wrap" gap={0.8} mb={3}>
            {['N','NE','E','SE','S','SW','W','NW'].map(d => (
              <Chip key={d} label={d} onClick={() => setWindDir(d)} color={windDir === d ? 'primary' : 'default'} variant={windDir === d ? 'filled' : 'outlined'} />
            ))}
          </Box>
          <Box mb={2}>
            <Typography variant="body2" mb={1}>Number of Floors: {floors}</Typography>
            <Slider value={floors} min={1} max={5} onChange={(_, v) => setFloors(v as number)} marks />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">Has Courtyard / Atrium</Typography>
            <ToggleButtonGroup size="small" value={hasCourtyard ? 'yes' : 'no'} exclusive onChange={(_, v) => v && setHasCourtyard(v === 'yes')}>
              <ToggleButton value="yes">Yes</ToggleButton>
              <ToggleButton value="no">No</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box mt={2} p={2} sx={{ bgcolor: 'primary.main', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="white">Ventilation Score</Typography>
            <Typography variant="h3" fontWeight={900} color="white">{ventilationScore}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>/100</Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>Directional Ventilation Map</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dir" tick={{ fontSize: 12, fontWeight: 600 }} />
              <Radar dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Window Placement Recommendations</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>For {windDir}-facing prevailing wind:</Typography>
          <Stack spacing={1}>
            {(windowRecs[windDir] || []).map((rec, i) => (
              <Box key={i} display="flex" gap={1.5} p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                <Air sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0, mt: 0.1 }} />
                <Typography variant="body2">{rec}</Typography>
              </Box>
            ))}
          </Stack>
          {hasCourtyard && (
            <Alert severity="success" sx={{ mt: 2 }}>Courtyard provides stack ventilation (+12% score). Hot air rises and exits from top.</Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 9: Water & Flood Simulation ──────────────────────────────────────
function WaterFloodTab() {
  const [rainfall, setRainfall] = useState(150)
  const [drainageType, setDrainageType] = useState<'poor' | 'moderate' | 'good' | 'excellent'>('moderate')
  const [plotElevation, setPlotElevation] = useState(1.2)
  const [imperviousCover, setImperviousCover] = useState(65)

  const simulation = useMemo(() => {
    const runoff = (rainfall * (imperviousCover / 100) * 0.85)
    const drainageCapacity = { poor: 20, moderate: 40, good: 70, excellent: 95 }[drainageType]
    const surplusRunoff = Math.max(0, runoff - drainageCapacity)
    const floodDepth = Math.max(0, (surplusRunoff / 1000) * (1 / plotElevation) * 0.5).toFixed(2)
    const risk = parseFloat(floodDepth) > 0.3 ? 'high' : parseFloat(floodDepth) > 0.1 ? 'medium' : 'low'
    return { runoff: runoff.toFixed(0), surplusRunoff: surplusRunoff.toFixed(0), floodDepth, risk }
  }, [rainfall, drainageType, plotElevation, imperviousCover])

  const hourlyData = [1,2,3,4,5,6].map(h => ({
    hour: `${h}h`, rainfall: Math.round(rainfall * (1 - Math.abs(h - 3.5) / 5)),
    runoff: Math.round(rainfall * (1 - Math.abs(h - 3.5) / 5) * (imperviousCover / 100) * 0.7),
  }))

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Simulation Parameters</Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" mb={0.5}>Rainfall Intensity: {rainfall} mm/hr</Typography>
              <Slider value={rainfall} min={10} max={300} onChange={(_, v) => setRainfall(v as number)} marks={[{ value: 50, label: 'Light' }, { value: 150, label: 'Heavy' }, { value: 250, label: 'Extreme' }]} />
            </Box>
            <Box>
              <Typography variant="body2" mb={1}>Drainage System Quality</Typography>
              <ToggleButtonGroup size="small" value={drainageType} exclusive fullWidth onChange={(_, v) => v && setDrainageType(v)}>
                {['poor','moderate','good','excellent'].map(d => <ToggleButton key={d} value={d} sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>{d}</ToggleButton>)}
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="body2" mb={0.5}>Plot Elevation above road: {plotElevation}m</Typography>
              <Slider value={plotElevation} min={0} max={3} step={0.1} onChange={(_, v) => setPlotElevation(v as number)} />
            </Box>
            <Box>
              <Typography variant="body2" mb={0.5}>Impervious Cover: {imperviousCover}%</Typography>
              <Slider value={imperviousCover} min={20} max={95} onChange={(_, v) => setImperviousCover(v as number)} />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Flood Simulation Results</Typography>
          <Grid container spacing={2} mb={2}>
            {[
              { label: 'Surface Runoff', value: `${simulation.runoff} mm/hr`, color: '#2196f3' },
              { label: 'Drainage Surplus', value: `${simulation.surplusRunoff} mm/hr`, color: '#ff9800' },
              { label: 'Predicted Flood Depth', value: `${simulation.floodDepth}m`, color: parseFloat(simulation.floodDepth) > 0.3 ? '#f44336' : '#4caf50' },
            ].map(item => (
              <Grid item xs={12} key={item.label}>
                <Box p={2} sx={{ bgcolor: `${item.color}12`, borderRadius: 2, border: `1px solid ${item.color}30` }}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Alert severity={simulation.risk === 'high' ? 'error' : simulation.risk === 'medium' ? 'warning' : 'success'}>
            {simulation.risk === 'high' && 'High flood risk — raise plinth by 600mm, install retention pond'}
            {simulation.risk === 'medium' && 'Moderate flood risk — improve drainage and raise plinth by 300mm'}
            {simulation.risk === 'low' && 'Low flood risk — current drainage is adequate'}
          </Alert>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Hourly Runoff Pattern</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="mm" />
              <RTooltip />
              <Area type="monotone" dataKey="rainfall" stroke="#2196f3" fill="rgba(33,150,243,0.2)" name="Rainfall" />
              <Area type="monotone" dataKey="runoff" stroke="#f44336" fill="rgba(244,67,54,0.15)" name="Runoff" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Drainage Recommendations</Typography>
          {[
            'Install perimeter French drain around foundation',
            'Provide 1.5% slope away from building',
            'Use permeable paving for driveway (reduces runoff 40%)',
            'Install rain garden or bioswale at low points',
            'Connect to municipal stormwater network',
          ].slice(0, simulation.risk === 'low' ? 2 : 5).map((r, i) => (
            <Box key={i} display="flex" gap={1} py={0.8} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <WaterDrop sx={{ color: 'info.main', fontSize: 16, flexShrink: 0, mt: 0.2 }} />
              <Typography variant="body2">{r}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 12: AI Energy Optimizer ──────────────────────────────────────────
function EnergyOptimizerTab() {
  const [params, setParams] = useState({
    area: 2000, floors: 2, acUnits: 3, insulation: 'standard',
    windowType: 'single', roofColor: 'dark', city: 'Delhi',
  })

  const cityHDD: Record<string, number> = { delhi: 450, mumbai: 50, kolkata: 100, bangalore: 0, hyderabad: 80, chennai: 20, jaipur: 300, lucknow: 350 }
  const cityHDD_val = Object.entries(cityHDD).find(([k]) => params.city.toLowerCase().includes(k))?.[1] ?? 200
  const insulMult = { poor: 1.45, standard: 1.0, good: 0.72, excellent: 0.55 }[params.insulation] ?? 1
  const winMult = { single: 1.3, double: 1.0, triple: 0.75 }[params.windowType] ?? 1
  const roofMult = params.roofColor === 'dark' ? 1.18 : params.roofColor === 'light' ? 0.88 : 1.0

  const monthlyCooling = Math.round(params.area * 0.008 * params.acUnits * insulMult * winMult * roofMult * 30 * 7.5)
  const monthlyHeating = Math.round(params.area * 0.004 * cityHDD_val * insulMult / 365 * 30 * 7.5)
  const totalMonthly = monthlyCooling + monthlyHeating
  const savingsWithUpgrade = Math.round(totalMonthly * 0.35)

  const improvements = [
    { action: 'Upgrade to double-glazed windows', saving: '₹' + Math.round(totalMonthly * 0.12).toLocaleString() + '/mo', effort: 'Medium', roi: '4–5 years' },
    { action: 'Add roof insulation (100mm mineral wool)', saving: '₹' + Math.round(totalMonthly * 0.15).toLocaleString() + '/mo', effort: 'Low', roi: '3–4 years' },
    { action: 'Cool roof coating (white/silver)', saving: '₹' + Math.round(totalMonthly * 0.08).toLocaleString() + '/mo', effort: 'Very Low', roi: '1–2 years' },
    { action: 'Install solar panels (5kW)', saving: '₹' + Math.round(totalMonthly * 0.6).toLocaleString() + '/mo', effort: 'High', roi: '5–7 years' },
    { action: 'Smart thermostat with occupancy sensors', saving: '₹' + Math.round(totalMonthly * 0.10).toLocaleString() + '/mo', effort: 'Low', roi: '1–2 years' },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Building Parameters</Typography>
          <Stack spacing={2}>
            <TextField label="Built-up Area (sq ft)" type="number" size="small" fullWidth value={params.area} onChange={e => setParams(p => ({ ...p, area: Number(e.target.value) }))} />
            <TextField label="City" size="small" fullWidth value={params.city} onChange={e => setParams(p => ({ ...p, city: e.target.value }))} />
            <TextField label="No. of AC Units" type="number" size="small" fullWidth value={params.acUnits} onChange={e => setParams(p => ({ ...p, acUnits: Number(e.target.value) }))} />
            <Box>
              <Typography variant="body2" mb={1}>Insulation Level</Typography>
              <ToggleButtonGroup size="small" value={params.insulation} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, insulation: v }))}>
                {['poor','standard','good','excellent'].map(v => <ToggleButton key={v} value={v} sx={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>{v}</ToggleButton>)}
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="body2" mb={1}>Window Type</Typography>
              <ToggleButtonGroup size="small" value={params.windowType} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, windowType: v }))}>
                <ToggleButton value="single">Single</ToggleButton>
                <ToggleButton value="double">Double</ToggleButton>
                <ToggleButton value="triple">Triple</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="body2" mb={1}>Roof Colour</Typography>
              <ToggleButtonGroup size="small" value={params.roofColor} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, roofColor: v }))}>
                <ToggleButton value="dark">Dark</ToggleButton>
                <ToggleButton value="medium">Medium</ToggleButton>
                <ToggleButton value="light">Light/Cool</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Energy Cost Analysis</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Monthly Cooling Cost', value: `₹${monthlyCooling.toLocaleString()}`, icon: '❄️', color: '#2196f3' },
              { label: 'Monthly Heating Cost', value: `₹${monthlyHeating.toLocaleString()}`, icon: '🔥', color: '#ff5722' },
              { label: 'Total Monthly Bill', value: `₹${totalMonthly.toLocaleString()}`, icon: '⚡', color: '#9c27b0' },
              { label: 'Potential Monthly Saving', value: `₹${savingsWithUpgrade.toLocaleString()}`, icon: '💰', color: '#4caf50' },
            ].map(item => (
              <Grid item xs={6} key={item.label}>
                <Box p={2} sx={{ bgcolor: `${item.color}12`, borderRadius: 2 }}>
                  <Typography fontSize="1.5rem">{item.icon}</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Energy Saving Recommendations</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Improvement</TableCell>
                <TableCell>Monthly Saving</TableCell>
                <TableCell>Effort</TableCell>
                <TableCell>Payback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {improvements.map(imp => (
                <TableRow key={imp.action} hover>
                  <TableCell><Typography variant="body2">{imp.action}</Typography></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={700} color="success.main">{imp.saving}</Typography></TableCell>
                  <TableCell><Chip label={imp.effort} size="small" color={imp.effort === 'Very Low' || imp.effort === 'Low' ? 'success' : imp.effort === 'High' ? 'error' : 'warning'} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{imp.roi}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default function SimulationsPage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Environmental Simulations</Typography>
        <Typography variant="body1" color="text.secondary">Sunlight analysis, wind flow, flood simulation, and energy optimization for your building.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['☀️ Sunlight Simulator', '💨 Wind Flow', '🌊 Water & Flood', '⚡ Energy Optimizer'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <SunlightSimulatorTab />}
      {tab === 1 && <WindFlowTab />}
      {tab === 2 && <WaterFloodTab />}
      {tab === 3 && <EnergyOptimizerTab />}
    </Box>
  )
}
