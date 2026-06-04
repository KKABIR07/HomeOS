// @ts-nocheck
import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import { Box, Typography } from '@mui/material'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 17) }, [lat, lng, map])
  return null
}

/** Scale a polygon inward toward its centroid by scaleFactor (0–1). */
function scalePolygon(corners: [number, number][], scaleFactor: number): [number, number][] {
  if (corners.length < 3 || scaleFactor <= 0) return []
  const cLat = corners.reduce((s, c) => s + c[0], 0) / corners.length
  const cLng = corners.reduce((s, c) => s + c[1], 0) / corners.length
  return corners.map(([lat, lng]) => [
    cLat + (lat - cLat) * scaleFactor,
    cLng + (lng - cLng) * scaleFactor,
  ])
}

interface BoundaryShape {
  corners: [number, number][]
  area?: number
  perimeter?: number
}

interface ProjectMapProps {
  lat: number
  lng: number
  label?: string
  height?: number | string
  zoom?: number
  boundary?: BoundaryShape | null
  builtArea?: number | null
}

export default function ProjectMap({
  lat, lng,
  label = 'Project Site',
  height = 320,
  zoom = 17,
  boundary,
  builtArea,
}: ProjectMapProps) {
  const hasBoundary = (boundary?.corners?.length ?? 0) >= 3

  // Compute the built-area polygon by scaling the property boundary inward
  const builtPolygon = useMemo(() => {
    if (!hasBoundary || !builtArea || !boundary?.area || builtArea <= 0) return null
    const ratio = Math.min(builtArea / boundary.area, 0.95)
    if (ratio <= 0) return null
    const scale = Math.sqrt(ratio)
    const scaled = scalePolygon(boundary.corners, scale)
    return scaled.length >= 3 ? scaled : null
  }, [boundary, builtArea, hasBoundary])

  return (
    <Box sx={{
      height,
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1.5px solid',
      borderColor: hasBoundary ? 'primary.main' : 'divider',
      transition: 'border-color 0.3s',
      '& .leaflet-container': { height: '100%', width: '100%', borderRadius: '12px' },
    }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Property boundary — transparent blue */}
        {hasBoundary && (
          <Polygon
            positions={boundary.corners}
            pathOptions={{ color: '#6C63FF', fillColor: '#6C63FF', fillOpacity: 0.18, weight: 2.5 }}
          />
        )}

        {/* Built area footprint — transparent green */}
        {builtPolygon && (
          <Polygon
            positions={builtPolygon}
            pathOptions={{ color: '#2e7d32', fillColor: '#43a047', fillOpacity: 0.28, weight: 2, dashArray: '5 3' }}
          />
        )}

        {/* Centre pin */}
        <Marker position={[lat, lng]}>
          <Popup>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{label}</Typography>
            {hasBoundary && (
              <>
                <Typography variant="caption" display="block" sx={{ color: '#6C63FF' }}>
                  ▪ Plot: {boundary.area?.toFixed(0)} m²
                </Typography>
                {builtArea && (
                  <Typography variant="caption" display="block" sx={{ color: '#2e7d32' }}>
                    ▪ Built: {builtArea} m²
                  </Typography>
                )}
                <Typography variant="caption" display="block" color="text.secondary">
                  Perimeter: {boundary.perimeter?.toFixed(0)} m
                </Typography>
              </>
            )}
          </Popup>
        </Marker>

        <Recenter lat={lat} lng={lng} />
      </MapContainer>
    </Box>
  )
}
