// @ts-nocheck
import { useState } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, CircularProgress, Alert, Divider, Button, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import AirIcon from '@mui/icons-material/Air'
import GrainIcon from '@mui/icons-material/Grain'
import SaveIcon from '@mui/icons-material/Save'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'
import { useSoilData } from '../../hooks/useSoilData'
import ProjectMap from '../../components/ui/ProjectMap'
import PropertyBoundaryMap, { type BoundaryData } from '../../components/ui/PropertyBoundaryMap'
import api from '../../services/api'

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
  const [pendingBoundary, setPendingBoundary] = useState<BoundaryData | null>(null)
  const queryClient = useQueryClient()

  const { data: project, isLoading } = useProject(id ?? '')
  const { geo, loading: geoLoading, error: geoError } = useProjectGeo(project?.location)
  const { data: weather, loading: wLoading } = useWeather(geo?.lat, geo?.lng)
  const { data: soil, loading: sLoading, error: soilError } = useSoilData(geo?.lat, geo?.lng)

  const saveBoundaryMut = useMutation({
    mutationFn: (boundary: BoundaryData) => api.put(`/projects/${id}`, { boundary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setPendingBoundary(null)
      toast.success('Boundary saved to project')
    },
    onError: () => toast.error('Failed to save boundary'),
  })

  if (isLoading) return <Loader msg="Loading project…" />
  if (!project) return <Alert severity="error">Project not found.</Alert>
  const loc = project.location

  // Saved boundary from DB
  const savedBoundary = project.boundary?.corners?.length >= 3 ? project.boundary : null
  // Which boundary to display — prefer pending (unsaved edits) over saved
  const displayBoundary = pendingBoundary ?? savedBoundary

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Site Intelligence</Typography>
          <Typography variant="body2" color="text.secondary">
            {project.projectName || project.title} · {loc || 'No location set'}
          </Typography>
        </Box>
        {savedBoundary && (
          <Chip
            icon={<SquareFootIcon />}
            label={`${savedBoundary.area?.toFixed(0)} m²  ·  ${savedBoundary.perimeter?.toFixed(0)} m perimeter`}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {!loc && <Alert severity="warning" sx={{ mb: 3 }}>No location set. Edit the project to add a location and unlock geo-based analysis.</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['📍 Site Map', '🌤 Weather', '🌱 Soil', '📐 Boundary', '📊 Summary'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {/* ── Tab 0: Site Map ── */}
      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!loc && <Alert severity="info">Add a location to your project to see the site map.</Alert>}
          {loc && geoLoading && <Loader msg={`Locating "${loc}"…`} />}
          {loc && geoError && <Alert severity="error">{geoError}</Alert>}
          {loc && geo && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Located:</strong> {geo.displayName}
                {savedBoundary && <span style={{ marginLeft: 12 }}>· <strong>Boundary mapped</strong> — {savedBoundary.corners?.length} corners</span>}
              </Alert>

              {/* ProjectMap now receives the saved boundary and draws the polygon */}
              <ProjectMap
                lat={geo.lat}
                lng={geo.lng}
                label={project.projectName || project.title}
                height={440}
                boundary={savedBoundary}
              />

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[
                  ['Latitude', geo.lat.toFixed(5)],
                  ['Longitude', geo.lng.toFixed(5)],
                  ['Mapped Area', savedBoundary ? `${savedBoundary.area?.toFixed(1)} m²` : project.plotArea ? `${project.plotArea} m²` : '–'],
                  ['Perimeter', savedBoundary ? `${savedBoundary.perimeter?.toFixed(1)} m` : '–'],
                ].map(([k, v]) => (
                  <Grid item xs={6} md={3} key={k}>
                    <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{k}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{v}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {!savedBoundary && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No property boundary marked yet. Go to the <strong>📐 Boundary</strong> tab to draw your property outline.
                </Alert>
              )}
            </>
          )}
        </Box>
      )}

      {/* ── Tab 1: Weather ── */}
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

      {/* ── Tab 2: Soil ── */}
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

      {/* ── Tab 3: Boundary ── */}
      {tab === 3 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Property Boundary</Typography>
              <Typography variant="body2" color="text.secondary">
                {savedBoundary
                  ? 'Your saved boundary is shown. Draw a new one to update it, then click Save.'
                  : 'Click on the map to mark your property corners. Save when done.'}
              </Typography>
            </Box>
            {pendingBoundary && (
              <Button
                variant="contained"
                startIcon={saveBoundaryMut.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={() => saveBoundaryMut.mutate(pendingBoundary)}
                disabled={saveBoundaryMut.isPending}
                sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', whiteSpace: 'nowrap' }}
              >
                {saveBoundaryMut.isPending ? 'Saving…' : 'Save Boundary'}
              </Button>
            )}
          </Box>

          {savedBoundary && !pendingBoundary && (
            <Alert severity="success" icon={<SquareFootIcon />} sx={{ mb: 2 }}>
              <strong>Saved boundary:</strong> {savedBoundary.corners?.length} corners · {savedBoundary.area?.toFixed(1)} m² · {savedBoundary.perimeter?.toFixed(1)} m perimeter
            </Alert>
          )}

          {/* Load saved boundary into the map — user can redraw to update */}
          <PropertyBoundaryMap
            defaultCenter={geo ? [geo.lat, geo.lng] : undefined}
            initialBoundary={savedBoundary}
            onChange={(data) => {
              // Only mark as pending if different from saved
              if (!data) { setPendingBoundary(null); return }
              const isSame = savedBoundary
                && Math.abs(data.area - savedBoundary.area) < 0.1
                && data.corners.length === savedBoundary.corners?.length
              setPendingBoundary(isSame ? null : data)
            }}
          />
        </Box>
      )}

      {/* ── Tab 4: Summary ── */}
      {tab === 4 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Project Details</Typography>
                {[
                  ['Name', project.projectName || project.title],
                  ['Type', project.houseType],
                  ['Style', project.style],
                  ['Status', project.status],
                  ['Location', loc || '–'],
                  ['Plot (spec)', project.plotArea ? `${project.plotArea} m²` : project.plotWidth ? `${project.plotWidth}×${project.plotLength} ft` : '–'],
                  ['Mapped Area', savedBoundary ? `${savedBoundary.area?.toFixed(1)} m²` : '–'],
                  ['Perimeter', savedBoundary ? `${savedBoundary.perimeter?.toFixed(1)} m` : '–'],
                  ['Corners', savedBoundary ? `${savedBoundary.corners?.length} points` : '–'],
                  ['Floors', project.floors || '–'],
                  ['Bedrooms', project.bedrooms || '–'],
                  ['Budget', project.budget ? `₹ ${project.budget?.toLocaleString()}` : '–'],
                ].map(([k, v]) => (
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
                {[
                  ['Coordinates', geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Fetching…'],
                  ['Soil Type', soil?.soilType ?? 'Fetching…'],
                  ['Foundation', soil?.foundationSuitability ?? 'Fetching…'],
                  ['Drainage', soil?.drainageRating ?? 'Fetching…'],
                  ['Temperature', weather ? `${weather.current.temperature}°C` : 'Fetching…'],
                  ['Humidity', weather ? `${weather.current.humidity}%` : 'Fetching…'],
                  ['Wind', weather ? `${weather.current.windSpeed} km/h` : 'Fetching…'],
                  ['Conditions', weather?.current.description ?? 'Fetching…'],
                ].map(([k, v]) => (
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
