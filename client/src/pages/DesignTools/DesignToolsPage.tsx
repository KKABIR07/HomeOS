// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, Chip, Slider } from '@mui/material'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function getRoomLayout(project: any) {
  if (!project) return []
  const area = project.builtArea || 120
  const beds = project.bedrooms || 2
  const baths = project.bathrooms || 2
  const floors = project.floors || 1
  const perFloor = area / floors
  const livingPct = 0.25, kitchenPct = 0.10, bedPct = 0.18, bathPct = 0.07

  const rooms = [
    { room: 'Living Room', area: Math.round(perFloor * livingPct), count: 1, floor: 1 },
    { room: 'Kitchen + Dining', area: Math.round(perFloor * kitchenPct * 1.5), count: 1, floor: 1 },
    ...Array.from({ length: beds }, (_, i) => ({ room: `Bedroom ${i + 1}`, area: Math.round(perFloor * bedPct), count: 1, floor: i < beds / 2 ? 1 : 2 })),
    ...Array.from({ length: baths }, (_, i) => ({ room: `Bathroom ${i + 1}`, area: Math.round(perFloor * bathPct), count: 1, floor: i < baths / 2 ? 1 : 2 })),
    { room: 'Utility / Store', area: Math.round(perFloor * 0.05), count: 1, floor: 1 },
    { room: 'Balcony / Veranda', area: Math.round(perFloor * 0.08), count: floors, floor: 1 },
  ]
  return rooms
}

function getAccessibility(project: any) {
  const floors = project?.floors || 1
  const recs = [
    { feature: 'Wide doorways (≥ 900 mm)', needed: true, note: 'Universal design standard' },
    { feature: 'Ground floor bedroom + bathroom', needed: true, note: 'Accessibility for elderly/mobility impaired' },
    { feature: 'Ramp at entrance (1:12 slope)', needed: true, note: 'Wheelchair access' },
    { feature: 'Non-slip flooring in bathrooms', needed: true, note: 'Safety for all ages' },
    { feature: 'Elevator / lift', needed: floors > 2, note: floors > 2 ? `Required for ${floors} floors` : 'Optional for 1–2 floors' },
    { feature: 'Grab bars in bathrooms', needed: project?.bathrooms > 0, note: 'Elderly & disability support' },
    { feature: 'Contrasting colours on steps', needed: floors > 1, note: 'Visual impairment safety' },
  ]
  return recs
}

export default function DesignToolsPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const [furnitureScale, setFurnitureScale] = useState(80)

  const rooms = useMemo(() => getRoomLayout(project), [project])
  const accessibility = useMemo(() => getAccessibility(project), [project])

  if (isLoading || !project) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading…</Typography></Box>

  const area = project.builtArea || 120
  const totalRoomArea = rooms.reduce((a, r) => a + r.area, 0)

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Design+</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {area} m² · {project.bedrooms || '–'} bed · {project.floors || 1} floor(s)</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['🛋 Room Layout', '📐 Space Analysis', '♿ Accessibility', '🎨 Style Guide'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Room area estimates based on {area} m² built area across {project.floors || 1} floor(s).</Alert>
          <Grid container spacing={2}>
            {rooms.map((room, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{room.room}</Typography>
                    <Chip label={`Floor ${room.floor}`} size="small" sx={{ fontSize: '0.65rem' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{room.area}<Typography component="span" variant="caption" sx={{ ml: 0.5 }}>m²</Typography></Typography>
                  <Typography variant="caption" color="text.secondary">{Math.round(room.area * 10.76)} sq ft</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Area Distribution</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart layout="vertical" data={rooms.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis type="number" tick={{ fontSize: 11 }} unit=" m²" />
                    <YAxis type="category" dataKey="room" tick={{ fontSize: 10 }} width={140} />
                    <Tooltip formatter={(v: number) => `${v} m²`} />
                    <Bar dataKey="area" fill="#6C63FF" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Space Summary</Typography>
                {[['Total Built Area', `${area} m²`], ['Mapped Room Area', `${totalRoomArea} m²`], ['Circulation/Walls', `${area - totalRoomArea} m²`], ['Efficiency Ratio', `${Math.round((totalRoomArea / area) * 100)}%`], ['Floors', project.floors || 1], ['Area/Floor', `${Math.round(area / (project.floors || 1))} m²`]].map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Accessibility checklist tailored for {project.floors || 1}-floor {project.houseType} with {project.bedrooms || '–'} bedrooms.</Alert>
          {accessibility.map((item, i) => (
            <Card key={i} sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.feature}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.note}</Typography>
                </Box>
                <Chip label={item.needed ? 'Recommended' : 'Optional'} size="small" color={item.needed ? 'primary' : 'default'} sx={{ ml: 2 }} />
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {tab === 3 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Style palette based on your chosen design style: <strong>{project.style || 'Not set'}</strong></Alert>
          {project.style ? (
            <Grid container spacing={2.5}>
              {[
                { label: 'Primary', color: project.style === 'modern' ? '#1A1A2E' : project.style === 'minimalist' ? '#F5F5F0' : project.style === 'mediterranean' ? '#E8D5B7' : '#2C3E50' },
                { label: 'Accent', color: project.style === 'modern' ? '#6C63FF' : project.style === 'minimalist' ? '#B5A99A' : project.style === 'mediterranean' ? '#C0392B' : '#3498DB' },
                { label: 'Neutral', color: project.style === 'modern' ? '#E0E0E0' : '#F8F8F8' },
                { label: 'Highlight', color: project.style === 'tropical' ? '#27AE60' : project.style === 'industrial' ? '#E67E22' : '#ECF0F1' },
              ].map(({ label, color }) => (
                <Grid item xs={6} md={3} key={label}>
                  <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{ height: 80, bgcolor: color }} />
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{color}</Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Materials for {project.style} style</Typography>
                  {({ modern: ['Polished concrete', 'Steel & glass', 'Oak veneer', 'Matte finish tiles'], minimalist: ['White walls', 'Natural wood', 'Stone flooring', 'Minimal fixtures'], traditional: ['Brick facades', 'Teak wood', 'Marble flooring', 'Carved woodwork'], contemporary: ['Textured render', 'Large format tiles', 'Brushed metals', 'Open-plan layout'], industrial: ['Exposed brick', 'Raw steel', 'Concrete flooring', 'Reclaimed wood'], mediterranean: ['Terracotta tiles', 'Whitewashed walls', 'Wrought iron', 'Mosaic accents'], colonial: ['Red brick', 'Verandah pillars', 'Mangalore tiles', 'Teak shutters'], craftsman: ['Stone accents', 'Exposed beams', 'Built-in shelving', 'Natural materials'] }[project.style] || ['Consult your architect for material recommendations']).map((m) => (
                    <Box key={m} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="body2">{m}</Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="warning">Set a design style on your project to see style recommendations.</Alert>
          )}
        </Box>
      )}
    </Box>
  )
}
