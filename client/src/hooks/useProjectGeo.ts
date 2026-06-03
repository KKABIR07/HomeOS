import { useState, useEffect } from 'react'
import axios from 'axios'

export interface GeoLocation {
  lat: number
  lng: number
  displayName: string
}

export function useProjectGeo(locationQuery?: string) {
  const [geo, setGeo] = useState<GeoLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!locationQuery?.trim()) return
    setLoading(true)
    setError(null)
    setGeo(null)

    const controller = new AbortController()
    axios
      .get('https://nominatim.openstreetmap.org/search', {
        params: { q: locationQuery, format: 'json', limit: 1, addressdetails: 1 },
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      })
      .then((res) => {
        if (res.data?.length > 0) {
          const { lat, lon, display_name } = res.data[0]
          setGeo({ lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name })
        } else {
          setError('Location not found')
        }
      })
      .catch((err) => { if (!axios.isCancel(err)) setError('Geocoding failed') })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [locationQuery])

  return { geo, loading, error }
}
