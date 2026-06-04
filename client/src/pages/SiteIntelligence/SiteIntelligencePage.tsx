// @ts-nocheck
import { useState } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, CircularProgress, Alert, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import AirIcon from '@mui/icons-material/Air'
import GrainIcon from '@mui/icons-material/Grain'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'
import { useSoilData } from '../../hooks/useSoilData'
import ProjectMap from '../../components/ui/ProjectMap'
import PropertyBoundaryMap from '../../components/ui/PropertyBoundaryMap'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function StatCard({ icon, label, value, unit, color = '#6C63FF' }: any) {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.62rem' }}>{label.toUpperCase()}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
            {value ?? '–'}<Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>{unit}</Typography>
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

function Loader({ msg }: { msg: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 5, justifyContent: 'center' }}>
      <CircularProgress size={18} />
      <Typography variant="body2" color="text.secondary">{msg}</Typography>
    </Box>
  )
}

export default function SiteIntelligencePage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo, loading: geoLoading, error: geoError } = useProjectGeo(project?.location)
  const { data: weather, loading: wLoading } = useWeather(geo?.lat, geo?.lng)
  const { data: soil, loading: sLoading, error: soilError } = useSoilData(geo?.lat, geo?.lng)

  if (isLoading) return <Loader msg="Loading project…" />
  if (!project) return <Alert severity="error">Project not found.</Alert>
  const loc = project.location

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Site Intelligence</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {loc || 'No location set'}</Typography>
      </Box>
      {!loc && <Alert severity="warning" sx={{ mb: 3 }}>No location set. Edit the project to add a location and unlock geo-based analysis.</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['📍 Site Map', '🌤 Weather', '🌱 Soil', '📐 Boundary', '📊 Summary'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!loc && <Alert severity="info">Add a location to your project to see the site map.</Alert>}
          {loc && geoLoading && <Loader msg={`Locating "${loc}"…`} />}
          {loc && geoError && <Alert severity="error">{geoError}</Alert>}
          {loc && geo && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}><strong>Located:</strong> {geo.displayName}</Alert>
              <ProjectMap lat={geo.lat} lng={geo.lng} label={project.projectName || project.title} height={420} />
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[['Latitude', geo.lat.toFixed(5)], ['Longitude', geo.lng.toFixed(5)], ['Plot Area', project.plotArea ? `${project.plotArea} m²` : '–'], ['Floors', project.floors || '–']].map(([k, v]) => (
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

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!loc && <Alert severity="info">Add a project location to load live weather.</Alert>}
          {loc && (wLoading || geoLoading) && <Loader msg="Fetching live weather from Open-Meteo…" />}
          {loc && !wLoading && !geoLoading && !weather && <Alert severity="warning">Weather unavailable — check project location.</Alert>}
          {weather && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}><StatCard icon={<ThermostatIcon />} label="Temperature" value={`${weather.current.temperature}°`} unit="C" color="#FF6584" /></Grid>
                <Grid item xs={6} md={3}><StatCard icon={<WaterDropIcon />} label="Humidity" value={weather.current.humidity} unit="%" color="#4FC3F7" /></Grid>
                <Grid item xs={6} md={3}><StatCard icon={<AirIcon />} label="Wind" value={weather.current.windSpeed} unit="km/h" color="#81C784" /></Grid>
                <Grid item xs={6} md={3}><StatCard icon={<GrainIcon />} label="Rain" value={weather.current.precipitation} unit="mm" color="#6C63FF" /></Grid>
              </Grid>
              <Alert severity="info" sx={{ mb: 3 }}><strong>{weather.current.description}</strong> · Feels like {weather.current.apparentTemperature}°C · {weather.timezone}</Alert>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>7-Day Forecast</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weather.daily}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short' })} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v?.toFixed(1)} />
                  <Legend />
                  <Bar dataKey="maxTemp" name="Max °C" fill="#FF6584" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minTemp" name="Min °C" fill="#4FC3F7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="precipitation" name="Rain mm" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!loc && <Alert severity="info">Add a project location to load soil data.</Alert>}
          {loc && (sLoading || geoLoading) && <Loader msg="Fetching SoilGrids data…" />}
          {loc && !sLoading && !geoLoading && soilError && (
            <Alert severity="warning" sx={{ mb: 2 }}>SoilGrids service is temporarily unavailable — showing estimated values.</Alert>
          )}
          {soil && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SOIL TYPE</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{soil.soilType}</Typography>
                    <Divider sx={{ my: 1.5, opacity: 0.2 }} />
                    <Typography variant="caption" color="text.secondary">FOUNDATION SUITABILITY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{soil.foundationSuitability}</Typography>
                    <Divider sx={{ my: 1.5, opacity: 0.2 }} />
                    <Typography variant="caption" color="text.secondary">DRAINAGE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{soil.drainageRating}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Soil Texture (0–5 cm)</Typography>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart layout="vertical" data={soil.properties.filter((p) => ['clay', 'sand', 'silt'].includes(p.name))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip formatter={(v: number) => `${v?.toFixed(1)}%`} />
                        <Bar dataKey="value" fill="#6C63FF" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                {soil.properties.filter((p) => !['clay', 'sand', 'silt'].includes(p.name)).map((prop) => (
                  <Grid item xs={6} md={3} key={prop.name}>
                    <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">{prop.label.toUpperCase()}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{prop.value?.toFixed(2) ?? '–'}<Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>{prop.unit}</Typography></Typography>
                      <Typography variant="caption" color="text.disabled">{prop.depth}</Typography>
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
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Property Boundary Mapping</Typography>
            <Typography variant="body2" color="text.secondary">
              Draw your property outline on the map or enter corner coordinates manually to calculate area and perimeter.
            </Typography>
          </Box>
          <PropertyBoundaryMap defaultCenter={geo ? [geo.lat, geo.lng] : undefined} />
        </Box>
      )}

      {tab === 4 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Project Details</Typography>
                {[['Name', project.projectName || project.title], ['Type', project.houseType], ['Style', project.style], ['Status', project.status], ['Location', loc || '–'], ['Plot', project.plotArea ? `${project.plotArea} m²` : '–'], ['Built Area', project.builtArea ? `${project.builtArea} m²` : '–'], ['Floors', project.floors || '–'], ['Bedrooms', project.bedrooms || '–'], ['Budget', project.budget ? `${project.currency || '₹'} ${project.budget?.toLocaleString()}` : '–']].map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Live Site Conditions</Typography>
                {[['Coordinates', geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Fetching…'], ['Soil Type', soil?.soilType ?? 'Fetching…'], ['Foundation', soil?.foundationSuitability ?? 'Fetching…'], ['Drainage', soil?.drainageRating ?? 'Fetching…'], ['Temperature', weather ? `${weather.current.temperature}°C` : 'Fetching…'], ['Humidity', weather ? `${weather.current.humidity}%` : 'Fetching…'], ['Wind', weather ? `${weather.current.windSpeed} km/h` : 'Fetching…'], ['Conditions', weather?.current.description ?? 'Fetching…']].map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
