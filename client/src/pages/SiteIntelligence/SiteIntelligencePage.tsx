// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent, Button,
  TextField, Select, MenuItem, FormControl, InputLabel, Slider, Chip,
  LinearProgress, Alert, Divider, Stack, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, IconButton,
} from '@mui/material'
import {
  Terrain, WaterDrop, Thunderstorm, Warning, CheckCircle, Info,
  LocationOn, SquareFoot, Explore, Thermostat, Air, Flood,
  Foundation, Calculate, Refresh,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

// ─── Types ─────────────────────────────────────────────────────────────────────
type PlotShape = 'rectangle' | 'square' | 'l-shaped' | 'triangle' | 'polygon'
type Topography = 'flat' | 'slight_slope' | 'medium_slope' | 'steep_slope'
type SoilType = 'sandy' | 'clay' | 'loamy' | 'rocky' | 'silty' | 'peaty'
type EqZone = 'I' | 'II' | 'III' | 'IV' | 'V'
type FloodZone = 'none' | 'low' | 'moderate' | 'high'

interface PlotData {
  length: number; width: number; frontage: number; roadWidth: number
  shape: PlotShape; topography: Topography
  gpsLat: string; gpsLng: string; plotNumber: string
}

interface SoilData {
  type: SoilType; moisture: number; density: number; porosity: number
  permeability: number; compaction: number; pH: number; organicMatter: number
  waterTableDepth: number
}

interface ClimateData {
  annualRainfall: number; monsoonMonths: number
  summerMax: number; winterMin: number; avgTemp: number
  windDir: string; windSpeed: number; cycloneRisk: boolean
}

interface HazardData {
  earthquakeZone: EqZone; floodZone: FloodZone
  landslideRisk: 'none' | 'low' | 'moderate' | 'high'
  coastalErosion: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const SOIL_INFO: Record<SoilType, { color: string; traits: string[]; desc: string }> = {
  sandy:  { color: '#f5deb3', traits: ['Fast drainage','Good for piles','Poor nutrients'], desc: 'Drains quickly. Requires deeper or pile foundations.' },
  clay:   { color: '#cd853f', traits: ['Expands when wet','Shrinks when dry','Deep foundation required'], desc: 'High plasticity. Raft or deep pile foundation recommended.' },
  loamy:  { color: '#8b7355', traits: ['Ideal for gardens','Good load-bearing','Balanced drainage'], desc: 'Best all-round soil. Strip or isolated footing works well.' },
  rocky:  { color: '#708090', traits: ['Excellent support','Difficult excavation','No settlement'], desc: 'Superior bearing. Isolated or pad footing sufficient.' },
  silty:  { color: '#c2b280', traits: ['Fine particles','Prone to erosion','Moderate drainage'], desc: 'Moderate capacity. Strip foundation with good waterproofing.' },
  peaty:  { color: '#4a4a2a', traits: ['Very soft','High moisture','Compressible'], desc: 'Weak soil. Pile foundation or soil stabilisation required.' },
}

function getBearingCapacity(soil: SoilType): { value: number; label: string; color: string } {
  const map: Record<SoilType, { value: number; label: string; color: string }> = {
    sandy:  { value: 45, label: 'Low–Medium (100–200 kN/m²)', color: '#ff9800' },
    clay:   { value: 30, label: 'Low (50–150 kN/m²)', color: '#f44336' },
    loamy:  { value: 65, label: 'Medium (150–250 kN/m²)', color: '#4caf50' },
    rocky:  { value: 95, label: 'High (300–600 kN/m²)', color: '#2196f3' },
    silty:  { value: 40, label: 'Low–Medium (80–180 kN/m²)', color: '#ff9800' },
    peaty:  { value: 10, label: 'Very Low (<50 kN/m²)', color: '#f44336' },
  }
  return map[soil]
}

function getFoundationRec(soil: SoilType, floors: number, wt: number): string[] {
  if (soil === 'rocky') return ['Isolated Footing', 'Pad Foundation']
  if (soil === 'peaty') return ['Pile Foundation', 'Mat Foundation']
  if (soil === 'clay') return wt < 2 ? ['Raft Foundation', 'Pile Foundation'] : ['Pile Foundation']
  if (soil === 'sandy') return floors > 3 ? ['Pile Foundation', 'Raft Foundation'] : ['Strip Foundation', 'Isolated Footing']
  if (soil === 'loamy') return floors > 4 ? ['Combined Footing', 'Raft Foundation'] : ['Strip Foundation', 'Isolated Footing']
  return ['Strip Foundation', 'Isolated Footing']
}

function calcPlotArea(p: PlotData): number {
  if (p.shape === 'l-shaped') return p.length * p.width * 0.75
  if (p.shape === 'triangle') return (p.length * p.width) / 2
  return p.length * p.width
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function LandSurveyTab() {
  const [plot, setPlot] = useState<PlotData>({
    length: 40, width: 30, frontage: 20, roadWidth: 20,
    shape: 'rectangle', topography: 'flat',
    gpsLat: '', gpsLng: '', plotNumber: '',
  })

  const area = useMemo(() => calcPlotArea(plot), [plot])
  const areaM2 = (area * 0.0929).toFixed(1)

  const shapes: { val: PlotShape; label: string }[] = [
    { val: 'rectangle', label: 'Rectangle' }, { val: 'square', label: 'Square' },
    { val: 'l-shaped', label: 'L-Shaped' }, { val: 'triangle', label: 'Triangle' },
    { val: 'polygon', label: 'Polygon' },
  ]
  const topos: { val: Topography; label: string; icon: string }[] = [
    { val: 'flat', label: 'Flat', icon: '═' },
    { val: 'slight_slope', label: 'Slight Slope', icon: '╱' },
    { val: 'medium_slope', label: 'Medium Slope', icon: '/' },
    { val: 'steep_slope', label: 'Steep Slope', icon: '|' },
  ]

  return (
    <Grid container spacing={3}>
      {/* Plot Dimensions */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SquareFoot color="primary" /> Plot Dimensions
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Length (ft)', key: 'length' }, { label: 'Width (ft)', key: 'width' },
              { label: 'Frontage Width (ft)', key: 'frontage' }, { label: 'Road Width (ft)', key: 'roadWidth' },
            ].map(({ label, key }) => (
              <Grid item xs={6} key={key}>
                <TextField
                  label={label} type="number" size="small" fullWidth
                  value={(plot as any)[key]}
                  onChange={e => setPlot(p => ({ ...p, [key]: Number(e.target.value) }))}
                />
              </Grid>
            ))}
            <Grid item xs={6}>
              <TextField label="Plot Number" size="small" fullWidth
                value={plot.plotNumber}
                onChange={e => setPlot(p => ({ ...p, plotNumber: e.target.value }))} />
            </Grid>
          </Grid>

          <Box mt={3} p={2} sx={{ background: 'linear-gradient(135deg,rgba(108,99,255,.1),rgba(255,101,132,.08))', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Calculated Area</Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">{area.toLocaleString()} sq ft</Typography>
            <Typography variant="body2" color="text.secondary">{areaM2} m² · {(area / 9).toFixed(1)} sq yards</Typography>
          </Box>
        </Paper>
      </Grid>

      {/* GPS & Identifiers */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" /> GPS & Location
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="GPS Latitude" size="small" fullWidth value={plot.gpsLat}
                onChange={e => setPlot(p => ({ ...p, gpsLat: e.target.value }))} placeholder="e.g. 22.5726" />
            </Grid>
            <Grid item xs={6}>
              <TextField label="GPS Longitude" size="small" fullWidth value={plot.gpsLng}
                onChange={e => setPlot(p => ({ ...p, gpsLng: e.target.value }))} placeholder="e.g. 88.3639" />
            </Grid>
          </Grid>

          {/* Shape */}
          <Typography variant="subtitle2" fontWeight={600} mt={3} mb={1}>Plot Shape Detection</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {shapes.map(s => (
              <Chip key={s.val} label={s.label} onClick={() => setPlot(p => ({ ...p, shape: s.val }))}
                color={plot.shape === s.val ? 'primary' : 'default'} variant={plot.shape === s.val ? 'filled' : 'outlined'} />
            ))}
          </Box>
          {plot.shape === 'l-shaped' && <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>L-shaped area ≈ 75% of bounding rectangle</Alert>}
          {plot.shape === 'triangle' && <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>Triangular area = ½ × base × height</Alert>}
        </Paper>

        {/* Topography */}
        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Terrain color="primary" /> Topography Analysis
          </Typography>
          <ToggleButtonGroup value={plot.topography} exclusive size="small" fullWidth
            onChange={(_, v) => v && setPlot(p => ({ ...p, topography: v }))}>
            {topos.map(t => (
              <ToggleButton key={t.val} value={t.val} sx={{ flexDirection: 'column', py: 1 }}>
                <Typography fontSize="1.2rem">{t.icon}</Typography>
                <Typography variant="caption">{t.label}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {plot.topography !== 'flat' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {plot.topography === 'steep_slope'
                ? 'Steep slope requires retaining walls and site grading — adds 15–25% to foundation cost.'
                : 'Sloped terrain requires levelling and retaining structures.'}
            </Alert>
          )}
        </Paper>
      </Grid>

      {/* GIS Integration */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Explore color="primary" /> GIS Integration
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Satellite View', icon: '🛰️', desc: 'High-resolution satellite imagery overlay' },
              { label: 'Drone Mapping', icon: '🚁', desc: 'Drone-based topographic mapping' },
              { label: 'Property Boundary', icon: '📐', desc: 'Auto-detect property boundary lines' },
              { label: 'Contour Lines', icon: '🗺️', desc: 'Elevation contour generation' },
            ].map(item => (
              <Grid item xs={6} md={3} key={item.label}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                  <Typography fontSize="2rem">{item.icon}</Typography>
                  <Typography variant="subtitle2" fontWeight={600}>{item.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  <Chip label="Pro Feature" size="small" sx={{ mt: 1 }} color="secondary" />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

function SoilInvestigationTab() {
  const [soil, setSoil] = useState<SoilData>({
    type: 'loamy', moisture: 22, density: 1650, porosity: 45,
    permeability: 55, compaction: 70, pH: 6.8, organicMatter: 3.2,
    waterTableDepth: 4,
  })
  const [floors, setFloors] = useState(2)

  const bearing = getBearingCapacity(soil.type)
  const recs = getFoundationRec(soil.type, floors, soil.waterTableDepth)
  const info = SOIL_INFO[soil.type]

  return (
    <Grid container spacing={3}>
      {/* Soil Type Cards */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Select Soil Type</Typography>
          <Grid container spacing={2}>
            {(Object.entries(SOIL_INFO) as [SoilType, typeof SOIL_INFO[SoilType]][]).map(([type, data]) => (
              <Grid item xs={6} md={2} key={type}>
                <Card
                  onClick={() => setSoil(s => ({ ...s, type }))}
                  sx={{
                    p: 2, textAlign: 'center', cursor: 'pointer', borderRadius: 2,
                    border: soil.type === type ? '2px solid' : '1px solid',
                    borderColor: soil.type === type ? 'primary.main' : 'divider',
                    bgcolor: soil.type === type ? 'action.selected' : 'background.paper',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: data.color, mx: 'auto', mb: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600} textTransform="capitalize">{type}</Typography>
                  <Typography variant="caption" color="text.secondary">{data.desc.split('.')[0]}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>{info.desc}</Alert>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            {info.traits.map(t => <Chip key={t} label={t} size="small" variant="outlined" />)}
          </Box>
        </Paper>
      </Grid>

      {/* Soil Properties */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Soil Properties</Typography>
          {[
            { key: 'moisture', label: 'Moisture Content', unit: '%', min: 0, max: 60 },
            { key: 'porosity', label: 'Porosity', unit: '%', min: 20, max: 80 },
            { key: 'permeability', label: 'Permeability', unit: 'mm/hr', min: 0, max: 150 },
            { key: 'compaction', label: 'Compaction Level', unit: '%', min: 30, max: 100 },
            { key: 'pH', label: 'pH Value', unit: '', min: 3, max: 10 },
            { key: 'organicMatter', label: 'Organic Matter', unit: '%', min: 0, max: 15 },
            { key: 'waterTableDepth', label: 'Water Table Depth', unit: 'm', min: 0.5, max: 15 },
          ].map(({ key, label, unit, min, max }) => (
            <Box key={key} mb={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={600}>{(soil as any)[key]}{unit}</Typography>
              </Box>
              <Slider size="small" min={min} max={max} step={0.1}
                value={(soil as any)[key]}
                onChange={(_, v) => setSoil(s => ({ ...s, [key]: v as number }))} />
            </Box>
          ))}
        </Paper>
      </Grid>

      {/* Bearing Capacity + Foundation Recommendation */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Bearing Capacity Analysis</Typography>
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2">Bearing Capacity</Typography>
              <Typography variant="body2" fontWeight={700} color={bearing.color}>{bearing.label}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={bearing.value}
              sx={{ height: 12, borderRadius: 6, '& .MuiLinearProgress-bar': { bgcolor: bearing.color } }} />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">Very Low</Typography>
              <Typography variant="caption" color="text.secondary">Excellent</Typography>
            </Box>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Range</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { cat: 'Low', range: '< 100 kN/m²', match: bearing.value < 40 },
                { cat: 'Medium', range: '100–300 kN/m²', match: bearing.value >= 40 && bearing.value < 80 },
                { cat: 'High', range: '> 300 kN/m²', match: bearing.value >= 80 },
              ].map(r => (
                <TableRow key={r.cat}>
                  <TableCell>{r.cat}</TableCell>
                  <TableCell>{r.range}</TableCell>
                  <TableCell>
                    {r.match ? <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} /> : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Foundation color="primary" /> Foundation Recommendation
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Building floors:</Typography>
          <Box display="flex" gap={1} mb={2}>
            {[1, 2, 3, 4, 5].map(f => (
              <Chip key={f} label={`G+${f - 1}`} onClick={() => setFloors(f)}
                color={floors === f ? 'primary' : 'default'} variant={floors === f ? 'filled' : 'outlined'} size="small" />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Based on: <b>{soil.type}</b> soil · {floors} floors · WT at {soil.waterTableDepth}m
          </Typography>
          <Stack spacing={1}>
            {recs.map((r, i) => (
              <Box key={r} display="flex" alignItems="center" gap={1.5} p={1.5}
                sx={{ bgcolor: i === 0 ? 'primary.main' : 'action.hover', borderRadius: 2 }}>
                <Foundation sx={{ color: i === 0 ? 'white' : 'primary.main', fontSize: 20 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color={i === 0 ? 'white' : 'text.primary'}>
                    {r} {i === 0 && '(Recommended)'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

function ClimateAnalysisTab() {
  const [climate, setClimate] = useState<ClimateData>({
    annualRainfall: 1600, monsoonMonths: 4,
    summerMax: 42, winterMin: 10, avgTemp: 26,
    windDir: 'SW', windSpeed: 18, cycloneRisk: false,
  })

  const drainageReq = climate.annualRainfall > 2000 ? 'High' : climate.annualRainfall > 1000 ? 'Medium' : 'Low'

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WaterDrop color="primary" /> Rainfall Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="Annual Rainfall (mm)" type="number" size="small" fullWidth
                value={climate.annualRainfall}
                onChange={e => setClimate(c => ({ ...c, annualRainfall: Number(e.target.value) }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Monsoon Duration (months)" type="number" size="small" fullWidth
                value={climate.monsoonMonths}
                onChange={e => setClimate(c => ({ ...c, monsoonMonths: Number(e.target.value) }))} />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Alert severity={drainageReq === 'High' ? 'warning' : drainageReq === 'Medium' ? 'info' : 'success'}>
              Drainage Requirement: <b>{drainageReq}</b> — {climate.annualRainfall}mm annual rainfall
            </Alert>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Thermostat color="primary" /> Temperature
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField label="Summer Max (°C)" type="number" size="small" fullWidth
                value={climate.summerMax}
                onChange={e => setClimate(c => ({ ...c, summerMax: Number(e.target.value) }))} />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Winter Min (°C)" type="number" size="small" fullWidth
                value={climate.winterMin}
                onChange={e => setClimate(c => ({ ...c, winterMin: Number(e.target.value) }))} />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Annual Avg (°C)" type="number" size="small" fullWidth
                value={climate.avgTemp}
                onChange={e => setClimate(c => ({ ...c, avgTemp: Number(e.target.value) }))} />
            </Grid>
          </Grid>
          {climate.summerMax > 40 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Extreme heat — consider thermal insulation, double glazing, and light-coloured roof.
            </Alert>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Air color="primary" /> Wind Analysis
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <FormControl size="small" fullWidth>
                <InputLabel>Wind Direction</InputLabel>
                <Select value={climate.windDir} label="Wind Direction"
                  onChange={e => setClimate(c => ({ ...c, windDir: e.target.value }))}>
                  {['N','NE','E','SE','S','SW','W','NW'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Wind Speed (km/h)" type="number" size="small" fullWidth
                value={climate.windSpeed}
                onChange={e => setClimate(c => ({ ...c, windSpeed: Number(e.target.value) }))} />
            </Grid>
          </Grid>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">Cyclone Risk Zone:</Typography>
            <ToggleButtonGroup size="small" value={climate.cycloneRisk ? 'yes' : 'no'} exclusive
              onChange={(_, v) => v && setClimate(c => ({ ...c, cycloneRisk: v === 'yes' }))}>
              <ToggleButton value="yes">Yes</ToggleButton>
              <ToggleButton value="no">No</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {climate.cycloneRisk && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Cyclone zone — reinforce roof connections, use hurricane straps, deep anchor bolts.
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Climate Summary</Typography>
          {[
            { label: 'Rainfall', value: `${climate.annualRainfall} mm/yr`, icon: '🌧️' },
            { label: 'Peak Temperature', value: `${climate.winterMin}°C – ${climate.summerMax}°C`, icon: '🌡️' },
            { label: 'Wind', value: `${climate.windDir} at ${climate.windSpeed} km/h`, icon: '💨' },
            { label: 'Drainage Need', value: drainageReq, icon: '🚿' },
          ].map(r => (
            <Box key={r.label} display="flex" alignItems="center" gap={2} py={1.2}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Typography fontSize="1.5rem">{r.icon}</Typography>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                <Typography variant="subtitle2" fontWeight={700}>{r.value}</Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  )
}

function HazardAnalysisTab() {
  const [hazard, setHazard] = useState<HazardData>({
    earthquakeZone: 'III', floodZone: 'low', landslideRisk: 'none', coastalErosion: false,
  })

  const eqSeverity: Record<EqZone, { label: string; color: string; desc: string }> = {
    'I':   { label: 'Very Low', color: '#4caf50', desc: 'Minimal seismic activity. Standard RCC design.' },
    'II':  { label: 'Low', color: '#8bc34a', desc: 'Low seismic activity. IS 1893 Zone II compliance.' },
    'III': { label: 'Moderate', color: '#ff9800', desc: 'Moderate risk. Ductile detailing required.' },
    'IV':  { label: 'High', color: '#f44336', desc: 'High risk. Special moment frames required.' },
    'V':   { label: 'Very High', color: '#9c27b0', desc: 'Maximum risk. Seismic isolation recommended.' },
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="primary" /> Earthquake Zone (IS 1893)
          </Typography>
          <ToggleButtonGroup value={hazard.earthquakeZone} exclusive fullWidth size="small"
            onChange={(_, v) => v && setHazard(h => ({ ...h, earthquakeZone: v }))}>
            {(['I','II','III','IV','V'] as EqZone[]).map(z => (
              <ToggleButton key={z} value={z}
                sx={{ borderColor: hazard.earthquakeZone === z ? eqSeverity[z].color : undefined }}>
                Zone {z}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Box mt={2} p={2} sx={{ bgcolor: `${eqSeverity[hazard.earthquakeZone].color}22`, borderRadius: 2,
            border: `1px solid ${eqSeverity[hazard.earthquakeZone].color}44` }}>
            <Typography variant="subtitle1" fontWeight={700} color={eqSeverity[hazard.earthquakeZone].color}>
              {eqSeverity[hazard.earthquakeZone].label} Seismic Risk
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {eqSeverity[hazard.earthquakeZone].desc}
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Flood color="primary" /> Flood Zone Assessment
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel>Flood Zone</InputLabel>
            <Select value={hazard.floodZone} label="Flood Zone"
              onChange={e => setHazard(h => ({ ...h, floodZone: e.target.value as FloodZone }))}>
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="low">Low Risk</MenuItem>
              <MenuItem value="moderate">Moderate Risk</MenuItem>
              <MenuItem value="high">High Risk</MenuItem>
            </Select>
          </FormControl>
          {hazard.floodZone !== 'none' && (
            <Alert severity={hazard.floodZone === 'high' ? 'error' : hazard.floodZone === 'moderate' ? 'warning' : 'info'} sx={{ mt: 2 }}>
              {hazard.floodZone === 'high' && 'Raise plinth level by ≥600mm. Install flood barriers. Waterproof basement walls.'}
              {hazard.floodZone === 'moderate' && 'Raise plinth by 300–450mm. Provide proper stormwater drainage.'}
              {hazard.floodZone === 'low' && 'Standard plinth height sufficient. Ensure surface drainage grading.'}
            </Alert>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Terrain color="warning" /> Landslide Risk
          </Typography>
          <ToggleButtonGroup value={hazard.landslideRisk} exclusive fullWidth size="small"
            onChange={(_, v) => v && setHazard(h => ({ ...h, landslideRisk: v }))}>
            {['none','low','moderate','high'].map(r => (
              <ToggleButton key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</ToggleButton>
            ))}
          </ToggleButtonGroup>
          {hazard.landslideRisk !== 'none' && (
            <Alert severity={hazard.landslideRisk === 'high' ? 'error' : 'warning'} sx={{ mt: 2 }}>
              Slope stabilisation required. Install retaining walls and drainage channels.
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Coastal Erosion Risk</Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body2">Is the plot near coastal area?</Typography>
            <ToggleButtonGroup size="small" value={hazard.coastalErosion ? 'yes' : 'no'} exclusive
              onChange={(_, v) => v && setHazard(h => ({ ...h, coastalErosion: v === 'yes' }))}>
              <ToggleButton value="yes">Yes</ToggleButton>
              <ToggleButton value="no">No</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {hazard.coastalErosion && (
            <Alert severity="warning">
              Coastal erosion risk — use corrosion-resistant reinforcement, saline-resistant concrete mix.
            </Alert>
          )}
        </Paper>

        {/* Combined Hazard Summary */}
        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Hazard Summary</Typography>
          <Stack spacing={1.5}>
            {[
              { label: 'Earthquake Zone', value: `Zone ${hazard.earthquakeZone} — ${eqSeverity[hazard.earthquakeZone].label}`, color: eqSeverity[hazard.earthquakeZone].color },
              { label: 'Flood Risk', value: hazard.floodZone === 'none' ? 'None' : `${hazard.floodZone.charAt(0).toUpperCase() + hazard.floodZone.slice(1)} Risk`, color: hazard.floodZone === 'none' ? '#4caf50' : hazard.floodZone === 'high' ? '#f44336' : '#ff9800' },
              { label: 'Landslide Risk', value: hazard.landslideRisk.charAt(0).toUpperCase() + hazard.landslideRisk.slice(1), color: hazard.landslideRisk === 'none' ? '#4caf50' : '#ff9800' },
              { label: 'Coastal Erosion', value: hazard.coastalErosion ? 'Present' : 'None', color: hazard.coastalErosion ? '#ff9800' : '#4caf50' },
            ].map(item => (
              <Box key={item.label} display="flex" justifyContent="space-between" alignItems="center"
                p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Chip label={item.value} size="small" sx={{ bgcolor: `${item.color}22`, color: item.color, fontWeight: 700 }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function SiteIntelligencePage() {
  const [tab, setTab] = useState(0)

  const tabs = [
    { label: 'Land Survey', icon: <SquareFoot /> },
    { label: 'Soil Investigation', icon: <Terrain /> },
    { label: 'Climate Analysis', icon: <Thunderstorm /> },
    { label: 'Hazard Analysis', icon: <Warning /> },
  ]

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Site & Land Intelligence</Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive site analysis — soil, climate, topography, and hazard assessment for informed planning.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {tabs.map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start"
              sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>

      <Box mt={3}>
        {tab === 0 && <LandSurveyTab />}
        {tab === 1 && <SoilInvestigationTab />}
        {tab === 2 && <ClimateAnalysisTab />}
        {tab === 3 && <HazardAnalysisTab />}
      </Box>
    </Box>
  )
}
