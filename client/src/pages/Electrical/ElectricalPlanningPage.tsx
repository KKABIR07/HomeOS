// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, LinearProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import { useWeather } from '../../hooks/useWeather'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }
const COLORS = ['#6C63FF', '#FF6584', '#4FC3F7', '#81C784', '#FFB74D', '#F06292']

function buildLoadCalc(project: any) {
  const area = project?.builtArea || 100
  const beds = project?.bedrooms || 2
  const baths = project?.bathrooms || 2
  const floors = project?.floors || 1
  const isCommercial = project?.houseType === 'commercial'

  return [
    { appliance: 'LED Lighting', watts: isCommercial ? 15 : 10, qty: Math.ceil(area / 10), hours: 6 },
    { appliance: 'Ceiling Fans', watts: 75, qty: Math.ceil(area / 20), hours: 10 },
    { appliance: 'Air Conditioner', watts: 1500, qty: beds + (isCommercial ? 2 : 1), hours: 8 },
    { appliance: 'Refrigerator', watts: 150, qty: isCommercial ? 2 : 1, hours: 24 },
    { appliance: 'Water Heater (Geyser)', watts: 2000, qty: baths, hours: 1 },
    { appliance: 'Washing Machine', watts: 500, qty: 1, hours: 1 },
    { appliance: 'TV / AV', watts: 200, qty: beds, hours: 4 },
    { appliance: 'Computer / Laptop', watts: 150, qty: isCommercial ? 10 : beds, hours: 8 },
    { appliance: 'Microwave / OTG', watts: 1000, qty: 1, hours: 0.5 },
    ...(isCommercial ? [{ appliance: 'Server / UPS', watts: 2000, qty: 1, hours: 24 }] : []),
  ].map((a) => ({ ...a, dailyKwh: Math.round(a.watts * a.qty * a.hours / 1000 * 100) / 100 }))
}

function buildSolarDesign(project: any, weather: any) {
  const roof = project?.builtArea || 100
  const usableRoof = Math.round(roof * 0.4)
  const panels = Math.floor(usableRoof / 2)
  const kw = Math.round(panels * 0.35 * 10) / 10
  const irradiance = weather ? Math.max(3, 7 - Math.abs(weather.current.temperature - 28) * 0.1) : 5
  const dailyKwh = Math.round(kw * irradiance * 10) / 10
  const monthlySaving = Math.round(dailyKwh * 30 * 8)
  const cost = Math.round(kw * 60000)
  const payback = cost > 0 ? Math.round(cost / (monthlySaving * 12) * 10) / 10 : 0
  return { usableRoof, panels, kw, dailyKwh, monthlySaving, cost, payback }
}

export default function ElectricalPlanningPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo } = useProjectGeo(project?.location)
  const { data: weather } = useWeather(geo?.lat, geo?.lng)

  const loads = useMemo(() => buildLoadCalc(project), [project])
  const solar = useMemo(() => buildSolarDesign(project, weather), [project, weather])
  const totalDailyKwh = loads.reduce((a, l) => a + l.dailyKwh, 0)
  const totalMonthlyKwh = Math.round(totalDailyKwh * 30)

  if (isLoading || !project) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading…</Typography></Box>

  const currency = project.currency || '₹'

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Electrical & Solar Planning</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {project.builtArea || '–'} m² · {project.floors || 1} floor(s)</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Total Load', `${Math.round(loads.reduce((a, l) => a + l.watts * l.qty, 0) / 1000)} kW`], ['Daily Usage', `${totalDailyKwh.toFixed(1)} kWh`], ['Monthly Usage', `${totalMonthlyKwh} kWh`], ['Est. Bill', `${currency} ${(totalMonthlyKwh * 8).toLocaleString()}`]].map(([k, v]) => (
          <Grid item xs={6} md={3} key={k}>
            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{k}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{v}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['⚡ Load Calculator', '☀️ Solar Design', '🔌 Distribution'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Load calculated for {project.builtArea || 100} m², {project.bedrooms || 2} beds, {project.bathrooms || 2} baths ({project.houseType}).</Alert>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontWeight: 700 }}>APPLIANCE</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 60, textAlign: 'right', fontWeight: 700 }}>WATTS</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 40, textAlign: 'right', fontWeight: 700 }}>QTY</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 50, textAlign: 'right', fontWeight: 700 }}>HRS</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 70, textAlign: 'right', fontWeight: 700 }}>kWh/day</Typography>
            </Box>
            {loads.map((load, i) => (
              <Box key={i} sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>{load.appliance}</Typography>
                <Typography variant="body2" sx={{ width: 60, textAlign: 'right' }}>{load.watts}W</Typography>
                <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{load.qty}</Typography>
                <Typography variant="body2" sx={{ width: 50, textAlign: 'right' }}>{load.hours}h</Typography>
                <Typography variant="body2" sx={{ width: 70, textAlign: 'right', fontWeight: 700 }}>{load.dailyKwh}</Typography>
              </Box>
            ))}
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Total Daily: {totalDailyKwh.toFixed(1)} kWh</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Monthly: {totalMonthlyKwh} kWh</Typography>
            </Box>
          </Card>
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity={solar.payback < 8 ? 'success' : 'info'} sx={{ mb: 3 }}>
            Solar payback period: <strong>{solar.payback} years</strong> — {solar.payback < 8 ? 'Excellent ROI!' : 'Good long-term investment'}
          </Alert>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Solar System Design</Typography>
                {[['Usable Roof Area', `${solar.usableRoof} m²`], ['Solar Panels', `${solar.panels} panels`], ['System Capacity', `${solar.kw} kWp`], ['Daily Generation', `${solar.dailyKwh} kWh`], ['Monthly Savings', `${currency} ${solar.monthlySaving.toLocaleString()}`], ['System Cost (est.)', `${currency} ${solar.cost.toLocaleString()}`], ['Payback Period', `${solar.payback} years`], ['Solar Irradiance', weather ? `${Math.round(weather.current.temperature / 5)} kWh/m²/day` : '–']].map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>25-Year Savings Projection</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={Array.from({ length: 5 }, (_, i) => ({ period: `Y${(i + 1) * 5}`, savings: Math.round(solar.monthlySaving * 12 * (i + 1) * 5 * 1.05) }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
                    <Bar dataKey="savings" name="Cumulative Savings" fill="#FFB74D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Load Distribution</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={loads.slice(0, 6)} dataKey="dailyKwh" nameKey="appliance" cx="50%" cy="50%" outerRadius={95} label={({ appliance, dailyKwh }) => `${dailyKwh}kWh`} labelLine={false}>
                      {loads.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v} kWh/day`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Distribution Board Layout</Typography>
                {[['Main Incomer', `${Math.ceil(totalDailyKwh * 4)} A RCCB`], ['Lighting Circuit', `${Math.ceil(loads.find(l => l.appliance === 'LED Lighting')?.qty / 8)} × 6A MCB`], ['Power Circuit', `${Math.ceil(loads.filter(l => l.watts > 200).length / 3)} × 16A MCB`], ['AC Circuit', `${loads.find(l => l.appliance === 'Air Conditioner')?.qty || 1} × 20A MCB`], ['Geyser Circuit', `${project.bathrooms || 1} × 20A MCB`], ['Earthing', 'GI Earth electrode + plate earthing'], ['Metering', 'Smart dual-tariff meter']].map(([k, v]) => (
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
