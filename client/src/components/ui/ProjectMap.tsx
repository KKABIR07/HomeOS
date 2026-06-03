// @ts-nocheck
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Box, Typography } from '@mui/material'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet default marker icon in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 15) }, [lat, lng, map])
  return null
}

interface ProjectMapProps {
  lat: number
  lng: number
  label?: string
  height?: number | string
  zoom?: number
}

export default function ProjectMap({ lat, lng, label = 'Project Site', height = 320, zoom = 15 }: ProjectMapProps) {
  return (
    <Box
      sx={{
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '& .leaflet-container': { height: '100%', width: '100%', borderRadius: '12px' },
      }}
    >
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
          </Popup>
        </Marker>
        <Recenter lat={lat} lng={lng} />
      </MapContainer>
    </Box>
  )
}
