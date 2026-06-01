// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Chip, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  ToggleButton, ToggleButtonGroup, Tooltip, Stack, Divider, Alert,
} from '@mui/material'
import {
  Construction, Layers, Straighten, WaterDrop, ElectricBolt,
  CheckCircle, Star, TrendingUp,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

// ─── Data ───────────────────────────────────────────────────────────────────────
interface Material {
  id: string; name: string; subtitle?: string
  color: string; specs: Record<string, string>
  pros: string[]; cons: string[]
  priceRange: string; rating: number; eco: boolean
  bestFor: string
}

const BRICKS: Material[] = [
  {
    id: 'clay', name: 'Clay Brick', subtitle: 'Traditional fired clay',
    color: '#c8673a', priceRange: '₹7–9/brick', rating: 4, eco: false,
    bestFor: 'Load-bearing walls, all climates',
    specs: { 'Compressive Strength': '35–100 kg/cm²', 'Water Absorption': '12–20%', 'Thermal Conductivity': '0.8 W/mK', 'Size (IS 1077)': '190×90×90 mm', 'Weight': '2.6–3.0 kg' },
    pros: ['High compressive strength','Excellent durability','Fire resistant','Good thermal mass'],
    cons: ['High water absorption','Heavy','Not eco-friendly','Irregular dimensions'],
  },
  {
    id: 'flyAsh', name: 'Fly Ash Brick', subtitle: 'Industrial by-product',
    color: '#9e9e9e', priceRange: '₹6–8/brick', rating: 4.5, eco: true,
    bestFor: 'Cost-effective construction, eco-projects',
    specs: { 'Compressive Strength': '75–100 kg/cm²', 'Water Absorption': '6–12%', 'Thermal Conductivity': '0.9 W/mK', 'Size': '230×110×76 mm', 'Weight': '3.0–3.3 kg' },
    pros: ['Higher strength than clay','Lower water absorption','Eco-friendly (uses waste)','Uniform size'],
    cons: ['Efflorescence risk','Limited availability in some areas'],
  },
  {
    id: 'AAC', name: 'AAC Block', subtitle: 'Autoclaved Aerated Concrete',
    color: '#e0e0e0', priceRange: '₹70–95/block', rating: 5, eco: true,
    bestFor: 'Multi-storey, thermal comfort, fast construction',
    specs: { 'Compressive Strength': '25–40 kg/cm²', 'Water Absorption': '< 10%', 'Thermal Conductivity': '0.16 W/mK', 'Size': '600×200×200 mm', 'Weight': '8–9 kg' },
    pros: ['Excellent thermal insulation','Lightweight (saves 30% on structure)','Sound insulation','Fire rated 2–4hrs','Fast laying'],
    cons: ['Higher unit cost','Requires special adhesive mortar','Lower compressive strength'],
  },
  {
    id: 'CLC', name: 'CLC Block', subtitle: 'Cellular Lightweight Concrete',
    color: '#f5f5f5', priceRange: '₹22–28/block', rating: 4, eco: true,
    bestFor: 'Non-load-bearing partitions, upper floors',
    specs: { 'Compressive Strength': '10–30 kg/cm²', 'Water Absorption': '< 15%', 'Thermal Conductivity': '0.22 W/mK', 'Size': '400×200×200 mm', 'Weight': '6–7 kg' },
    pros: ['Good thermal insulation','Lightweight','Cost-effective','Easy to cut'],
    cons: ['Lower strength than AAC','Less durable in wet conditions'],
  },
  {
    id: 'wirecut', name: 'Wire Cut Brick', subtitle: 'Machine-made precision',
    color: '#bf360c', priceRange: '₹8–11/brick', rating: 4.5, eco: false,
    bestFor: 'Exposed brickwork, facades',
    specs: { 'Compressive Strength': '> 100 kg/cm²', 'Water Absorption': '< 10%', 'Thermal Conductivity': '0.82 W/mK', 'Size': '230×110×70 mm', 'Weight': '3.2–3.6 kg' },
    pros: ['Very uniform dimensions','High strength','Low absorption','Excellent finish'],
    cons: ['Higher cost','Harder surface needs special mortar'],
  },
]

const CEMENTS: Material[] = [
  {
    id: 'OPC33', name: 'OPC 33 Grade', subtitle: 'Ordinary Portland Cement',
    color: '#bdbdbd', priceRange: '₹340–360/bag (50kg)', rating: 3, eco: false,
    bestFor: 'Plastering, masonry mortar',
    specs: { 'Compressive (3d)': '≥ 16 MPa', 'Compressive (28d)': '≥ 33 MPa', 'Initial Set': '≥ 30 min', 'Final Set': '≤ 600 min', 'Fineness': '225 m²/kg' },
    pros: ['Economical','Good workability','Suitable for masonry work'],
    cons: ['Low early strength','Not for RCC','Slower gain'],
  },
  {
    id: 'OPC43', name: 'OPC 43 Grade', subtitle: 'Ordinary Portland Cement',
    color: '#9e9e9e', priceRange: '₹370–395/bag (50kg)', rating: 4, eco: false,
    bestFor: 'General construction, slabs, moderate RCC',
    specs: { 'Compressive (3d)': '≥ 23 MPa', 'Compressive (28d)': '≥ 43 MPa', 'Initial Set': '≥ 30 min', 'Final Set': '≤ 600 min', 'Fineness': '225 m²/kg' },
    pros: ['Good all-purpose cement','Higher strength than OPC33','Wide availability'],
    cons: ['Not as strong as OPC53 for high RCC'],
  },
  {
    id: 'OPC53', name: 'OPC 53 Grade', subtitle: 'High-strength Portland Cement',
    color: '#757575', priceRange: '₹400–430/bag (50kg)', rating: 5, eco: false,
    bestFor: 'RCC columns, beams, slabs, high-rise',
    specs: { 'Compressive (3d)': '≥ 27 MPa', 'Compressive (28d)': '≥ 53 MPa', 'Initial Set': '≥ 30 min', 'Final Set': '≤ 600 min', 'Fineness': '225 m²/kg' },
    pros: ['Highest strength','Fast gain','Best for structural RCC','Durable'],
    cons: ['Higher heat of hydration','More expensive'],
  },
  {
    id: 'PPC', name: 'PPC', subtitle: 'Portland Pozzolana Cement',
    color: '#a5d6a7', priceRange: '₹355–380/bag (50kg)', rating: 4.5, eco: true,
    bestFor: 'Marine/coastal structures, plastering, eco-build',
    specs: { 'Compressive (28d)': '≥ 33 MPa', 'Pozzolana': '15–35%', 'Initial Set': '≥ 30 min', 'Durability': 'High', 'Heat of Hydration': 'Low' },
    pros: ['Eco-friendly (uses fly ash)','Durable in aggressive environments','Low heat of hydration','Cost-effective'],
    cons: ['Slower strength gain','Not ideal for cold weather'],
  },
  {
    id: 'white', name: 'White Cement', subtitle: 'Decorative & jointing',
    color: '#ffffff', priceRange: '₹750–900/bag (50kg)', rating: 3.5, eco: false,
    bestFor: 'Tile grouting, decorative work, pointing',
    specs: { 'Compressive (28d)': '≥ 43 MPa', 'Whiteness': '≥ 85%', 'Fe₂O₃': '< 0.4%', 'Setting Time': 'Normal', 'Use': 'Non-structural' },
    pros: ['Brilliant white finish','Good adhesion','Ideal for decorative work'],
    cons: ['Expensive','Not for structural use','Stain-prone'],
  },
]

const STEELS: Material[] = [
  {
    id: 'Fe415', name: 'Fe 415', subtitle: 'Mild high-yield steel',
    color: '#90a4ae', priceRange: '₹58–64/kg', rating: 3.5, eco: false,
    bestFor: 'Light structures, footings, slabs',
    specs: { 'Yield Strength': '415 N/mm²', 'Tensile Strength': '485 N/mm²', 'Elongation': '14.5%', 'Bend Test': '3d mandrel', 'IS Code': 'IS 1786' },
    pros: ['Good flexibility','Easy bending','Older standard','Lower cost'],
    cons: ['Lower strength than Fe500','More steel needed per design'],
  },
  {
    id: 'Fe500', name: 'Fe 500', subtitle: 'Most common structural steel',
    color: '#607d8b', priceRange: '₹64–70/kg', rating: 5, eco: false,
    bestFor: 'Columns, beams, slabs — standard residential',
    specs: { 'Yield Strength': '500 N/mm²', 'Tensile Strength': '545 N/mm²', 'Elongation': '12%', 'Bend Test': '4d mandrel', 'IS Code': 'IS 1786' },
    pros: ['Best strength-to-cost ratio','Industry standard','Wide availability','Good weldability'],
    cons: ['Less ductile than Fe415'],
  },
  {
    id: 'Fe550', name: 'Fe 550', subtitle: 'High-strength TMT',
    color: '#455a64', priceRange: '₹70–76/kg', rating: 4.5, eco: false,
    bestFor: 'High-rise, large spans, heavy loads',
    specs: { 'Yield Strength': '550 N/mm²', 'Tensile Strength': '585 N/mm²', 'Elongation': '10%', 'Bend Test': '4d mandrel', 'IS Code': 'IS 1786' },
    pros: ['Higher strength → less steel','Good for seismic zones','Reduced congestion in sections'],
    cons: ['Less ductile','Higher cost'],
  },
  {
    id: 'Fe600', name: 'Fe 600', subtitle: 'Ultra-high-strength TMT',
    color: '#263238', priceRange: '₹76–84/kg', rating: 4, eco: false,
    bestFor: 'Industrial, bridges, tall buildings',
    specs: { 'Yield Strength': '600 N/mm²', 'Tensile Strength': '660 N/mm²', 'Elongation': '8%', 'Bend Test': '5d mandrel', 'IS Code': 'IS 1786' },
    pros: ['Maximum strength','Minimum steel volume','For critical structures'],
    cons: ['Lowest ductility','Very high cost','Specialist welding required'],
  },
]

const FLOORINGS: { category: string; items: { name: string; material: string; price: string; durability: number; maintenance: string; slip: string; heat: string; best: string }[] }[] = [
  {
    category: 'Marble',
    items: [
      { name: 'Italian Marble', material: 'Natural stone', price: '₹180–350/sq ft', durability: 90, maintenance: 'High', slip: 'Medium', heat: 'Cool', best: 'Living room, master bedroom' },
      { name: 'Makrana Marble', material: 'Indian natural stone', price: '₹80–160/sq ft', durability: 85, maintenance: 'High', slip: 'Medium', heat: 'Cool', best: 'Halls, flooring' },
    ],
  },
  {
    category: 'Granite',
    items: [
      { name: 'Black Granite', material: 'Natural stone', price: '₹70–130/sq ft', durability: 95, maintenance: 'Low', slip: 'Low', heat: 'Cool', best: 'Kitchen, bathroom' },
      { name: 'Red Granite', material: 'Natural stone', price: '₹65–120/sq ft', durability: 95, maintenance: 'Low', slip: 'Low', heat: 'Cool', best: 'Outdoor, pathways' },
    ],
  },
  {
    category: 'Tiles',
    items: [
      { name: 'Vitrified Tiles', material: 'Ceramic', price: '₹45–120/sq ft', durability: 80, maintenance: 'Low', slip: 'Low–Med', heat: 'Neutral', best: 'Bedrooms, living rooms' },
      { name: 'Porcelain Tiles', material: 'Ceramic', price: '₹60–180/sq ft', durability: 85, maintenance: 'Very Low', slip: 'Low', heat: 'Neutral', best: 'Bathrooms, kitchens' },
      { name: 'Ceramic Tiles', material: 'Ceramic', price: '₹25–80/sq ft', durability: 70, maintenance: 'Low', slip: 'Varies', heat: 'Neutral', best: 'Budget projects' },
    ],
  },
  {
    category: 'Wood',
    items: [
      { name: 'Oak Wood', material: 'Hardwood', price: '₹120–220/sq ft', durability: 80, maintenance: 'Medium', slip: 'High', heat: 'Warm', best: 'Bedrooms, studies' },
      { name: 'Teak Wood', material: 'Hardwood', price: '₹200–400/sq ft', durability: 95, maintenance: 'Medium', slip: 'High', heat: 'Warm', best: 'Premium projects, decks' },
      { name: 'Walnut Wood', material: 'Hardwood', price: '₹180–320/sq ft', durability: 85, maintenance: 'Medium', slip: 'High', heat: 'Warm', best: 'Living rooms, offices' },
    ],
  },
]

// ─── Sub-components ─────────────────────────────────────────────────────────────
function MaterialCard({ mat, selected, onSelect }: { mat: Material; selected: boolean; onSelect: () => void }) {
  return (
    <Card
      onClick={onSelect}
      sx={{
        cursor: 'pointer', borderRadius: 3, border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        transition: 'all 0.2s', height: '100%',
        '&:hover': { borderColor: 'primary.main', boxShadow: 4 },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: mat.color, border: '2px solid', borderColor: 'divider', flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{mat.name}</Typography>
            <Typography variant="caption" color="text.secondary">{mat.subtitle}</Typography>
          </Box>
          {mat.eco && <Chip label="Eco" size="small" color="success" sx={{ ml: 'auto' }} />}
        </Box>
        <Typography variant="body2" color="primary.main" fontWeight={600} mb={1}>{mat.priceRange}</Typography>
        <Box display="flex" gap={0.5} mb={1.5} flexWrap="wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} sx={{ fontSize: 14, color: i < Math.floor(mat.rating) ? '#ffc107' : 'action.disabled' }} />
          ))}
          <Typography variant="caption" color="text.secondary">({mat.rating})</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" fontStyle="italic">Best for: {mat.bestFor}</Typography>
      </CardContent>
    </Card>
  )
}

function MaterialDetail({ mat }: { mat: Material }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>{mat.name} — Detailed Specs</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>Technical Specifications</Typography>
          <Table size="small">
            <TableBody>
              {Object.entries(mat.specs).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell sx={{ color: 'text.secondary', border: 0, py: 0.8 }}>{k}</TableCell>
                  <TableCell sx={{ fontWeight: 600, border: 0, py: 0.8 }}>{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" fontWeight={600} mb={1} color="success.main">Advantages</Typography>
          <Stack spacing={0.8} mb={2}>
            {mat.pros.map(p => (
              <Box key={p} display="flex" alignItems="center" gap={1}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2">{p}</Typography>
              </Box>
            ))}
          </Stack>
          <Typography variant="subtitle2" fontWeight={600} mb={1} color="error.main">Limitations</Typography>
          <Stack spacing={0.8}>
            {mat.cons.map(c => (
              <Box key={c} display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ color: 'white', fontSize: 10, fontWeight: 700 }}>−</Typography>
                </Box>
                <Typography variant="body2">{c}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}

function BricksTab() {
  const [selected, setSelected] = useState('clay')
  const mat = BRICKS.find(b => b.id === selected)!
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {BRICKS.map(b => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <MaterialCard mat={b} selected={selected === b.id} onSelect={() => setSelected(b.id)} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}><MaterialDetail mat={mat} /></Grid>
    </Grid>
  )
}

function CementTab() {
  const [selected, setSelected] = useState('OPC53')
  const mat = CEMENTS.find(c => c.id === selected)!
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {CEMENTS.map(c => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <MaterialCard mat={c} selected={selected === c.id} onSelect={() => setSelected(c.id)} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}><MaterialDetail mat={mat} /></Grid>
    </Grid>
  )
}

function SteelTab() {
  const [selected, setSelected] = useState('Fe500')
  const mat = STEELS.find(s => s.id === selected)!
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {STEELS.map(s => (
            <Grid item xs={12} sm={6} md={3} key={s.id}>
              <MaterialCard mat={s} selected={selected === s.id} onSelect={() => setSelected(s.id)} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}><MaterialDetail mat={mat} /></Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Corrosion Resistance Comparison</Typography>
          {STEELS.map(s => (
            <Box key={s.id} mb={1.5}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">{s.name}</Typography>
                <Typography variant="caption" color="text.secondary">{s.priceRange}</Typography>
              </Box>
              <LinearProgress variant="determinate"
                value={s.id === 'Fe415' ? 60 : s.id === 'Fe500' ? 72 : s.id === 'Fe550' ? 80 : 85}
                sx={{ height: 8, borderRadius: 4 }} color={selected === s.id ? 'primary' : 'inherit'} />
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  )
}

function FlooringTab() {
  return (
    <Box>
      {FLOORINGS.map(cat => (
        <Paper key={cat.category} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>{cat.category}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Price Range</TableCell>
                <TableCell>Durability</TableCell>
                <TableCell>Maintenance</TableCell>
                <TableCell>Slip Risk</TableCell>
                <TableCell>Heat Feel</TableCell>
                <TableCell>Best For</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cat.items.map(item => (
                <TableRow key={item.name} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{item.name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{item.material}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="primary.main" fontWeight={600}>{item.price}</Typography></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress variant="determinate" value={item.durability} sx={{ width: 60, height: 6, borderRadius: 3 }} />
                      <Typography variant="caption">{item.durability}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={item.maintenance} size="small" color={item.maintenance === 'Very Low' || item.maintenance === 'Low' ? 'success' : item.maintenance === 'High' ? 'error' : 'warning'} /></TableCell>
                  <TableCell><Chip label={item.slip} size="small" /></TableCell>
                  <TableCell><Chip label={item.heat} size="small" color={item.heat === 'Cool' ? 'info' : item.heat === 'Warm' ? 'warning' : 'default'} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{item.best}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </Box>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function MaterialsDatabasePage() {
  const [tab, setTab] = useState(0)

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Construction Material Database</Typography>
        <Typography variant="body1" color="text.secondary">
          Complete reference for bricks, cement, steel, and flooring — with specs, costs, and recommendations.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {[
            { label: 'Bricks & Blocks', icon: <Layers /> },
            { label: 'Cement', icon: <Construction /> },
            { label: 'Steel', icon: <Straighten /> },
            { label: 'Flooring', icon: <Layers /> },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start"
              sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>

      <Box mt={3}>
        {tab === 0 && <BricksTab />}
        {tab === 1 && <CementTab />}
        {tab === 2 && <SteelTab />}
        {tab === 3 && <FlooringTab />}
      </Box>
    </Box>
  )
}
