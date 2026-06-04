// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  Box, Button, Typography, TextField, Stack, IconButton,
  Paper, Chip, Divider, Alert, Table, TableBody, TableCell,
  TableHead, TableRow, Grid, Tooltip,
} from '@mui/material'
import {
  Undo, Delete, MyLocation, Draw, EditLocationAlt,
  Clear, SquareFoot, Timeline, Add, ContentCopy, CheckCircle,
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

export type Corner = [number, number]
export interface BoundaryData { corners: Corner[]; area: number; perimeter: number }

// ── Geometry ─────────────────────────────────────────────────────────────────

function haversine(a: Corner, b: Corner): number {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const x = sinLat * sinLat + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * sinLng * sinLng
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function calcArea(pts: Corner[]): number {
  if (pts.length < 3) return 0
  const cLat = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const cos = Math.cos(cLat * Math.PI / 180)
  const xy = pts.map((p): [number, number] => [
    (p[1] - pts[0][1]) * cos * 111320,
    (p[0] - pts[0][0]) * 110540,
  ])
  let a = 0
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length
    a += xy[i][0] * xy[j][1] - xy[j][0] * xy[i][1]
  }
  return Math.abs(a) / 2
}

function calcPerimeter(pts: Corner[]): number {
  if (pts.length < 2) return 0
  let t = 0
  for (let i = 0; i < pts.length; i++) t += haversine(pts[i], pts[(i + 1) % pts.length])
  return t
}

function fmtArea(m2: number) {
  if (m2 === 0) return '—'
  const ft2 = m2 * 10.7639
  const acres = m2 / 4046.86
  return `${m2.toFixed(1)} m²  ·  ${ft2.toFixed(0)} ft²${acres >= 0.01 ? `  ·  ${acres.toFixed(3)} ac` : ''}`
}

function fmtPerim(m: number) {
  if (m === 0) return '—'
  return m >= 1000 ? `${(m / 1000).toFixed(3)} km` : `${m.toFixed(1)} m`
}

// ── Map helpers ───────────────────────────────────────────────────────────────

function ClickHandler({ active, onAdd }: { active: boolean; onAdd: (p: Corner) => void }) {
  useMapEvents({ click: (e) => { if (active) onAdd([e.latlng.lat, e.latlng.lng]) } })
  return null
}

function FlyTo({ to }: { to: Corner | null }) {
  const map = useMap()
  const prev = useRef<Corner | null>(null)
  useEffect(() => {
    if (to && (prev.current?.[0] !== to[0] || prev.current?.[1] !== to[1])) {
      map.flyTo(to, 18, { duration: 1 })
      prev.current = to
    }
  }, [to, map])
  return null
}

// ── Result card ───────────────────────────────────────────────────────────────

function Results({ corners }: { corners: Corner[] }) {
  const area = calcArea(corners)
  const perim = calcPerimeter(corners)
  if (corners.length < 3) return null
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mt: 2, border: '1.5px solid', borderColor: 'primary.main', background: 'rgba(108,99,255,0.04)' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SquareFoot sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>AREA</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>{fmtArea(area)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Timeline sx={{ color: '#FF6584', fontSize: 20 }} />
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>PERIMETER</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FF6584', lineHeight: 1.2 }}>{fmtPerim(perim)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">{corners.length} corners · polygon closed · values auto-calculated</Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  defaultCenter?: Corner
  initialBoundary?: BoundaryData | null
  onChange?: (data: BoundaryData | null) => void
  readOnly?: boolean
}

export default function PropertyBoundaryMap({ defaultCenter, initialBoundary, onChange, readOnly = false }: Props) {
  const [mode, setMode] = useState<'draw' | 'manual'>('draw')
  const [corners, setCorners] = useState<Corner[]>(initialBoundary?.corners ?? [])
  const [flyTarget, setFlyTarget] = useState<Corner | null>(defaultCenter ?? null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [manualRows, setManualRows] = useState(
    initialBoundary?.corners?.length
      ? initialBoundary.corners.map((c) => ({ lat: String(c[0]), lng: String(c[1]) }))
      : [{ lat: '', lng: '' }, { lat: '', lng: '' }, { lat: '', lng: '' }]
  )

  // Notify parent whenever corners change
  useEffect(() => {
    if (!onChange) return
    if (corners.length >= 3) {
      onChange({ corners, area: calcArea(corners), perimeter: calcPerimeter(corners) })
    } else {
      onChange(null)
    }
  }, [corners])

  const addCorner = useCallback((p: Corner) => {
    if (readOnly) return
    setCorners((prev) => [...prev, p])
  }, [readOnly])

  const undo = () => setCorners((p) => p.slice(0, -1))
  const clearAll = () => setCorners([])

  const autoDetect = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt: Corner = [pos.coords.latitude, pos.coords.longitude]
        setFlyTarget(pt)
        setGeoLoading(false)
        toast.success('Map centred on your location — click to place corners')
      },
      () => { toast.error('Could not detect location'); setGeoLoading(false) },
      { timeout: 10000 }
    )
  }

  const applyManual = () => {
    const parsed: Corner[] = []
    for (const r of manualRows) {
      const lat = parseFloat(r.lat), lng = parseFloat(r.lng)
      if (isNaN(lat) || isNaN(lng)) { toast.error('All rows need valid lat/lng'); return }
      if (lat < -90 || lat > 90) { toast.error('Latitude must be −90 to 90'); return }
      if (lng < -180 || lng > 180) { toast.error('Longitude must be −180 to 180'); return }
      parsed.push([lat, lng])
    }
    if (parsed.length < 3) { toast.error('Need at least 3 corners'); return }
    setCorners(parsed)
    setFlyTarget(parsed[0])
    toast.success(`${parsed.length} corners plotted`)
  }

  const copyCoords = () => {
    const txt = corners.map((c, i) => `C${i + 1}: ${c[0].toFixed(7)}, ${c[1].toFixed(7)}`).join('\n')
    navigator.clipboard.writeText(txt).then(() => toast.success('Copied!'))
  }

  const mapCenter: Corner = defaultCenter ?? [23.5591, 88.5711]
  const drawActive = mode === 'draw' && !readOnly

  return (
    <Box>
      {!readOnly && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
          {/* Mode toggle */}
          <Stack direction="row" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            {[
              { v: 'draw', icon: <Draw sx={{ fontSize: 16 }} />, label: 'Draw on Map' },
              { v: 'manual', icon: <EditLocationAlt sx={{ fontSize: 16 }} />, label: 'Manual Input' },
            ].map(({ v, icon, label }) => (
              <Button
                key={v}
                size="small"
                variant={mode === v ? 'contained' : 'text'}
                startIcon={icon}
                onClick={() => { setMode(v as any); clearAll() }}
                sx={{ borderRadius: 0, px: 1.5, fontSize: '0.75rem', minWidth: 0 }}
              >
                {label}
              </Button>
            ))}
          </Stack>

          {mode === 'draw' && (
            <>
              <Button size="small" variant="outlined" startIcon={<MyLocation />}
                onClick={autoDetect} disabled={geoLoading}>
                {geoLoading ? 'Detecting…' : 'My Location'}
              </Button>
              {corners.length > 0 && (
                <>
                  <Button size="small" variant="outlined" startIcon={<Undo />} onClick={undo}>Undo</Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<Clear />} onClick={clearAll}>Clear</Button>
                  <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={copyCoords}>Copy</Button>
                </>
              )}
            </>
          )}

          {corners.length >= 3 && (
            <Chip icon={<CheckCircle />} label={`${corners.length} corners`} color="primary" size="small" />
          )}
        </Stack>
      )}

      {/* Manual input panel */}
      {mode === 'manual' && !readOnly && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Enter Corner Coordinates</Typography>
          <Table size="small" sx={{ mb: 1.5 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Longitude</TableCell>
                <TableCell width={40} />
              </TableRow>
            </TableHead>
            <TableBody>
              {manualRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Chip label={i + 1} size="small" color={i === 0 ? 'error' : 'primary'} sx={{ minWidth: 28, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" placeholder="e.g. 23.5591" value={row.lat}
                      onChange={(e) => setManualRows((r) => r.map((x, j) => j === i ? { ...x, lat: e.target.value } : x))}
                      inputProps={{ inputMode: 'decimal' }} sx={{ width: 150 }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" placeholder="e.g. 88.5711" value={row.lng}
                      onChange={(e) => setManualRows((r) => r.map((x, j) => j === i ? { ...x, lng: e.target.value } : x))}
                      inputProps={{ inputMode: 'decimal' }} sx={{ width: 150 }} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" disabled={manualRows.length <= 3}
                      onClick={() => setManualRows((r) => r.filter((_, j) => j !== i))}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<Add />}
              onClick={() => setManualRows((r) => [...r, { lat: '', lng: '' }])}>Add Corner</Button>
            <Button size="small" variant="contained" onClick={applyManual}>Plot on Map</Button>
          </Stack>
        </Paper>
      )}

      {/* Draw mode hint */}
      {drawActive && corners.length === 0 && (
        <Alert severity="info" icon={<Draw fontSize="small" />} sx={{ mb: 1.5, fontSize: '0.82rem' }}>
          <strong>Click anywhere on the map</strong> to place a corner. Place 3+ corners to see the polygon, area & perimeter.
        </Alert>
      )}
      {drawActive && corners.length > 0 && corners.length < 3 && (
        <Alert severity="info" sx={{ mb: 1.5, fontSize: '0.82rem' }}>
          {3 - corners.length} more corner{3 - corners.length > 1 ? 's' : ''} needed to close the polygon.
        </Alert>
      )}

      {/* Map */}
      <Box sx={{
        height: 420, borderRadius: '12px', overflow: 'hidden',
        border: '1.5px solid', borderColor: corners.length >= 3 ? 'primary.main' : 'divider',
        transition: 'border-color 0.3s',
        cursor: drawActive ? 'crosshair' : 'grab',
        '& .leaflet-container': { height: '100%', width: '100%' },
      }}>
        <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}
          scrollWheelZoom doubleClickZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler active={drawActive} onAdd={addCorner} />
          <FlyTo to={flyTarget} />

          {/* Closed polygon */}
          {corners.length >= 3 && (
            <Polygon positions={corners}
              pathOptions={{ color: '#6C63FF', fillColor: '#6C63FF', fillOpacity: 0.18, weight: 2.5 }} />
          )}

          {/* Open polyline while placing */}
          {corners.length >= 2 && corners.length < 3 && (
            <Polyline positions={corners}
              pathOptions={{ color: '#6C63FF', weight: 2.5, dashArray: '6 4' }} />
          )}

          {/* Corner markers */}
          {corners.map((pt, i) => (
            <CircleMarker key={i} center={pt} radius={8}
              pathOptions={{ color: '#fff', fillColor: i === 0 ? '#FF6584' : '#6C63FF', fillOpacity: 1, weight: 2.5 }}>
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>

      {/* Corner chips (draw mode) */}
      {corners.length > 0 && mode === 'draw' && !readOnly && (
        <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1.5 }}>
          {corners.map((c, i) => (
            <Chip key={i} size="small"
              label={`C${i + 1}  ${c[0].toFixed(5)}, ${c[1].toFixed(5)}`}
              onDelete={() => setCorners((p) => p.filter((_, j) => j !== i))}
              sx={{ fontFamily: 'monospace', fontSize: '0.67rem',
                bgcolor: i === 0 ? 'rgba(255,101,132,0.12)' : 'rgba(108,99,255,0.1)' }} />
          ))}
        </Stack>
      )}

      {/* Coordinates table (read-only view or manual mode) */}
      {corners.length > 0 && (mode === 'manual' || readOnly) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Longitude</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {corners.map((c, i) => (
                <TableRow key={i} hover>
                  <TableCell><Chip label={i + 1} size="small" color={i === 0 ? 'error' : 'primary'} /></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c[0].toFixed(7)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c[1].toFixed(7)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Results */}
      <Results corners={corners} />
    </Box>
  )
}
