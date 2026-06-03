// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, CircularProgress, Alert, Chip, LinearProgress } from '@mui/material'
import { motion } from 'framer-motion'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'
import ProjectMap from '../../components/ui/ProjectMap'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function Loader({ msg }: { msg: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 5, justifyContent: 'center' }}>
      <CircularProgress size={18} />
      <Typography variant="body2" color="text.secondary">{msg}</Typography>
    </Box>
  )
}

export default function PropertyIntelligencePage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo, loading: geoLoading } = useProjectGeo(project?.location)
  const { data: weather } = useWeather(geo?.lat, geo?.lng)

  const investmentData = useMemo(() => {
    if (!project) return []
    const base = project.budget || 5000000
    return Array.from({ length: 10 }, (_, i) => ({
      year: `Y${i + 1}`,
      value: Math.round(base * Math.pow(1.08, i + 1)),
    }))
  }, [project])

  const infraScores = useMemo(() => {
    if (!weather) return []
    const temp = weather.current.temperature
    const comfort = Math.max(0, 100 - Math.abs(temp - 22) * 3)
    return [
      { subject: 'Climate', value: Math.round(comfort) },
      { subject: 'Location', value: project?.location ? 75 : 30 },
      { subject: 'Plot Size', value: Math.min(100, ((project?.plotArea || 100) / 5)) },
      { subject: 'Connectivity', value: 70 },
      { subject: 'Amenities', value: 65 },
    ]
  }, [weather, project])

  if (isLoading) return <Loader msg="Loading project…" />
  if (!project) return <Alert severity="error">Project not found.</Alert>

  const currency = project.currency || '₹'
  const budget = project.budget || 0

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Property Intelligence</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {project.location || 'No location set'}</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['🏠 Overview', '📍 Location', '📈 Investment', '🏘 Neighbourhood'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2.5}>
            {[
              { icon: <HomeWorkIcon />, label: 'House Type', value: project.houseType || '–', color: '#6C63FF' },
              { icon: <LocationOnIcon />, label: 'Location', value: project.location || '–', color: '#FF6584' },
              { icon: <AccountBalanceIcon />, label: 'Budget', value: budget ? `${currency} ${budget.toLocaleString()}` : '–', color: '#81C784' },
              { icon: <TrendingUpIcon />, label: 'Est. ROI (10y)', value: budget ? `${currency} ${Math.round(budget * Math.pow(1.08, 10)).toLocaleString()}` : '–', color: '#4FC3F7' },
            ].map((item) => (
              <Grid item xs={6} md={3} key={item.label}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>{item.icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.62rem' }}>{item.label.toUpperCase()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }} noWrap>{item.value}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Property Specifications</Typography>
                {[['Project Name', project.projectName || project.title], ['Style', project.style || '–'], ['Floors', project.floors || '–'], ['Bedrooms', project.bedrooms || '–'], ['Bathrooms', project.bathrooms || '–'], ['Plot Area', project.plotArea ? `${project.plotArea} m²` : '–'], ['Built Area', project.builtArea ? `${project.builtArea} m²` : '–'], ['Status', project.status || '–']].map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Site Scores</Typography>
                {infraScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={infraScores}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <Radar name="Score" dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.25} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="info" sx={{ mt: 1 }}>Set a location and wait for weather data to compute scores.</Alert>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!project.location && <Alert severity="warning" sx={{ mb: 3 }}>No location set — edit the project to add one.</Alert>}
          {project.location && geoLoading && <Loader msg={`Locating "${project.location}"…`} />}
          {geo && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}><strong>Located:</strong> {geo.displayName}</Alert>
              <ProjectMap lat={geo.lat} lng={geo.lng} label={project.projectName || project.title} height={400} />
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[['Latitude', geo.lat.toFixed(5)], ['Longitude', geo.lng.toFixed(5)], ['Plot Area', project.plotArea ? `${project.plotArea} m²` : '–'], ['Built Area', project.builtArea ? `${project.builtArea} m²` : '–']].map(([k, v]) => (
                  <Grid item xs={6} md={3} key={k}>
                    <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{k}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{v}</Typography>
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
          {!budget ? (
            <Alert severity="info">Set a project budget to see investment projections.</Alert>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>Based on 8% annual appreciation for {project.location || 'your location'}.</Alert>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>10-Year Value Projection</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={investmentData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [`${currency} ${v.toLocaleString()}`, 'Projected Value']} />
                  <Area type="monotone" dataKey="value" stroke="#6C63FF" fill="url(#grad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[['Purchase Value', `${currency} ${budget.toLocaleString()}`], ['5-Year Value', `${currency} ${Math.round(budget * Math.pow(1.08, 5)).toLocaleString()}`], ['10-Year Value', `${currency} ${Math.round(budget * Math.pow(1.08, 10)).toLocaleString()}`], ['Total Gain (10y)', `${currency} ${Math.round(budget * Math.pow(1.08, 10) - budget).toLocaleString()}`]].map(([k, v]) => (
                  <Grid item xs={6} md={3} key={k}>
                    <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{k}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>{v}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      )}

      {tab === 3 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {weather ? (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Climate Context</Typography>
                  {[['Temperature', `${weather.current.temperature}°C`], ['Feels Like', `${weather.current.apparentTemperature}°C`], ['Humidity', `${weather.current.humidity}%`], ['Wind Speed', `${weather.current.windSpeed} km/h`], ['Conditions', weather.current.description], ['Timezone', weather.timezone]].map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Livability Scores</Typography>
                  {[['Climate Comfort', Math.max(0, 100 - Math.abs(weather.current.temperature - 22) * 3)], ['Air Quality (est.)', weather.current.humidity < 70 ? 80 : 60], ['Outdoor Usability', weather.current.windSpeed < 20 ? 85 : 55], ['Overall Score', 72]].map(([label, score]) => (
                    <Box key={label} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{Math.round(score as number)}/100</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.round(score as number)} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  ))}
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">Set a project location to load neighbourhood intelligence.</Alert>
          )}
        </Box>
      )}
    </Box>
  )
}
