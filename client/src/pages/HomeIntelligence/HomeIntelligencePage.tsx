// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, LinearProgress, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function buildMaintenance(project: any) {
  const age = 0
  const floors = project?.floors || 1
  const houseType = project?.houseType || 'residential'
  const tasks = [
    { task: 'Exterior paint', urgency: 'Low', interval: '5 years', cost: Math.round((project?.builtArea || 100) * 80) },
    { task: 'Roof waterproofing check', urgency: floors > 1 ? 'Medium' : 'Low', interval: '3 years', cost: 15000 },
    { task: 'Electrical inspection', urgency: 'Medium', interval: '2 years', cost: 8000 },
    { task: 'Plumbing check', urgency: 'Low', interval: '2 years', cost: 5000 },
    { task: 'HVAC service', urgency: 'High', interval: '1 year', cost: 12000 },
    { task: 'Pest control', urgency: 'Medium', interval: '6 months', cost: 3500 },
    { task: 'Structural crack inspection', urgency: floors > 2 ? 'High' : 'Low', interval: '3 years', cost: 20000 },
    ...(houseType === 'commercial' ? [{ task: 'Fire suppression system test', urgency: 'High', interval: '1 year', cost: 25000 }] : []),
  ]
  return tasks
}

function buildHealthMetrics(weather: any) {
  if (!weather) return []
  const temp = weather.current.temperature
  const humid = weather.current.humidity
  return [
    { metric: 'Indoor Humidity (est.)', value: Math.min(100, humid - 5), unit: '%', safe: humid < 65, threshold: 60 },
    { metric: 'Ventilation Index', value: weather.current.windSpeed > 5 ? 85 : 55, unit: '/100', safe: weather.current.windSpeed > 5, threshold: 70 },
    { metric: 'Thermal Comfort', value: Math.max(0, 100 - Math.abs(temp - 22) * 4), unit: '/100', safe: Math.abs(temp - 22) < 8, threshold: 70 },
    { metric: 'Natural Light Score', value: weather.current.weatherCode < 3 ? 90 : 55, unit: '/100', safe: weather.current.weatherCode < 3, threshold: 60 },
  ]
}

export default function HomeIntelligencePage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo } = useProjectGeo(project?.location)
  const { data: weather } = useWeather(geo?.lat, geo?.lng)

  const maintenance = useMemo(() => buildMaintenance(project), [project])
  const healthMetrics = useMemo(() => buildHealthMetrics(weather), [weather])

  if (isLoading || !project) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading…</Typography></Box>

  const currency = project.currency || '₹'
  const totalMaintenanceCost = maintenance.reduce((a, m) => a + m.cost, 0)

  const buildingLayers = [
    { layer: 'Structural', elements: [`${project.floors || 1} floors`, `${project.houseType} frame`, 'RCC columns & beams', 'Foundation type based on soil'] },
    { layer: 'Electrical', elements: [`${Math.ceil((project.builtArea || 100) / 25)} circuits est.`, 'MCB distribution board', 'Earthing & lightning protection'] },
    { layer: 'Plumbing', elements: [`${project.bathrooms || 1} bathrooms`, 'Hot & cold water supply', 'Drainage network'] },
    { layer: 'HVAC', elements: [`${Math.ceil((project.builtArea || 100) / 30)} AC units est.`, 'Ventilation ducts', 'Exhaust fans'] },
    { layer: 'Finishes', elements: ['Floor tiles/marble', 'Wall paint', 'False ceiling', 'Joinery & woodwork'] },
  ]

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Home Intelligence</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {project.floors || 1} floor(s) · {project.builtArea || project.plotArea || '–'} m²</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['🏗 Building Layers', '🏥 Home Health', '🔧 Maintenance', '📊 Overview'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2}>
            {buildingLayers.map((layer) => (
              <Grid item xs={12} md={6} key={layer.layer}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{layer.layer}</Typography>
                  {layer.elements.map((el) => (
                    <Box key={el} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="body2">{el}</Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!weather ? (
            <Alert severity="info">Add a project location to get live home health metrics based on current weather.</Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>Metrics derived from current outdoor conditions at {project.location}.</Alert>
              <Grid container spacing={2.5}>
                {healthMetrics.map((m) => (
                  <Grid item xs={12} sm={6} key={m.metric}>
                    <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.metric}</Typography>
                        <Chip label={m.safe ? 'Good' : 'Attention'} size="small" color={m.safe ? 'success' : 'warning'} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{Math.round(m.value)}<Typography component="span" variant="caption" sx={{ ml: 0.5 }}>{m.unit}</Typography></Typography>
                      <LinearProgress variant="determinate" value={Math.min(100, m.value)} color={m.safe ? 'success' : 'warning'} sx={{ height: 5, borderRadius: 3 }} />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Estimated annual maintenance: <strong>{currency} {totalMaintenanceCost.toLocaleString()}</strong></Alert>
          {maintenance.map((item, i) => (
            <Card key={i} sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.task}</Typography>
                  <Typography variant="caption" color="text.secondary">Every {item.interval}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={item.urgency} size="small" color={item.urgency === 'High' ? 'error' : item.urgency === 'Medium' ? 'warning' : 'success'} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{currency} {item.cost.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {tab === 3 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2.5}>
            {[['Project', project.projectName || project.title], ['Type', project.houseType], ['Floors', project.floors || '–'], ['Bedrooms', project.bedrooms || '–'], ['Bathrooms', project.bathrooms || '–'], ['Plot', project.plotArea ? `${project.plotArea} m²` : '–'], ['Built Area', project.builtArea ? `${project.builtArea} m²` : '–'], ['Budget', project.budget ? `${currency} ${project.budget.toLocaleString()}` : '–'], ['Annual Maintenance', `${currency} ${totalMaintenanceCost.toLocaleString()}`], ['Location', project.location || '–']].map(([k, v], i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">{k}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize', mt: 0.3 }}>{v}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}
