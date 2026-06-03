import { useState, useEffect } from 'react'
import axios from 'axios'

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  weatherCode: number
  description: string
}

export interface DailyWeather {
  date: string
  maxTemp: number
  minTemp: number
  precipitation: number
  windMax: number
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyWeather[]
  timezone: string
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Moderate showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail',
}

export function useWeather(lat?: number, lng?: number) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lat == null || lng == null) return
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    axios
      .get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
          timezone: 'auto',
          forecast_days: 7,
        },
        signal: controller.signal,
      })
      .then((res) => {
        const c = res.data.current
        const d = res.data.daily
        setData({
          current: {
            temperature: c.temperature_2m,
            apparentTemperature: c.apparent_temperature,
            humidity: c.relative_humidity_2m,
            windSpeed: c.wind_speed_10m,
            precipitation: c.precipitation,
            weatherCode: c.weather_code,
            description: WMO_DESCRIPTIONS[c.weather_code] ?? 'Unknown',
          },
          daily: d.time.map((date: string, i: number) => ({
            date,
            maxTemp: d.temperature_2m_max[i],
            minTemp: d.temperature_2m_min[i],
            precipitation: d.precipitation_sum[i],
            windMax: d.wind_speed_10m_max[i],
          })),
          timezone: res.data.timezone,
        })
      })
      .catch((err) => { if (!axios.isCancel(err)) setError('Weather data unavailable') })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [lat, lng])

  return { data, loading, error }
}
