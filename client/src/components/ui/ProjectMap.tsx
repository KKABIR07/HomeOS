// @ts-nocheck
import { useEffect } from 'react'
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
  useEffect(() => { map.setView([lat, lng], 16) }, [lat, lng, map])
  return null
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
}

export default function ProjectMap({ lat, lng, label = 'Project Site', height = 320, zoom = 16, boundary }: ProjectMapProps) {
  const hasBoundary = boundary?.corners?.length >= 3

  return (
    <Box
      sx={{
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1.5px solid',
        borderColor: hasBoundary ? 'primary.main' : 'divider',
        transition: 'border-color 0.3s',
        '& .leaflet-container': { height: '100%', width: '100%', borderRadius: '12px' },
      }}
    >
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Property boundary polygon */}
        {hasBoundary && (
          <Polygon
            positions={boundary.corners}
            pathOptions={{
              color: '#6C63FF',
              fillColor: '#6C63FF',
              fillOpacity: 0.18,
              weight: 2.5,
            }}
          />
        )}

        {/* Centre marker */}
        <Marker position={[lat, lng]}>
          <Popup>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
            {hasBoundary && (
              <>
                <Typography variant="caption" display="block">Area: {boundary.area?.toFixed(1)} m²</Typography>
                <Typography variant="caption" display="block">Perimeter: {boundary.perimeter?.toFixed(1)} m</Typography>
              </>
            )}
          </Popup>
        </Marker>

        <Recenter lat={lat} lng={lng} />
      </MapContainer>
    </Box>
  )
}
