// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Chip, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Stack, Alert, Table, TableBody, TableCell, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Slider, LinearProgress, Divider,
} from '@mui/material'
import {
  Forest, WaterDrop, LocalFlorist, Grass, Calculate,
  Spa, Park, FilterList,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

// ─── Types & Data ───────────────────────────────────────────────────────────────
interface GrassType {
  id: string; name: string; climate: string; maintenance: 'Very Low' | 'Low' | 'Medium' | 'High'
  drought: boolean; shade: boolean; traffic: 'Low' | 'Medium' | 'High'
  growth: 'Slow' | 'Medium' | 'Fast'; color: string; cost: string; desc: string
}

const GRASSES: GrassType[] = [
  { id: 'bermuda', name: 'Bermuda Grass', climate: 'Hot / Tropical', maintenance: 'Medium', drought: true, shade: false, traffic: 'High', growth: 'Fast', color: '#4caf50', cost: '₹8–14/sq ft', desc: 'Most popular in Indian hot climates. Excellent durability, recovers fast from wear.' },
  { id: 'zoysia', name: 'Zoysia Grass', climate: 'Tropical / Sub-tropical', maintenance: 'Low', drought: true, shade: true, traffic: 'Medium', growth: 'Slow', color: '#66bb6a', cost: '₹12–20/sq ft', desc: 'Dense, fine texture. Great for tropical zones. Low mowing frequency.' },
  { id: 'buffalo', name: 'Buffalo Grass', climate: 'Dry / Semi-arid', maintenance: 'Very Low', drought: true, shade: false, traffic: 'Low', growth: 'Slow', color: '#8d6e63', cost: '₹6–10/sq ft', desc: 'Extremely drought tolerant. Ideal for dry regions with minimal watering needs.' },
  { id: 'kentucky', name: 'Kentucky Bluegrass', climate: 'Cool / Temperate', maintenance: 'High', drought: false, shade: false, traffic: 'Medium', growth: 'Medium', color: '#2196f3', cost: '₹15–28/sq ft', desc: 'Rich blue-green colour. Best for cool regions like Himachal, Uttarakhand.' },
  { id: 'st_augustine', name: 'St. Augustine Grass', climate: 'Coastal / Humid', maintenance: 'Medium', drought: false, shade: true, traffic: 'Medium', growth: 'Fast', color: '#388e3c', cost: '₹10–18/sq ft', desc: 'Excellent shade tolerance. Thrives in coastal and humid environments.' },
  { id: 'centipede', name: 'Centipede Grass', climate: 'Warm / Humid', maintenance: 'Very Low', drought: false, shade: true, traffic: 'Low', growth: 'Slow', color: '#558b2f', cost: '₹8–15/sq ft', desc: 'Low-care lawn grass. Requires minimal fertilisation. Great for gardens.' },
]

interface Plant {
  id: string; name: string; category: 'Tree' | 'Shrub' | 'Flower' | 'Climber' | 'Indoor' | 'Fruit'
  sunlight: 'Full Sun' | 'Partial' | 'Shade'; water: 'Low' | 'Medium' | 'High'
  height: string; growth: 'Slow' | 'Medium' | 'Fast'; flowering: string; icon: string
  desc: string
}

const PLANTS: Plant[] = [
  { id: 'neem', name: 'Neem Tree', category: 'Tree', sunlight: 'Full Sun', water: 'Low', height: '15–20m', growth: 'Fast', flowering: 'Mar–May', icon: '🌳', desc: 'Medicinal, air-purifying, drought resistant.' },
  { id: 'mango', name: 'Mango Tree', category: 'Fruit', sunlight: 'Full Sun', water: 'Medium', height: '10–15m', growth: 'Medium', flowering: 'Dec–Feb', icon: '🥭', desc: 'Shade-providing fruit tree. Excellent ROI.' },
  { id: 'bougainvillea', name: 'Bougainvillea', category: 'Climber', sunlight: 'Full Sun', water: 'Low', height: '3–5m', growth: 'Fast', flowering: 'Year-round', icon: '🌸', desc: 'Vibrant colours, drought tolerant, low maintenance.' },
  { id: 'hibiscus', name: 'Hibiscus', category: 'Shrub', sunlight: 'Full Sun', water: 'Medium', height: '1–3m', growth: 'Medium', flowering: 'Year-round', icon: '🌺', desc: 'Iconic tropical flower. Attracts butterflies.' },
  { id: 'bamboo', name: 'Bamboo', category: 'Shrub', sunlight: 'Partial', water: 'High', height: '4–10m', growth: 'Fast', flowering: 'Rare', icon: '🎋', desc: 'Privacy screen, wind break, fast-growing.' },
  { id: 'jasmine', name: 'Jasmine', category: 'Climber', sunlight: 'Partial', water: 'Medium', height: '2–4m', growth: 'Fast', flowering: 'Mar–Jun', icon: '🌼', desc: 'Fragrant climber. Perfect for trellises and fences.' },
  { id: 'tulsi', name: 'Tulsi (Holy Basil)', category: 'Indoor', sunlight: 'Full Sun', water: 'Medium', height: '0.3–0.6m', growth: 'Fast', flowering: 'Year-round', icon: '🌿', desc: 'Sacred, medicinal. Excellent air purifier.' },
  { id: 'snake_plant', name: 'Snake Plant', category: 'Indoor', sunlight: 'Shade', water: 'Low', height: '0.5–1m', growth: 'Slow', flowering: 'Rare', icon: '🪴', desc: 'Best indoor air purifier. Extremely low maintenance.' },
  { id: 'ashoka', name: 'Ashoka Tree', category: 'Tree', sunlight: 'Full Sun', water: 'Medium', height: '8–12m', growth: 'Medium', flowering: 'Feb–Apr', icon: '🌲', desc: 'Ornamental, sacred. Excellent for boundary planting.' },
  { id: 'marigold', name: 'Marigold', category: 'Flower', sunlight: 'Full Sun', water: 'Low', height: '0.3–0.6m', growth: 'Fast', flowering: 'Oct–Mar', icon: '🌻', desc: 'Bright seasonal flowers. Natural pest repellent.' },
  { id: 'rose', name: 'Rose', category: 'Flower', sunlight: 'Full Sun', water: 'High', height: '0.5–2m', growth: 'Medium', flowering: 'Oct–Mar', icon: '🌹', desc: 'Classic beauty. Many varieties, rich fragrance.' },
  { id: 'guava', name: 'Guava Tree', category: 'Fruit', sunlight: 'Full Sun', water: 'Low', height: '4–8m', growth: 'Fast', flowering: 'May–Jul', icon: '🍈', desc: 'Highly productive fruit tree. Hardy, drought tolerant.' },
]

const GARDEN_STYLES = [
  { id: 'modern', name: 'Modern Garden', desc: 'Clean lines, minimal planting, concrete & steel features', icon: '🏙️', colors: ['#607d8b', '#e0e0e0', '#4caf50'], plants: ['Bamboo', 'Ornamental Grasses', 'Succulents'] },
  { id: 'tropical', name: 'Tropical Garden', desc: 'Lush greenery, bold foliage, water features', icon: '🌴', colors: ['#1b5e20', '#76ff03', '#0288d1'], plants: ['Bougainvillea', 'Hibiscus', 'Banana Plant'] },
  { id: 'japanese', name: 'Japanese Zen', desc: 'Rock garden, moss, minimalist, contemplative', icon: '⛩️', colors: ['#4e342e', '#33691e', '#9e9e9e'], plants: ['Bamboo', 'Bonsai', 'Moss'] },
  { id: 'mediterranean', name: 'Mediterranean', desc: 'Terracotta, herbs, olive trees, dry-climate plants', icon: '🫒', colors: ['#e65100', '#827717', '#4caf50'], plants: ['Olive Tree', 'Lavender', 'Rosemary'] },
  { id: 'cottage', name: 'Cottage Garden', desc: 'Informal, colourful, wildflower-style planting', icon: '🌸', colors: ['#e91e63', '#9c27b0', '#ffc107'], plants: ['Roses', 'Marigold', 'Jasmine'] },
  { id: 'farmhouse', name: 'Farmhouse Garden', desc: 'Productive, mixed vegetables, fruit trees, herbs', icon: '🌾', colors: ['#558b2f', '#f9a825', '#795548'], plants: ['Mango', 'Guava', 'Tulsi', 'Vegetables'] },
]

// ─── Sub-components ─────────────────────────────────────────────────────────────
function GardenDesignTab() {
  const [selected, setSelected] = useState('modern')
  const style = GARDEN_STYLES.find(s => s.id === selected)!

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Garden Style Selector</Typography>
          <Grid container spacing={2}>
            {GARDEN_STYLES.map(s => (
              <Grid item xs={6} md={4} key={s.id}>
                <Card
                  onClick={() => setSelected(s.id)}
                  sx={{
                    cursor: 'pointer', borderRadius: 2, border: '2px solid',
                    borderColor: selected === s.id ? 'primary.main' : 'divider',
                    bgcolor: selected === s.id ? 'action.selected' : 'background.paper',
                    transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography fontSize="2rem" mb={0.5}>{s.icon}</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>{style.icon} {style.name} — Design Palette</Typography>
          <Box display="flex" gap={2} mb={2}>
            {style.colors.map((c, i) => (
              <Box key={i}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: c, border: '2px solid', borderColor: 'divider', mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary">{c}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>Recommended Plants</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {style.plants.map(p => <Chip key={p} label={p} size="small" icon={<LocalFlorist />} color="success" variant="outlined" />)}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Layout Features</Typography>
          {[
            { label: 'Entry Pathway', detail: 'Natural stone / cobblestone + border plants' },
            { label: 'Central Lawn', detail: `${style.name === 'Japanese Zen' ? 'Zen rock garden' : 'Grass lawn'} with feature tree` },
            { label: 'Boundary Planting', detail: 'Tall shrubs / hedges for privacy' },
            { label: 'Water Feature', detail: style.id === 'japanese' ? 'Koi pond / rock waterfall' : style.id === 'tropical' ? 'Tropical pool edge' : 'Decorative fountain' },
            { label: 'Seating Area', detail: 'Pergola / shaded outdoor sitting' },
          ].map(f => (
            <Box key={f.label} py={1.2} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Typography variant="subtitle2" fontWeight={600}>{f.label}</Typography>
              <Typography variant="body2" color="text.secondary">{f.detail}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  )
}

function GrassSelectionTab() {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? GRASSES : GRASSES.filter(g =>
    filter === 'drought' ? g.drought : filter === 'shade' ? g.shade : filter === 'low_maint' ? (g.maintenance === 'Very Low' || g.maintenance === 'Low') : true
  )

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {[
            { v: 'all', label: 'All Grasses' }, { v: 'drought', label: 'Drought Tolerant' },
            { v: 'shade', label: 'Shade Tolerant' }, { v: 'low_maint', label: 'Low Maintenance' },
          ].map(f => (
            <Chip key={f.v} label={f.v === 'all' ? `All (${GRASSES.length})` : f.label}
              onClick={() => setFilter(f.v)} color={filter === f.v ? 'primary' : 'default'}
              variant={filter === f.v ? 'filled' : 'outlined'} icon={<FilterList />} />
          ))}
        </Box>
      </Grid>

      {filtered.map(g => (
        <Grid item xs={12} md={6} key={g.id}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grass sx={{ color: 'white' }} />
              </Box>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700}>{g.name}</Typography>
                <Typography variant="body2" color="text.secondary">{g.climate}</Typography>
              </Box>
              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>{g.cost}</Typography>
            </Box>
            <Typography variant="body2" mb={2}>{g.desc}</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`Maintenance: ${g.maintenance}`} size="small"
                color={g.maintenance === 'Very Low' || g.maintenance === 'Low' ? 'success' : g.maintenance === 'High' ? 'error' : 'warning'} />
              <Chip label={`Traffic: ${g.traffic}`} size="small" />
              <Chip label={`Growth: ${g.growth}`} size="small" />
              {g.drought && <Chip label="Drought Tolerant" size="small" color="info" icon={<WaterDrop />} />}
              {g.shade && <Chip label="Shade Tolerant" size="small" color="success" icon={<Park />} />}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

function PlantDatabaseTab() {
  const [catFilter, setCatFilter] = useState<string>('All')
  const [sunFilter, setSunFilter] = useState<string>('All')
  const [waterFilter, setWaterFilter] = useState<string>('All')

  const categories = ['All', 'Tree', 'Shrub', 'Flower', 'Climber', 'Indoor', 'Fruit']

  const filtered = PLANTS.filter(p =>
    (catFilter === 'All' || p.category === catFilter) &&
    (sunFilter === 'All' || p.sunlight === sunFilter) &&
    (waterFilter === 'All' || p.water === waterFilter)
  )

  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {categories.map(c => (
              <Chip key={c} label={c} size="small" onClick={() => setCatFilter(c)}
                color={catFilter === c ? 'primary' : 'default'} variant={catFilter === c ? 'filled' : 'outlined'} />
            ))}
          </Box>
          <Divider orientation="vertical" flexItem />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sunlight</InputLabel>
            <Select value={sunFilter} label="Sunlight" onChange={e => setSunFilter(e.target.value)}>
              {['All','Full Sun','Partial','Shade'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Water Need</InputLabel>
            <Select value={waterFilter} label="Water Need" onChange={e => setWaterFilter(e.target.value)}>
              {['All','Low','Medium','High'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <Chip label={`${filtered.length} plants`} size="small" variant="outlined" />
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {filtered.map(p => (
          <Grid item xs={6} md={3} key={p.id}>
            <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography fontSize="2.5rem">{p.icon}</Typography>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>{p.name}</Typography>
                <Chip label={p.category} size="small" sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>{p.desc}</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="center">
                  <Chip label={p.sunlight} size="small" color={p.sunlight === 'Full Sun' ? 'warning' : p.sunlight === 'Shade' ? 'info' : 'default'} />
                  <Chip label={`💧 ${p.water}`} size="small" />
                  <Chip label={p.height} size="small" variant="outlined" />
                  <Chip label={`🌸 ${p.flowering}`} size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function WaterManagementTab() {
  const [roofArea, setRoofArea] = useState(1200)
  const [rainfall, setRainfall] = useState(1600)
  const [efficiency, setEfficiency] = useState(80)
  const [irrigationType, setIrrigationType] = useState('drip')

  const potential = useMemo(() => {
    const liters = (roofArea * 0.0929) * (rainfall / 1000) * (efficiency / 100) * 1000
    return Math.round(liters / 1000)
  }, [roofArea, rainfall, efficiency])

  const tankCapacity = Math.round(potential * 0.04)

  const irrigationTypes = [
    { id: 'drip', name: 'Drip Irrigation', efficiency: '90%', cost: '₹15,000–40,000', water: 'Minimum', best: 'Gardens, trees, vegetables' },
    { id: 'sprinkler', name: 'Sprinkler System', efficiency: '75%', cost: '₹25,000–80,000', water: 'Medium', best: 'Lawns, large gardens' },
    { id: 'soaker', name: 'Soaker Hose', efficiency: '85%', cost: '₹5,000–15,000', water: 'Low', best: 'Flower beds, shrubs' },
    { id: 'underground', name: 'Underground Irrigation', efficiency: '95%', cost: '₹60,000–1,50,000', water: 'Minimum', best: 'Premium lawns, sports fields' },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WaterDrop color="primary" /> Rainwater Harvesting Calculator
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6}>
              <TextField label="Roof Area (sq ft)" type="number" size="small" fullWidth
                value={roofArea} onChange={e => setRoofArea(Number(e.target.value))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Annual Rainfall (mm)" type="number" size="small" fullWidth
                value={rainfall} onChange={e => setRainfall(Number(e.target.value))} />
            </Grid>
          </Grid>
          <Typography variant="body2" mb={0.5}>Collection Efficiency: {efficiency}%</Typography>
          <Slider value={efficiency} min={50} max={95} onChange={(_, v) => setEfficiency(v as number)}
            marks={[{ value: 50, label: '50%' }, { value: 80, label: '80%' }, { value: 95, label: '95%' }]} />

          <Box mt={3} p={2.5} sx={{ background: 'linear-gradient(135deg,rgba(33,150,243,.1),rgba(0,188,212,.08))', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Annual Collection Potential</Typography>
                <Typography variant="h4" fontWeight={800} color="primary.main">{potential.toLocaleString()} kL</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Recommended Tank Size</Typography>
                <Typography variant="h4" fontWeight={800} color="secondary.main">{tankCapacity} kL</Typography>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="success" sx={{ mt: 2 }}>
            {potential > 500
              ? `Excellent potential! ${potential}kL/yr can supply garden water needs + partial domestic use.`
              : `${potential}kL/yr is adequate for garden irrigation.`}
          </Alert>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Spa color="primary" /> Irrigation System Types
          </Typography>
          <Stack spacing={2}>
            {irrigationTypes.map(t => (
              <Box key={t.id}
                onClick={() => setIrrigationType(t.id)}
                sx={{
                  p: 2, borderRadius: 2, cursor: 'pointer', border: '2px solid',
                  borderColor: irrigationType === t.id ? 'primary.main' : 'divider',
                  bgcolor: irrigationType === t.id ? 'action.selected' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="subtitle2" fontWeight={700}>{t.name}</Typography>
                  <Chip label={`Eff: ${t.efficiency}`} size="small" color="success" />
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>{t.best}</Typography>
                <Box display="flex" gap={1}>
                  <Chip label={t.cost} size="small" variant="outlined" color="primary" />
                  <Chip label={`Water: ${t.water}`} size="small" variant="outlined" />
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function LandscapeDesignPage() {
  const [tab, setTab] = useState(0)

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Landscape & Water Management</Typography>
        <Typography variant="body1" color="text.secondary">
          Garden design, grass selection, plant database, and smart water management solutions.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {[
            { label: 'Garden Design', icon: <Park /> },
            { label: 'Grass Selection', icon: <Grass /> },
            { label: 'Plant Database', icon: <LocalFlorist /> },
            { label: 'Water Management', icon: <WaterDrop /> },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start"
              sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>

      <Box mt={3}>
        {tab === 0 && <GardenDesignTab />}
        {tab === 1 && <GrassSelectionTab />}
        {tab === 2 && <PlantDatabaseTab />}
        {tab === 3 && <WaterManagementTab />}
      </Box>
    </Box>
  )
}
