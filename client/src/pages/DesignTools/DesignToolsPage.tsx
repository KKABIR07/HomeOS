// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Alert, Stack,
  TextField, Button, Slider, ToggleButton, ToggleButtonGroup,
  Card, CardContent, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, Switch, FormControlLabel,
} from '@mui/material'
import {
  Chair, Accessibility, FamilyRestroom, RecordVoiceOver,
  CheckCircle, Warning, Straighten, Stairs, DirectionsWalk,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

// ─── Feature 17: Smart Furniture Planner ──────────────────────────────────────
function FurniturePlannerTab() {
  const [room, setRoom] = useState('living')
  const [length, setLength] = useState(18)
  const [width, setWidth] = useState(15)
  const [style, setStyle] = useState('modern')

  const layouts: Record<string, { furniture: { name: string; size: string; x: number; y: number; w: number; h: number; color: string }[]; checks: { label: string; pass: boolean; detail: string }[] }> = {
    living: {
      furniture: [
        { name: '3-Seat Sofa', size: "7'×3'", x: 1, y: 1, w: 7, h: 3, color: '#6C63FF' },
        { name: 'Coffee Table', size: "4'×2'", x: 3, y: 5, w: 4, h: 2, color: '#ff9800' },
        { name: 'TV Unit', size: "6'×1.5'", x: 6, y: 1, w: 6, h: 1.5, color: '#607d8b' },
        { name: 'Armchair', size: "3'×3'", x: 1, y: 5, w: 3, h: 3, color: '#9c27b0' },
        { name: 'Side Table', size: "1.5'×1.5'", x: 9, y: 3, w: 1.5, h: 1.5, color: '#795548' },
      ],
      checks: [
        { label: 'Walking clearance ≥ 3ft', pass: length >= 14, detail: `${length}ft room — ${length >= 14 ? 'adequate' : 'too small'} for furniture + circulation` },
        { label: 'TV viewing distance', pass: width >= 12, detail: `Ideal viewing distance: ${Math.round(width * 0.7)}ft for this room width` },
        { label: 'Door clearance', pass: true, detail: 'All furniture placed 3ft+ from entry door' },
        { label: 'Natural light access', pass: true, detail: 'Sofa placement avoids blocking window light path' },
      ],
    },
    bedroom: {
      furniture: [
        { name: 'Queen Bed', size: "5'×6.5'", x: 2, y: 1, w: 5, h: 6.5, color: '#3f51b5' },
        { name: 'Wardrobe', size: "6'×2'", x: 1, y: 8, w: 6, h: 2, color: '#795548' },
        { name: 'Dresser', size: "4'×1.5'", x: 8, y: 2, w: 4, h: 1.5, color: '#9e9e9e' },
        { name: 'Nightstand ×2', size: "1.5'×1.5'", x: 1, y: 3, w: 1.5, h: 1.5, color: '#ff9800' },
        { name: 'Study Table', size: "4'×2'", x: 8, y: 5, w: 4, h: 2, color: '#4caf50' },
      ],
      checks: [
        { label: 'Bed side clearance ≥ 2ft', pass: width >= 12, detail: 'Need minimum 2ft on each side of bed' },
        { label: 'Wardrobe door swing', pass: length >= 14, detail: 'Sliding wardrobe recommended for rooms < 14ft wide' },
        { label: 'Window not blocked', pass: true, detail: 'Bed headboard perpendicular to window wall' },
        { label: 'Accessibility (door to bed)', pass: width >= 10, detail: 'Clear path ≥ 3ft from door to bed' },
      ],
    },
    kitchen: {
      furniture: [
        { name: 'Lower Cabinets', size: "10'×2'", x: 1, y: 1, w: 10, h: 2, color: '#795548' },
        { name: 'Upper Cabinets', size: "10'×1'", x: 1, y: 0, w: 10, h: 1, color: '#a1887f' },
        { name: 'Kitchen Island', size: "4'×3'", x: 3, y: 5, w: 4, h: 3, color: '#607d8b' },
        { name: 'Refrigerator', size: "2.5'×2.5'", x: 11, y: 1, w: 2.5, h: 2.5, color: '#90a4ae' },
        { name: 'Sink Area', size: "3'×2'", x: 4, y: 1, w: 3, h: 2, color: '#64b5f6' },
      ],
      checks: [
        { label: 'Work triangle (sink-stove-fridge)', pass: true, detail: 'Ideal work triangle: 4–9ft between each station' },
        { label: 'Island clearance ≥ 3.5ft', pass: width >= 12, detail: `${width - 4}ft available around island` },
        { label: 'Overhead clearance', pass: true, detail: 'Counter height 34", uppers at 54" from floor' },
        { label: 'Ventilation zone', pass: true, detail: 'Range hood positioned above cooking area' },
      ],
    },
  }

  const scale = Math.min(18 / length, 12 / width) * 20
  const currentLayout = layouts[room] || layouts.living
  const passCount = currentLayout.checks.filter(c => c.pass).length

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Room Parameters</Typography>
          <Box mb={2}>
            <Typography variant="body2" mb={1}>Room Type</Typography>
            <ToggleButtonGroup size="small" value={room} exclusive fullWidth onChange={(_, v) => v && setRoom(v)}>
              {['living','bedroom','kitchen'].map(r => <ToggleButton key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</ToggleButton>)}
            </ToggleButtonGroup>
          </Box>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField label="Length (ft)" type="number" size="small" fullWidth value={length} onChange={e => setLength(Number(e.target.value))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Width (ft)" type="number" size="small" fullWidth value={width} onChange={e => setWidth(Number(e.target.value))} />
            </Grid>
          </Grid>
          <Typography variant="body2" mb={1}>Design Style</Typography>
          <ToggleButtonGroup size="small" value={style} exclusive fullWidth onChange={(_, v) => v && setStyle(v)}>
            {['modern','classic','minimalist'].map(s => <ToggleButton key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</ToggleButton>)}
          </ToggleButtonGroup>

          <Box mt={3} p={2} sx={{ bgcolor: passCount === currentLayout.checks.length ? 'success.main' + '18' : 'warning.main' + '18', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={700}>{passCount}/{currentLayout.checks.length} layout checks passed</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>Layout Validation</Typography>
          <Stack spacing={1}>
            {currentLayout.checks.map(c => (
              <Box key={c.label} display="flex" gap={1.5} p={1.2} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
                {c.pass ? <CheckCircle sx={{ color: 'success.main', fontSize: 18, flexShrink: 0 }} /> : <Warning sx={{ color: 'warning.main', fontSize: 18, flexShrink: 0 }} />}
                <Box>
                  <Typography variant="caption" fontWeight={600}>{c.label}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{c.detail}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>AI Furniture Layout — {length}ft × {width}ft {room.charAt(0).toUpperCase() + room.slice(1)}</Typography>
          <Box sx={{ width: '100%', height: 320, bgcolor: '#f5f5f0', borderRadius: 2, position: 'relative', border: '2px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 8, left: 8, width: length * scale, height: width * scale, bgcolor: 'white', border: '2px solid #333', borderRadius: 1 }}>
              {currentLayout.furniture.map(f => (
                <Box key={f.name}
                  sx={{ position: 'absolute', left: f.x * scale, top: f.y * scale, width: f.w * scale, height: f.h * scale,
                    bgcolor: f.color + '44', border: `2px solid ${f.color}`, borderRadius: 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: f.color, textAlign: 'center', fontSize: Math.max(8, 10 * scale / 20) }}>
                    {f.name}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <Typography variant="caption" color="text.secondary">Scale: 1ft = {scale.toFixed(0)}px</Typography>
            </Box>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {currentLayout.furniture.map(f => (
              <Chip key={f.name} label={`${f.name} (${f.size})`} size="small" sx={{ bgcolor: f.color + '22', color: f.color, border: `1px solid ${f.color}44` }} />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 23: Family Lifestyle Planner ─────────────────────────────────────
function LifestylePlannerTab() {
  const [family, setFamily] = useState({ adults: 2, children: 1, elderly: 0, pets: false, workFromHome: false, hobbies: [] as string[] })

  const hobbiesList = ['Yoga/Fitness', 'Music', 'Art/Craft', 'Cooking', 'Home Theater', 'Gaming', 'Library/Reading', 'Gardening']

  const recommendations = useMemo(() => {
    const recs: string[] = []
    const bedrooms = family.adults + Math.ceil(family.children / 2) + (family.elderly > 0 ? 1 : 0)
    const bathrooms = Math.ceil(bedrooms * 0.75)
    recs.push(`Recommended: ${bedrooms} Bedrooms, ${bathrooms} Bathrooms`)
    if (family.elderly > 0) recs.push('Ground floor bedroom for elderly — avoid stair use')
    if (family.children > 0) recs.push("Children's play area near kitchen — parent supervision from kitchen")
    if (family.workFromHome) recs.push('Dedicated study/home office — soundproofed, natural light, separate entrance preferred')
    if (family.pets) recs.push('Pet washroom near main entrance, pet-friendly flooring (avoid marble), garden access')
    if (family.hobbies.includes('Yoga/Fitness')) recs.push('10×12 ft multipurpose room / yoga studio with rubber flooring')
    if (family.hobbies.includes('Music')) recs.push('Music room with acoustic treatment, away from bedrooms')
    if (family.hobbies.includes('Home Theater')) recs.push('Dedicated AV room with blackout capability and acoustic panels')
    if (family.hobbies.includes('Gardening')) recs.push('South-facing garden with water point, tool storage nearby')
    if (family.hobbies.includes('Art/Craft')) recs.push('Art studio with north light (indirect, no glare), easy-clean flooring')
    if (family.adults + family.children + family.elderly > 5) recs.push('Large dining (min 12×14 ft) to seat 8+ people')
    return recs
  }, [family])

  const minArea = useMemo(() => {
    const bedrooms = family.adults + Math.ceil(family.children / 2) + (family.elderly > 0 ? 1 : 0)
    return bedrooms * 150 + 250 + (family.workFromHome ? 120 : 0) + (family.hobbies.length * 80)
  }, [family])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FamilyRestroom color="primary" /> Family Profile
          </Typography>
          <Grid container spacing={2} mb={2}>
            {[{ label: 'Adults', key: 'adults' }, { label: 'Children', key: 'children' }, { label: 'Elderly', key: 'elderly' }].map(f => (
              <Grid item xs={4} key={f.key}>
                <TextField label={f.label} type="number" size="small" fullWidth value={(family as any)[f.key]}
                  onChange={e => setFamily(p => ({ ...p, [f.key]: Number(e.target.value) }))} inputProps={{ min: 0, max: 10 }} />
              </Grid>
            ))}
          </Grid>
          <Stack spacing={1} mb={2}>
            <FormControlLabel control={<Switch checked={family.pets} onChange={e => setFamily(p => ({ ...p, pets: e.target.checked }))} />} label="Has Pets" />
            <FormControlLabel control={<Switch checked={family.workFromHome} onChange={e => setFamily(p => ({ ...p, workFromHome: e.target.checked }))} />} label="Work From Home" />
          </Stack>
          <Typography variant="body2" mb={1}>Hobbies / Interests</Typography>
          <Box display="flex" flexWrap="wrap" gap={0.8}>
            {hobbiesList.map(h => (
              <Chip key={h} label={h} size="small"
                onClick={() => setFamily(p => ({ ...p, hobbies: p.hobbies.includes(h) ? p.hobbies.filter(x => x !== h) : [...p.hobbies, h] }))}
                color={family.hobbies.includes(h) ? 'primary' : 'default'} variant={family.hobbies.includes(h) ? 'filled' : 'outlined'} />
            ))}
          </Box>
          <Box mt={2} p={2} sx={{ bgcolor: 'primary.main', borderRadius: 2 }}>
            <Typography variant="caption" color="white">Minimum Recommended Area</Typography>
            <Typography variant="h4" fontWeight={900} color="white">{minArea.toLocaleString()}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>sq ft carpet area</Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>AI Space Recommendations</Typography>
          <Stack spacing={1.5}>
            {recommendations.map((rec, i) => (
              <Box key={i} display="flex" gap={1.5} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" color="white" fontWeight={700}>{i + 1}</Typography>
                </Box>
                <Typography variant="body2">{rec}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 24: Accessibility Planner ────────────────────────────────────────
function AccessibilityTab() {
  const [needs, setNeeds] = useState({ wheelchair: false, visualImpairment: false, hearingImpairment: false, elderlyFriendly: true, childSafety: false })

  const suggestions = [
    { category: 'Entry & Pathways', items: [
      { label: 'Wheelchair ramp at main entrance (1:12 slope)', applicable: needs.wheelchair },
      { label: 'Level threshold — no step at entry door', applicable: needs.wheelchair || needs.elderlyFriendly },
      { label: 'Minimum 900mm clear door width throughout', applicable: needs.wheelchair },
      { label: 'Tactile strips at level changes', applicable: needs.visualImpairment },
    ]},
    { category: 'Bathrooms', items: [
      { label: 'Grab bars beside WC (height 700–750mm)', applicable: needs.wheelchair || needs.elderlyFriendly },
      { label: 'Roll-in shower (no threshold)', applicable: needs.wheelchair },
      { label: 'Non-slip flooring throughout', applicable: needs.elderlyFriendly || needs.wheelchair },
      { label: 'Fold-down shower seat', applicable: needs.wheelchair || needs.elderlyFriendly },
    ]},
    { category: 'Stairs & Vertical Access', items: [
      { label: 'Lift / home elevator (900×900mm min shaft)', applicable: needs.wheelchair || needs.elderlyFriendly },
      { label: 'Handrails on both sides, continuous', applicable: needs.elderlyFriendly || needs.visualImpairment },
      { label: 'Contrasting colour on stair nosing', applicable: needs.visualImpairment },
      { label: 'Stair gate at top and bottom', applicable: needs.childSafety },
    ]},
    { category: 'Kitchen', items: [
      { label: 'Adjustable-height counter (700–900mm)', applicable: needs.wheelchair },
      { label: 'D-pull cabinet handles (lever type)', applicable: needs.wheelchair || needs.elderlyFriendly },
      { label: 'Knee space under cooktop and sink', applicable: needs.wheelchair },
      { label: 'Contrasting cabinet edges for visibility', applicable: needs.visualImpairment },
    ]},
    { category: 'General', items: [
      { label: 'Visual fire alarms (strobe lights)', applicable: needs.hearingImpairment },
      { label: 'Doorbell with visual indicator', applicable: needs.hearingImpairment },
      { label: 'Outlet height at 450–1200mm (reachable from wheelchair)', applicable: needs.wheelchair },
      { label: 'Child-proof socket covers and cabinet locks', applicable: needs.childSafety },
    ]},
  ]

  const totalApplicable = suggestions.flatMap(s => s.items).filter(i => i.applicable).length

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Accessibility color="primary" /> Accessibility Needs
          </Typography>
          <Stack spacing={1.5}>
            {Object.entries(needs).map(([key, val]) => (
              <FormControlLabel key={key} control={<Switch checked={val} onChange={e => setNeeds(n => ({ ...n, [key]: e.target.checked }))} />}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} />
            ))}
          </Stack>
          <Box mt={2} p={2} sx={{ bgcolor: totalApplicable > 0 ? 'primary.main' + '18' : 'action.hover', borderRadius: 2 }}>
            <Typography variant="h4" fontWeight={900} color="primary.main">{totalApplicable}</Typography>
            <Typography variant="caption" color="text.secondary">accessibility features recommended</Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        {suggestions.map(cat => {
          const applicableItems = cat.items.filter(i => i.applicable)
          if (applicableItems.length === 0) return null
          return (
            <Paper key={cat.category} sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>{cat.category}</Typography>
              <Stack spacing={0.8}>
                {applicableItems.map(item => (
                  <Box key={item.label} display="flex" gap={1.5} alignItems="center">
                    <Accessibility sx={{ color: 'primary.main', fontSize: 16, flexShrink: 0 }} />
                    <Typography variant="body2">{item.label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )
        })}
        {totalApplicable === 0 && (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
            <Typography fontSize="3rem" mb={2}>✅</Typography>
            <Typography variant="h6" color="text.secondary">Select accessibility needs to see recommendations</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

export default function DesignToolsPage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Design Tools</Typography>
        <Typography variant="body1" color="text.secondary">Smart furniture planner, family lifestyle planner, and accessibility design assistant.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['🪑 Furniture Planner', '👨‍👩‍👧 Lifestyle Planner', '♿ Accessibility Planner'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <FurniturePlannerTab />}
      {tab === 1 && <LifestylePlannerTab />}
      {tab === 2 && <AccessibilityTab />}
    </Box>
  )
}
