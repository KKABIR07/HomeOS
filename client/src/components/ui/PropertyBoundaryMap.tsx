// @ts-nocheck
import { useState, useCallback, useEffect } from 'react'
import {
  MapContainer, TileLayer, Polygon, CircleMarker, Polyline, useMapEvents, useMap,
} from 'react-leaflet'
import L from 'leaflet'
import {
  Box, Button, ButtonGroup, Typography, TextField, Stack, IconButton,
  Paper, Chip, Divider, Alert, Table, TableBody, TableCell,
  TableHead, TableRow, Tooltip, Grid,
} from '@mui/material'
import {
  Add, Delete, MyLocation, Draw, EditLocationAlt, Clear, CheckCircle,
  SquareFoot, Timeline, Place, ContentCopy,
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

export type Corner = [number, number] // [lat, lng]

// ── Geometry helpers ─────────────────────────────────────────────────────────

function haversine(a: Corner, b: Corner): number {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const lat1 = a[0] * Math.PI / 180
  const lat2 = b[0] * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function calcArea(corners: Corner[]): number {
  if (corners.length < 3) return 0
  const centLat = corners.reduce((s, c) => s + c[0], 0) / corners.length
  const cosLat = Math.cos(centLat * Math.PI / 180)
  const toXY = (c: Corner): [number, number] => [
    (c[1] - corners[0][1]) * cosLat * 111320,
    (c[0] - corners[0][0]) * 110540,
  ]
  const pts = corners.map(toXY)
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]
  }
  return Math.abs(area) / 2
}

function calcPerimeter(corners: Corner[]): number {
  if (corners.length < 2) return 0
  let total = 0
  for (let i = 0; i < corners.length; i++) {
    total += haversine(corners[i], corners[(i + 1) % corners.length])
  }
  return total
}

function fmtArea(m2: number): string {
  const ft2 = m2 * 10.7639
  const acres = m2 / 4046.86
  const parts = [`${m2.toFixed(1)} m²`, `${ft2.toFixed(1)} ft²`]
  if (acres >= 0.01) parts.push(`${acres.toFixed(3)} acres`)
  return parts.join('  ·  ')
}

function fmtPerimeter(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(3)} km  (${m.toFixed(1)} m)` : `${m.toFixed(1)} m`
}

// ── Map sub-components ───────────────────────────────────────────────────────

function AutoCenter({ position }: { position: Corner | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 18, { duration: 1.2 })
  }, [position, map])
  return null
}

function DrawHandler({ drawing, onAdd }: { drawing: boolean; onAdd: (pt: Corner) => void }) {
  useMapEvents({
    click: (e) => {
      if (drawing) onAdd([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

// ── Result panel ─────────────────────────────────────────────────────────────

function ResultPanel({ corners }: { corners: Corner[] }) {
  if (corners.length < 3) return null
  const area = calcArea(corners)
  const perim = calcPerimeter(corners)
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, background: 'rgba(108,99,255,0.04)', border: '1px solid', borderColor: 'primary.main' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SquareFoot sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={700}>AREA</Typography>
          </Box>
          <Typography variant="body1" fontWeight={800} sx={{ color: 'primary.main' }}>
            {fmtArea(area)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Timeline sx={{ color: '#FF6584', fontSize: 18 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={700}>PERIMETER</Typography>
          </Box>
          <Typography variant="body1" fontWeight={800} sx={{ color: '#FF6584' }}>
            {fmtPerimeter(perim)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">
            {corners.length} corners  ·  Polygon closed
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  defaultCenter?: Corner
}

export default function PropertyBoundaryMap({ defaultCenter }: Props) {
  const [mode, setMode] = useState<'draw' | 'manual'>('draw')
  const [corners, setCorners] = useState<Corner[]>([])
  const [drawing, setDrawing] = useState(false)
  const [mapCenter, setMapCenter] = useState<Corner>(defaultCenter ?? [23.5, 88.5])
  const [geoLoading, setGeoLoading] = useState(false)

  // Manual mode: editable rows
  const [manualRows, setManualRows] = useState<{ lat: string; lng: string }[]>([
    { lat: '', lng: '' }, { lat: '', lng: '' }, { lat: '', lng: '' },
  ])

  const addCorner = useCallback((pt: Corner) => {
    setCorners((prev) => [...prev, pt])
  }, [])

  const removeCorner = (i: number) => setCorners((prev) => prev.filter((_, idx) => idx !== i))

  const clearAll = () => { setCorners([]); setDrawing(false) }

  const autoDetect = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt: Corner = [pos.coords.latitude, pos.coords.longitude]
        setMapCenter(pt)
        toast.success('Location detected — now click the map to mark corners')
        setGeoLoading(false)
        setDrawing(true)
      },
      () => { toast.error('Could not detect location'); setGeoLoading(false) },
      { timeout: 10000 }
    )
  }

  // Manual mode: parse rows into corners
  const applyManual = () => {
    const parsed: Corner[] = []
    for (const r of manualRows) {
      const lat = parseFloat(r.lat)
      const lng = parseFloat(r.lng)
      if (isNaN(lat) || isNaN(lng)) { toast.error('All rows must have valid lat/lng'); return }
      if (lat < -90 || lat > 90) { toast.error(`Latitude must be between -90 and 90`); return }
      if (lng < -180 || lng > 180) { toast.error(`Longitude must be between -180 and 180`); return }
      parsed.push([lat, lng])
    }
    if (parsed.length < 3) { toast.error('Need at least 3 corners'); return }
    setCorners(parsed)
    setMapCenter(parsed[0])
    toast.success(`Polygon with ${parsed.length} corners applied`)
  }

  const addManualRow = () => setManualRows((r) => [...r, { lat: '', lng: '' }])
  const removeManualRow = (i: number) => setManualRows((r) => r.filter((_, idx) => idx !== i))
  const updateManualRow = (i: number, field: 'lat' | 'lng', val: string) =>
    setManualRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))

  const copyCoords = () => {
    const text = corners.map((c, i) => `Corner ${i + 1}: ${c[0].toFixed(7)}, ${c[1].toFixed(7)}`).join('\n')
    navigator.clipboard.writeText(text).then(() => toast.success('Coordinates copied'))
  }

  return (
    <Box>
      {/* Mode toggle */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={mode === 'draw' ? 'contained' : 'outlined'}
            startIcon={<Draw />}
            onClick={() => { setMode('draw'); clearAll() }}
          >
            Draw on Map
          </Button>
          <Button
            variant={mode === 'manual' ? 'contained' : 'outlined'}
            startIcon={<EditLocationAlt />}
            onClick={() => { setMode('manual'); clearAll() }}
          >
            Manual Input
          </Button>
        </ButtonGroup>
        {corners.length > 0 && (
          <Chip
            label={`${corners.length} corners`}
            color="primary"
            size="small"
            onDelete={clearAll}
            deleteIcon={<Clear />}
          />
        )}
      </Stack>

      {/* ── Draw mode controls ── */}
      {mode === 'draw' && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
            <Button
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={autoDetect}
              disabled={geoLoading}
              size="small"
            >
              {geoLoading ? 'Detecting…' : 'Auto-detect Location'}
            </Button>
            <Button
              variant={drawing ? 'contained' : 'outlined'}
              color={drawing ? 'success' : 'primary'}
              startIcon={drawing ? <CheckCircle /> : <Draw />}
              onClick={() => setDrawing((d) => !d)}
              size="small"
            >
              {drawing ? 'Drawing… (click map)' : 'Start Drawing'}
            </Button>
            {corners.length > 0 && (
              <>
                <Button size="small" variant="outlined" color="error" startIcon={<Clear />} onClick={clearAll}>
                  Clear
                </Button>
                <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={copyCoords}>
                  Copy Coords
                </Button>
              </>
            )}
          </Stack>
          {drawing && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              Click the map to add polygon corners. Each click places a point. Click "Clear" to start over.
            </Alert>
          )}
        </Paper>
      )}

      {/* ── Manual mode inputs ── */}
      {mode === 'manual' && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Enter Corner Coordinates
          </Typography>
          <Table size="small" sx={{ mb: 1.5 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Longitude</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {manualRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Chip
                      label={i + 1}
                      size="small"
                      sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700, minWidth: 28 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="e.g. 23.5591"
                      value={row.lat}
                      onChange={(e) => updateManualRow(i, 'lat', e.target.value)}
                      inputProps={{ inputMode: 'decimal' }}
                      sx={{ width: 160 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="e.g. 88.5710"
                      value={row.lng}
                      onChange={(e) => updateManualRow(i, 'lng', e.target.value)}
                      inputProps={{ inputMode: 'decimal' }}
                      sx={{ width: 160 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={manualRows.length <= 3}
                      onClick={() => removeManualRow(i)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack direction="row" spacing={1.5}>
            <Button size="small" startIcon={<Add />} onClick={addManualRow} variant="outlined">
              Add Corner
            </Button>
            <Button size="small" variant="contained" startIcon={<Place />} onClick={applyManual}>
              Plot on Map
            </Button>
            {corners.length > 0 && (
              <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={copyCoords}>
                Copy
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* ── Map ── */}
      <Box
        sx={{
          height: 420,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: corners.length >= 3 ? 'primary.main' : 'divider',
          transition: 'border-color 0.3s',
          cursor: drawing ? 'crosshair' : 'grab',
          '& .leaflet-container': { height: '100%', width: '100%' },
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <DrawHandler drawing={drawing} onAdd={addCorner} />
          <AutoCenter position={mapCenter === (defaultCenter ?? [23.5, 88.5]) ? null : mapCenter} />

          {/* Polygon fill when closed */}
          {corners.length >= 3 && (
            <Polygon
              positions={corners}
              pathOptions={{ color: '#6C63FF', fillColor: '#6C63FF', fillOpacity: 0.18, weight: 2.5 }}
            />
          )}

          {/* Lines while drawing (open polyline) */}
          {corners.length >= 2 && corners.length < 3 && (
            <Polyline positions={corners} pathOptions={{ color: '#6C63FF', weight: 2, dashArray: '6 4' }} />
          )}

          {/* Corner markers */}
          {corners.map((pt, i) => (
            <CircleMarker
              key={i}
              center={pt}
              radius={7}
              pathOptions={{
                color: '#fff',
                fillColor: i === 0 ? '#FF6584' : '#6C63FF',
                fillOpacity: 1,
                weight: 2.5,
              }}
            >
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>

      {/* Corner index legend */}
      {corners.length > 0 && mode === 'draw' && (
        <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1.5 }}>
          {corners.map((c, i) => (
            <Chip
              key={i}
              label={`C${i + 1}  ${c[0].toFixed(5)}, ${c[1].toFixed(5)}`}
              size="small"
              onDelete={() => removeCorner(i)}
              sx={{ fontFamily: 'monospace', fontSize: '0.68rem', bgcolor: i === 0 ? 'rgba(255,101,132,0.12)' : 'rgba(108,99,255,0.1)' }}
            />
          ))}
        </Stack>
      )}

      {/* ── Coordinates table ── */}
      {corners.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Corner Coordinates</Typography>
          <Table size="small" sx={{ mb: 2, '& td, & th': { fontSize: '0.78rem' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Longitude</TableCell>
                {mode === 'draw' && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {corners.map((c, i) => (
                <TableRow key={i} hover>
                  <TableCell>
                    <Chip label={i + 1} size="small" color={i === 0 ? 'error' : 'primary'} sx={{ minWidth: 28 }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c[0].toFixed(7)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c[1].toFixed(7)}</TableCell>
                  {mode === 'draw' && (
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeCorner(i)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* ── Results ── */}
      <ResultPanel corners={corners} />

      {corners.length > 0 && corners.length < 3 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Add at least {3 - corners.length} more corner{3 - corners.length > 1 ? 's' : ''} to calculate area & perimeter.
        </Alert>
      )}
    </Box>
  )
}
