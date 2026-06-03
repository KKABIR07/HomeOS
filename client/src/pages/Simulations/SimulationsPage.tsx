// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function Loader({ msg }: { msg: string }) {
  return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 5, justifyContent: 'center' }}><CircularProgress size={18} /><Typography variant="body2" color="text.secondary">{msg}</Typography></Box>
}

export default function SimulationsPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo } = useProjectGeo(project?.location)
  const { data: weather, loading: wLoading } = useWeather(geo?.lat, geo?.lng)

  const lat = geo?.lat ?? 23.8
  const isNorthern = lat > 0
  const isTropical = Math.abs(lat) < 23.5

  const sunlightData = useMemo(() => {
    const floors = project?.floors || 1
    return [
      { room: 'South Face', score: isTropical ? 75 : 95, note: 'Good all-year' },
      { room: 'North Face', score: isTropical ? 60 : 25, note: isTropical ? 'Diffused light' : 'Low sun' },
      { room: 'East Face', score: 80, note: 'Morning sun' },
      { room: 'West Face', score: 70, note: 'Afternoon sun' },
      { room: 'Rooftop', score: 98, note: `${floors} floors — solar potential` },
    ]
  }, [project, isTropical])

  const energyData = useMemo(() => {
    const area = project?.builtArea || 100
    const temp = weather?.current.temperature ?? 28
    const coolingLoad = Math.max(0, (temp - 24) * area * 0.08)
    const heatingLoad = Math.max(0, (18 - temp) * area * 0.06)
    const base = area * 0.12
    return [
      { name: 'Lighting', monthly: Math.round(base * 30) },
      { name: 'Cooling/AC', monthly: Math.round(coolingLoad * 30) },
      { name: 'Heating', monthly: Math.round(heatingLoad * 30) },
      { name: 'Appliances', monthly: Math.round(base * 20) },
      { name: 'Hot Water', monthly: Math.round(base * 10) },
    ]
  }, [project, weather])

  const windData = useMemo(() => [
    { direction: 'N', ventilation: isTropical ? 85 : 60 },
    { direction: 'NE', ventilation: 80 },
    { direction: 'E', ventilation: 75 },
    { direction: 'SE', ventilation: 70 },
    { direction: 'S', ventilation: isTropical ? 65 : 85 },
    { direction: 'SW', ventilation: 72 },
    { direction: 'W', ventilation: 68 },
    { direction: 'NW', ventilation: 78 },
  ], [isTropical])

  const floodData = useMemo(() => {
    if (!weather) return []
    return weather.daily.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
      rainfall: d.precipitation,
      runoff: Math.round(d.precipitation * 0.7),
      depth: d.precipitation > 30 ? Math.round((d.precipitation - 30) * 0.1 * 10) / 10 : 0,
    }))
  }, [weather])

  if (isLoading) return <Loader msg="Loading project…" />
  if (!project) return <Alert severity="error">Project not found.</Alert>

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Simulations</Typography>
        <Typography variant="body2" color="text.secondary">
          {project.projectName || project.title} · {project.location || 'No location'} · {project.builtArea || '–'} m²
        </Typography>
      </Box>

      {!project.location && <Alert severity="warning" sx={{ mb: 3 }}>Add a project location for weather-accurate simulations.</Alert>}
      {project.location && wLoading && <Loader msg="Loading weather for simulations…" />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['☀️ Sunlight', '💨 Wind Flow', '🌊 Flood Risk', '⚡ Energy'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Sunlight scores based on latitude {lat.toFixed(1)}° ({isTropical ? 'tropical' : isNorthern ? 'northern hemisphere' : 'southern hemisphere'}).</Alert>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Sunlight Score by Orientation</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={sunlightData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="room" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#FFB74D" radius={[4, 4, 0, 0]} name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Orientation Notes</Typography>
                {sunlightData.map((d) => (
                  <Box key={d.room} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">{d.room}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">{d.note}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: d.score > 70 ? 'success.main' : 'warning.main' }}>{d.score}/100</Typography>
                    </Box>
                  </Box>
                ))}
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Natural ventilation potential by wind direction for {project.location || 'your location'}.</Alert>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Ventilation Radar</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={windData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="direction" tick={{ fontSize: 11 }} />
                    <Radar dataKey="ventilation" stroke="#4FC3F7" fill="#4FC3F7" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {weather && (
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Current Wind Conditions</Typography>
                  {[['Wind Speed', `${weather.current.windSpeed} km/h`], ['Temperature', `${weather.current.temperature}°C`], ['Humidity', `${weather.current.humidity}%`], ['Recommendation', weather.current.windSpeed < 15 ? 'Open windows for cross-ventilation' : 'Wind breakers recommended on exposed sides']].map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 200, textAlign: 'right' }}>{v}</Typography>
                    </Box>
                  ))}
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!weather ? (
            <Alert severity="info">Add a project location to simulate flood risk from live rainfall data.</Alert>
          ) : (
            <>
              <Alert severity={floodData.some((d) => d.depth > 0) ? 'warning' : 'success'} sx={{ mb: 3 }}>
                {floodData.some((d) => d.depth > 0) ? 'Rainfall events this week may cause localised flooding.' : 'No significant flood risk this week based on current forecast.'}
              </Alert>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>7-Day Rainfall & Runoff Simulation</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={floodData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#4FC3F7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="runoff" name="Runoff (mm)" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depth" name="Flood Depth (cm)" fill="#FF6584" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Box>
      )}

      {tab === 3 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>
            Energy estimates for {project.builtArea || 100} m² at {weather ? `${weather.current.temperature}°C` : 'unknown temperature'}.
          </Alert>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Monthly Energy Use (kWh)</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="monthly" fill="#6C63FF" radius={[4, 4, 0, 0]} name="kWh/month" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Energy Summary</Typography>
                {energyData.map((d) => (
                  <Box key={d.name} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">{d.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.monthly} kWh/mo</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{energyData.reduce((a, d) => a + d.monthly, 0)} kWh/mo</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
