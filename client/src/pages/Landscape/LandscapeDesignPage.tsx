// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, Chip, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'
import { useSoilData } from '../../hooks/useSoilData'
import ProjectMap from '../../components/ui/ProjectMap'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function Loader({ msg }: { msg: string }) {
  return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 5, justifyContent: 'center' }}><CircularProgress size={18} /><Typography variant="body2" color="text.secondary">{msg}</Typography></Box>
}

function getPlantSuggestions(weather: any, soil: any) {
  if (!weather) return []
  const temp = weather.current.temperature
  const humid = weather.current.humidity
  const isMoist = soil?.drainageRating === 'Poorly drained'

  const plants = []
  if (temp > 25 && humid > 60) plants.push({ name: 'Coconut Palm', type: 'Tree', note: 'Thrives in hot, humid climate' })
  if (temp > 20) plants.push({ name: 'Hibiscus', type: 'Shrub', note: 'Colourful, low maintenance' })
  if (temp > 18) plants.push({ name: 'Bougainvillea', type: 'Climber', note: 'Drought-tolerant, vibrant colour' })
  if (humid > 55) plants.push({ name: 'Ferns', type: 'Ground Cover', note: 'Loves humidity and shade' })
  if (!isMoist) plants.push({ name: 'Aloe Vera', type: 'Succulent', note: 'Well-drained soil preferred' })
  if (temp > 22) plants.push({ name: 'Neem Tree', type: 'Tree', note: 'Natural pest repellent, shade provider' })
  if (temp < 28) plants.push({ name: 'Roses', type: 'Shrub', note: 'Moderate temp preferred' })
  plants.push({ name: 'Grass (Bermuda)', type: 'Lawn', note: 'Universal lawn option' })

  return plants.slice(0, 8)
}

export default function LandscapeDesignPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo, loading: geoLoading } = useProjectGeo(project?.location)
  const { data: weather, loading: wLoading } = useWeather(geo?.lat, geo?.lng)
  const { data: soil, loading: sLoading } = useSoilData(geo?.lat, geo?.lng)

  const plants = useMemo(() => getPlantSuggestions(weather, soil), [weather, soil])

  const rainHarvestData = useMemo(() => {
    if (!project?.plotArea || !weather) return null
    const roof = project.builtArea || project.plotArea * 0.6
    const annualRain = weather.daily.reduce((a: number, d: any) => a + d.precipitation, 0) * 52
    const potential = Math.round(roof * annualRain * 0.8 / 1000)
    return { roof: Math.round(roof), annualRain: Math.round(annualRain), potential }
  }, [project, weather])

  if (isLoading) return <Loader msg="Loading project…" />
  if (!project) return <Alert severity="error">Project not found.</Alert>

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Landscape & Planning</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {project.location || 'No location'} · Plot: {project.plotArea || '–'} m²</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['🗺 Site Map', '🌿 Plant Guide', '🌱 Soil Context', '💧 Water Mgmt'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!project.location && <Alert severity="info">Add a location to see the site landscape map.</Alert>}
          {project.location && geoLoading && <Loader msg={`Locating "${project.location}"…`} />}
          {geo && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}><strong>Site:</strong> {geo.displayName}</Alert>
              <ProjectMap lat={geo.lat} lng={geo.lng} label={project.projectName || project.title} height={380} zoom={16} />
              {weather && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {[['Temperature', `${weather.current.temperature}°C`], ['Humidity', `${weather.current.humidity}%`], ['Wind', `${weather.current.windSpeed} km/h`], ['Conditions', weather.current.description]].map(([k, v]) => (
                    <Grid item xs={6} md={3} key={k}>
                      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!project.location && <Alert severity="info">Add a project location to get climate-matched plant suggestions.</Alert>}
          {project.location && (wLoading || geoLoading) && <Loader msg="Loading climate data for plant suggestions…" />}
          {weather && plants.length > 0 ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>Plants recommended for {weather.current.temperature}°C, {weather.current.humidity}% humidity at {project.location}.</Alert>
              <Grid container spacing={2}>
                {plants.map((plant, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{plant.name}</Typography>
                        <Chip label={plant.type} size="small" sx={{ fontSize: '0.65rem' }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{plant.note}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : weather ? (
            <Alert severity="warning">No plant suggestions available.</Alert>
          ) : null}
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!project.location && <Alert severity="info">Add a location to load soil data for landscaping.</Alert>}
          {project.location && (sLoading || geoLoading) && <Loader msg="Fetching SoilGrids data…" />}
          {soil && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SOIL TYPE</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{soil.soilType}</Typography>
                  <Box sx={{ mt: 2 }}>
                    {[['Drainage', soil.drainageRating], ['Foundation', soil.foundationSuitability.split(' – ')[0]]].map(([k, v]) => (
                      <Box key={k} sx={{ py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Soil Texture</Typography>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart layout="vertical" data={soil.properties.filter((p) => ['clay', 'sand', 'silt'].includes(p.name))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v: number) => `${v?.toFixed(1)}%`} />
                      <Bar dataKey="value" fill="#81C784" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          )}
          {!soil && !sLoading && project.location && <Alert severity="warning">Soil data unavailable for this location.</Alert>}
        </Box>
      )}

      {tab === 3 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {rainHarvestData ? (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Rainwater Harvesting Potential</Typography>
                  {[['Roof/Collection Area', `${rainHarvestData.roof} m²`], ['Est. Annual Rainfall', `${rainHarvestData.annualRain} mm`], ['Harvest Efficiency', '80%'], ['Annual Potential', `${rainHarvestData.potential.toLocaleString()} litres`], ['Daily Average', `${Math.round(rainHarvestData.potential / 365)} litres/day`]].map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>7-Day Rainfall (Live)</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weather?.daily?.map((d: any) => ({ date: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }), mm: d.precipitation })) ?? []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="mm" name="mm" fill="#4FC3F7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">Set a project plot area and location to calculate rainwater harvesting potential.</Alert>
          )}
        </Box>
      )}
    </Box>
  )
}
