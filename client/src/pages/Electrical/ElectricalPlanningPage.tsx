// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  TextField, Button, Chip, Slider, Alert, Table, TableBody,
  TableCell, TableHead, TableRow, Stack, Divider, Switch,
  FormControlLabel, LinearProgress, IconButton, Tooltip,
} from '@mui/material'
import {
  ElectricBolt, SolarPower, SmartToy, Add, Remove, Security,
  LightMode, Thermostat, Videocam, Lock, WifiTethering, Calculate,
} from '@mui/icons-material'
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

// ─── Types & Data ───────────────────────────────────────────────────────────────
interface Appliance { name: string; watts: number; qty: number; hoursPerDay: number; icon: string }

const DEFAULT_APPLIANCES: Appliance[] = [
  { name: 'LED Lights', watts: 10, qty: 20, hoursPerDay: 8, icon: '💡' },
  { name: 'Ceiling Fans', watts: 75, qty: 6, hoursPerDay: 12, icon: '🌀' },
  { name: 'Air Conditioners (1.5T)', watts: 1500, qty: 2, hoursPerDay: 8, icon: '❄️' },
  { name: 'Refrigerator', watts: 200, qty: 1, hoursPerDay: 24, icon: '🧊' },
  { name: 'Washing Machine', watts: 500, qty: 1, hoursPerDay: 2, icon: '🫧' },
  { name: 'Water Heater (Geyser)', watts: 2000, qty: 2, hoursPerDay: 1, icon: '🚿' },
  { name: 'Microwave / Oven', watts: 1000, qty: 1, hoursPerDay: 1, icon: '📡' },
  { name: 'TV (Smart 55")', watts: 120, qty: 2, hoursPerDay: 5, icon: '📺' },
  { name: 'Computer / Laptop', watts: 150, qty: 2, hoursPerDay: 8, icon: '💻' },
  { name: 'EV Charger (7.4kW)', watts: 7400, qty: 0, hoursPerDay: 4, icon: '🔌' },
]

const PIE_COLORS = ['#6C63FF','#FF6584','#4fc3f7','#81c784','#ffb74d','#f06292','#ba68c8','#4db6ac','#aed581','#ff8a65']

// ─── Sub-components ─────────────────────────────────────────────────────────────
function LoadCalculatorTab() {
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES)

  const updateAppliance = (i: number, field: keyof Appliance, value: number) => {
    setAppliances(a => a.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const { totalWatts, dailyKWh, monthlyKWh, monthlyBill, backupKVA, pieData } = useMemo(() => {
    const totalWatts = appliances.reduce((s, a) => s + a.watts * a.qty, 0)
    const dailyKWh = appliances.reduce((s, a) => s + (a.watts * a.qty * a.hoursPerDay) / 1000, 0)
    const monthlyKWh = dailyKWh * 30
    const monthlyBill = Math.round(monthlyKWh * 7.5) // avg ₹7.5/kWh
    const backupKVA = Math.ceil((totalWatts / 1000) * 1.25)
    const pieData = appliances.filter(a => a.qty > 0).map(a => ({
      name: a.name,
      value: Math.round((a.watts * a.qty * a.hoursPerDay) / 1000 * 10) / 10,
    }))
    return { totalWatts, dailyKWh, monthlyKWh, monthlyBill, backupKVA, pieData }
  }, [appliances])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Appliance Load Calculator</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Appliance</TableCell>
                <TableCell align="center">Watts</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="center">Hrs/Day</TableCell>
                <TableCell align="right">kWh/day</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appliances.map((a, i) => (
                <TableRow key={a.name}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontSize="1.1rem">{a.icon}</Typography>
                      <Typography variant="body2">{a.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <TextField size="small" type="number" value={a.watts}
                      onChange={e => updateAppliance(i, 'watts', Number(e.target.value))}
                      sx={{ width: 70 }} inputProps={{ min: 0 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <IconButton size="small" onClick={() => updateAppliance(i, 'qty', Math.max(0, a.qty - 1))}><Remove fontSize="small" /></IconButton>
                      <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>{a.qty}</Typography>
                      <IconButton size="small" onClick={() => updateAppliance(i, 'qty', a.qty + 1)}><Add fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <TextField size="small" type="number" value={a.hoursPerDay}
                      onChange={e => updateAppliance(i, 'hoursPerDay', Number(e.target.value))}
                      sx={{ width: 60 }} inputProps={{ min: 0, max: 24 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color={a.qty > 0 ? 'primary.main' : 'text.disabled'}>
                      {((a.watts * a.qty * a.hoursPerDay) / 1000).toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Load Summary</Typography>
          <Grid container spacing={1.5}>
            {[
              { label: 'Connected Load', value: `${(totalWatts / 1000).toFixed(2)} kW`, color: '#6C63FF' },
              { label: 'Daily Consumption', value: `${dailyKWh.toFixed(1)} kWh`, color: '#4fc3f7' },
              { label: 'Monthly Consumption', value: `${monthlyKWh.toFixed(0)} kWh`, color: '#81c784' },
              { label: 'Est. Monthly Bill', value: `₹${monthlyBill.toLocaleString()}`, color: '#FF6584' },
              { label: 'Inverter/UPS Size', value: `${backupKVA} kVA`, color: '#ffb74d' },
            ].map(item => (
              <Grid item xs={6} key={item.label}>
                <Box p={1.5} sx={{ bgcolor: `${item.color}18`, borderRadius: 2, border: `1px solid ${item.color}30` }}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Consumption Breakdown</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RTooltip formatter={(v: number) => [`${v} kWh/day`, '']} />
              <Legend formatter={v => v.length > 15 ? v.slice(0, 15) + '…' : v} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  )
}

function SolarDesignTab() {
  const [roofArea, setRoofArea] = useState(1500)
  const [monthlyBill, setMonthlyBill] = useState(5000)
  const [roofType, setRoofType] = useState<'flat' | 'sloped'>('flat')

  const { systemKW, panelCount, annualGenKWh, paybackYears, savings25yr, co2Saved } = useMemo(() => {
    const usableRoof = roofArea * (roofType === 'flat' ? 0.6 : 0.7)
    const unitsPerMonth = monthlyBill / 7.5
    const systemKW = Math.ceil(unitsPerMonth / 120)
    const panelCount = Math.ceil((systemKW * 1000) / 400)
    const systemCost = systemKW * 65000
    const annualGenKWh = systemKW * 1400
    const annualSaving = annualGenKWh * 7.5
    const paybackYears = Math.ceil(systemCost / annualSaving)
    const savings25yr = Math.round(annualSaving * 25 - systemCost)
    const co2Saved = Math.round(annualGenKWh * 0.82)
    return { systemKW, panelCount, annualGenKWh, paybackYears, savings25yr, co2Saved }
  }, [roofArea, monthlyBill, roofType])

  const systemCost = systemKW * 65000

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SolarPower color="primary" /> Solar System Designer
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField label="Roof Area (sq ft)" type="number" size="small" fullWidth
                value={roofArea} onChange={e => setRoofArea(Number(e.target.value))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Monthly Bill (₹)" type="number" size="small" fullWidth
                value={monthlyBill} onChange={e => setMonthlyBill(Number(e.target.value))} />
            </Grid>
          </Grid>
          <Typography variant="body2" mb={1}>Roof Type</Typography>
          <Box display="flex" gap={1} mb={3}>
            {(['flat', 'sloped'] as const).map(t => (
              <Chip key={t} label={t === 'flat' ? 'Flat Roof' : 'Sloped Roof'}
                onClick={() => setRoofType(t)} color={roofType === t ? 'primary' : 'default'}
                variant={roofType === t ? 'filled' : 'outlined'} />
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" mb={0.5}>Assumed:</Typography>
          <Typography variant="caption" color="text.secondary">Tariff: ₹7.5/kWh · Panel efficiency: 20% (400W panels) · Solar irradiance: 4.5 peak hrs/day</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Solar System Analysis</Typography>
          <Grid container spacing={2} mb={3}>
            {[
              { label: 'System Size Required', value: `${systemKW} kW`, icon: '⚡', color: '#ffc107' },
              { label: 'No. of Solar Panels (400W)', value: panelCount, icon: '🔲', color: '#4fc3f7' },
              { label: 'Estimated System Cost', value: `₹${systemCost.toLocaleString()}`, icon: '💰', color: '#81c784' },
              { label: 'Annual Generation', value: `${annualGenKWh.toLocaleString()} kWh`, icon: '🌞', color: '#ff9800' },
              { label: 'Payback Period', value: `${paybackYears} years`, icon: '📅', color: '#6C63FF' },
              { label: 'Savings Over 25 Years', value: `₹${(savings25yr / 100000).toFixed(1)} Lac`, icon: '💹', color: '#4caf50' },
              { label: 'CO₂ Saved/Year', value: `${co2Saved} kg`, icon: '🌱', color: '#26a69a' },
            ].map(item => (
              <Grid item xs={6} md={4} key={item.label}>
                <Box p={2} sx={{ bgcolor: `${item.color}18`, borderRadius: 2, textAlign: 'center' }}>
                  <Typography fontSize="1.6rem">{item.icon}</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info">
            With {systemKW}kW system, your rooftop solar can offset approx. {Math.min(95, Math.round(systemKW * 120 / (monthlyBill / 7.5) * 100))}% of your current electricity bill.
            After payback in {paybackYears} years, you save ₹{(annualGenKWh * 7.5).toLocaleString()}/year for free.
          </Alert>
        </Paper>
      </Grid>
    </Grid>
  )
}

function SmartHomeTab() {
  const [features, setFeatures] = useState<Record<string, boolean>>({
    cctv: true, smartLocks: false, motionSensors: true, faceRecognition: false,
    smartLights: true, smartCurtains: false, smartThermostats: false, smartIrrigation: false,
    voiceControl: false, evCharger: false,
  })

  const toggle = (key: string) => setFeatures(f => ({ ...f, [key]: !f[key] }))

  const categories = [
    {
      title: 'Security Systems',
      icon: <Security color="error" />,
      items: [
        { key: 'cctv', name: 'CCTV Cameras', desc: 'HD surveillance with cloud storage', cost: '₹25,000–80,000', icon: <Videocam /> },
        { key: 'smartLocks', name: 'Smart Door Locks', desc: 'PIN, fingerprint, app + key access', cost: '₹8,000–25,000', icon: <Lock /> },
        { key: 'motionSensors', name: 'Motion Sensors', desc: 'PIR sensors with alert notifications', cost: '₹5,000–15,000', icon: <WifiTethering /> },
        { key: 'faceRecognition', name: 'Face Recognition', desc: 'AI-powered entry system', cost: '₹40,000–1,20,000', icon: <SmartToy /> },
      ],
    },
    {
      title: 'Home Automation',
      icon: <SmartToy color="primary" />,
      items: [
        { key: 'smartLights', name: 'Smart Lighting', desc: 'Scene control, scheduling, dimming', cost: '₹2,000–5,000/room', icon: <LightMode /> },
        { key: 'smartCurtains', name: 'Smart Curtains', desc: 'Motorised blinds with solar sensor', cost: '₹15,000–40,000/window', icon: <SmartToy /> },
        { key: 'smartThermostats', name: 'Smart Thermostats', desc: 'AI climate control, energy saving', cost: '₹8,000–20,000/AC', icon: <Thermostat /> },
        { key: 'smartIrrigation', name: 'Smart Irrigation', desc: 'Weather-based auto watering', cost: '₹12,000–35,000', icon: <WifiTethering /> },
        { key: 'voiceControl', name: 'Voice Control Hub', desc: 'Alexa/Google Home integration', cost: '₹5,000–15,000', icon: <SmartToy /> },
        { key: 'evCharger', name: 'EV Charger', desc: '7.4kW home EV charging station', cost: '₹40,000–80,000', icon: <ElectricBolt /> },
      ],
    },
  ]

  const selectedItems = Object.entries(features).filter(([, v]) => v)
  const costRanges: Record<string, [number, number]> = {
    cctv: [25000, 80000], smartLocks: [8000, 25000], motionSensors: [5000, 15000], faceRecognition: [40000, 120000],
    smartLights: [30000, 75000], smartCurtains: [45000, 120000], smartThermostats: [24000, 60000],
    smartIrrigation: [12000, 35000], voiceControl: [5000, 15000], evCharger: [40000, 80000],
  }
  const totalMin = selectedItems.reduce((s, [k]) => s + (costRanges[k]?.[0] || 0), 0)
  const totalMax = selectedItems.reduce((s, [k]) => s + (costRanges[k]?.[1] || 0), 0)

  return (
    <Grid container spacing={3}>
      {categories.map(cat => (
        <Grid item xs={12} md={6} key={cat.title}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {cat.icon} {cat.title}
            </Typography>
            <Stack spacing={2}>
              {cat.items.map(item => (
                <Box key={item.key} display="flex" alignItems="center" gap={2}
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: features[item.key] ? 'action.selected' : 'transparent',
                    border: '1px solid', borderColor: features[item.key] ? 'primary.main' : 'divider', transition: 'all 0.2s' }}>
                  <Box sx={{ color: features[item.key] ? 'primary.main' : 'text.disabled' }}>{item.icon}</Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                    <Chip label={item.cost} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                  </Box>
                  <Switch checked={features[item.key]} onChange={() => toggle(item.key)} size="small" />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Selected Package Summary</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            {selectedItems.map(([k]) => {
              const allItems = categories.flatMap(c => c.items)
              const item = allItems.find(i => i.key === k)
              return item ? <Chip key={k} label={item.name} onDelete={() => toggle(k)} color="primary" /> : null
            })}
            {selectedItems.length === 0 && <Typography color="text.secondary">No features selected</Typography>}
          </Box>
          {selectedItems.length > 0 && (
            <Box p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">Estimated Total Investment</Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main">
                ₹{totalMin.toLocaleString()} – ₹{totalMax.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">{selectedItems.length} features selected · excludes installation charges</Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function ElectricalPlanningPage() {
  const [tab, setTab] = useState(0)

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Electrical Planning & Smart Home</Typography>
        <Typography variant="body1" color="text.secondary">
          Load calculation, solar system design, and smart home automation planning.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {[
            { label: 'Load Calculator', icon: <Calculate /> },
            { label: 'Solar Design', icon: <SolarPower /> },
            { label: 'Smart Home', icon: <SmartToy /> },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start"
              sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>

      <Box mt={3}>
        {tab === 0 && <LoadCalculatorTab />}
        {tab === 1 && <SolarDesignTab />}
        {tab === 2 && <SmartHomeTab />}
      </Box>
    </Box>
  )
}
