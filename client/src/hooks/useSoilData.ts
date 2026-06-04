import { useState, useEffect } from 'react'
import axios from 'axios'

export interface SoilProperty {
  name: string
  label: string
  unit: string
  value: number | null
  depth: string
}

export interface SoilData {
  properties: SoilProperty[]
  soilType: string
  foundationSuitability: string
  drainageRating: string
  isFallback?: boolean
}

function classifySoil(clay: number, sand: number, silt: number): string {
  if (clay > 40) return 'Clay'
  if (sand > 70) return 'Sandy'
  if (silt > 50) return 'Silty'
  if (clay > 25 && sand > 25) return 'Clay Loam'
  if (sand > 50) return 'Sandy Loam'
  return 'Loam'
}

function getFoundationSuitability(clay: number, sand: number): string {
  if (clay > 40) return 'Poor – expansive clay, deep foundation required'
  if (sand > 70) return 'Moderate – loose sand, compaction needed'
  if (clay > 20 && clay < 40) return 'Good – mixed soil, standard foundation suitable'
  return 'Excellent – loam soil, ideal for construction'
}

function getDrainageRating(sand: number, clay: number): string {
  if (sand > 60) return 'Well-drained'
  if (clay > 40) return 'Poorly drained'
  return 'Moderately drained'
}

function buildSoilData(clay: number, sand: number, silt: number, ph: number, soc: number, nitrogen: number, bd: number, isFallback = false): SoilData {
  return {
    properties: [
      { name: 'clay', label: 'Clay Content', unit: '%', value: clay, depth: '0–5 cm' },
      { name: 'sand', label: 'Sand Content', unit: '%', value: sand, depth: '0–5 cm' },
      { name: 'silt', label: 'Silt Content', unit: '%', value: silt, depth: '0–5 cm' },
      { name: 'phh2o', label: 'Soil pH', unit: '', value: ph, depth: '0–5 cm' },
      { name: 'soc', label: 'Organic Carbon', unit: 'g/kg', value: soc, depth: '0–5 cm' },
      { name: 'nitrogen', label: 'Nitrogen', unit: 'cg/kg', value: nitrogen, depth: '0–5 cm' },
      { name: 'bdod', label: 'Bulk Density', unit: 'kg/dm³', value: bd, depth: '0–5 cm' },
    ],
    soilType: classifySoil(clay, sand, silt),
    foundationSuitability: getFoundationSuitability(clay, sand),
    drainageRating: getDrainageRating(sand, clay),
    isFallback,
  }
}

const FALLBACK_DATA = buildSoilData(25, 40, 35, 6.5, 10, 1.5, 1.3, true)

async function fetchWithRetry(lat: number, lng: number, signal: AbortSignal, attempts = 3): Promise<SoilData> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await axios.get('https://rest.isric.org/soilgrids/v2.0/properties/query', {
        params: {
          lon: lng,
          lat,
          property: ['clay', 'sand', 'silt', 'phh2o', 'soc', 'nitrogen', 'bdod'],
          depth: '0-5cm',
          value: 'mean',
        },
        signal,
        timeout: 15000,
      })

      const layers = res.data?.properties?.layers ?? []
      const extract = (name: string): number | null => {
        const layer = layers.find((l: any) => l.name === name)
        const raw = layer?.depths?.[0]?.values?.mean
        if (raw == null) return null
        if (['clay', 'sand', 'silt'].includes(name)) return raw / 10
        if (name === 'phh2o') return raw / 10
        if (name === 'bdod') return raw / 100
        return raw / 100
      }

      return buildSoilData(
        extract('clay') ?? 25,
        extract('sand') ?? 40,
        extract('silt') ?? 35,
        extract('phh2o') ?? 6.5,
        extract('soc') ?? 10,
        extract('nitrogen') ?? 1.5,
        extract('bdod') ?? 1.3,
      )
    } catch (err) {
      if (axios.isCancel(err)) throw err
      const status = axios.isAxiosError(err) ? err.response?.status : null
      // Only retry on 503/502/504; bail immediately on 4xx
      const shouldRetry = !status || status >= 500
      if (!shouldRetry || i === attempts - 1) throw err
      // Exponential back-off: 2s, 4s
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  throw new Error('All retries exhausted')
}

export function useSoilData(lat?: number, lng?: number) {
  const [data, setData] = useState<SoilData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lat == null || lng == null) return
    setLoading(true)
    setError(null)

    const controller = new AbortController()

    fetchWithRetry(lat, lng, controller.signal)
      .then((result) => setData(result))
      .catch((err) => {
        if (axios.isCancel(err)) return
        // Fall back to estimated defaults so the UI always shows something
        setData(FALLBACK_DATA)
        setError('Soil data service unavailable — showing estimated values')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [lat, lng])

  return { data, loading, error }
}
