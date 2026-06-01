// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Stack,
  IconButton, Switch, Slider, Button, Divider, Badge, Alert,
} from '@mui/material'
import {
  LightMode, DarkMode, Videocam, Lock, WaterDrop, ElectricBolt,
  Thermostat, Security, Wifi, Home, TrendingDown, TrendingUp,
  Power, VolumeUp, AcUnit, LocalFireDepartment, Notifications,
} from '@mui/icons-material'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function SmartHomePage() {
  const [lights, setLights] = useState<Record<string, boolean>>({ living: true, bedroom: false, kitchen: true, bathroom: false, garden: false, porch: true })
  const [brightness, setBrightness] = useState<Record<string, number>>({ living: 80, bedroom: 40, kitchen: 100, bathroom: 70, garden: 60, porch: 90 })
  const [acTemp, setAcTemp] = useState(24)
  const [acOn, setAcOn] = useState(true)
  const [locks, setLocks] = useState({ main: true, back: true, garage: false })
  const [irrigation, setIrrigation] = useState(false)

  const toggleLight = (room: string) => setLights(l => ({ ...l, [room]: !l[room] }))

  const energyData = [
    { time: '6am', kw: 0.8 }, { time: '9am', kw: 2.1 }, { time: '12pm', kw: 3.4 },
    { time: '3pm', kw: 2.8 }, { time: '6pm', kw: 4.2 }, { time: '9pm', kw: 3.1 }, { time: '12am', kw: 1.2 },
  ]

  const activeDevices = Object.values(lights).filter(Boolean).length + (acOn ? 1 : 0) + (irrigation ? 1 : 0)
  const currentLoad = (Object.entries(lights).filter(([_, v]) => v).reduce((s, [k]) => s + (brightness[k] || 0) * 0.1, 0) + (acOn ? 15 : 0) + (irrigation ? 3 : 0)).toFixed(1)

  const alerts = [
    { type: 'warning', msg: 'Motion detected at back door — 09:42 AM', icon: <Security /> },
    { type: 'info', msg: 'Smart irrigation activated — 15 min cycle started', icon: <WaterDrop /> },
    { type: 'success', msg: 'All entry locks secured', icon: <Lock /> },
  ]

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Smart Home Command Center</Typography>
          <Typography variant="body1" color="text.secondary">Control lights, locks, AC, irrigation, and monitor energy from one dashboard.</Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Chip icon={<Wifi />} label="All devices online" color="success" />
          <Badge badgeContent={1} color="warning">
            <IconButton><Notifications /></IconButton>
          </Badge>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Status Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              { label: 'Active Devices', value: activeDevices, icon: <Power />, color: '#6C63FF' },
              { label: 'Current Load', value: `${currentLoad} A`, icon: <ElectricBolt />, color: '#ff9800' },
              { label: 'Temperature', value: `${acTemp}°C`, icon: <Thermostat />, color: '#2196f3' },
              { label: 'Security', value: 'Armed', icon: <Security />, color: '#4caf50' },
            ].map(card => (
              <Grid item xs={6} md={3} key={card.label}>
                <Paper sx={{ p: 2.5, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={900} sx={{ color: card.color }}>{card.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Lighting Control */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightMode color="warning" /> Lighting Control
            </Typography>
            <Grid container spacing={1.5}>
              {Object.entries(lights).map(([room, on]) => (
                <Grid item xs={6} key={room}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: on ? 'warning.main' + '18' : 'action.hover', border: '1px solid', borderColor: on ? 'warning.main' : 'divider', transition: 'all 0.3s' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={700} textTransform="capitalize">{room}</Typography>
                      <Switch size="small" checked={on} onChange={() => toggleLight(room)} color="warning" />
                    </Box>
                    {on && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{brightness[room]}%</Typography>
                        <Slider size="small" value={brightness[room]} onChange={(_, v) => setBrightness(b => ({ ...b, [room]: v as number }))}
                          sx={{ '& .MuiSlider-thumb': { width: 12, height: 12 } }} />
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Climate & Locks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AcUnit color="info" /> Climate Control
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="body2">AC System</Typography>
              <Switch checked={acOn} onChange={() => setAcOn(a => !a)} />
              <Chip label={acOn ? 'Running' : 'Off'} size="small" color={acOn ? 'info' : 'default'} />
            </Box>
            {acOn && (
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Set Temperature</Typography>
                  <Typography variant="h6" fontWeight={800} color="info.main">{acTemp}°C</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconButton size="small" onClick={() => setAcTemp(t => Math.max(16, t - 1))}><TrendingDown /></IconButton>
                  <Slider value={acTemp} min={16} max={30} onChange={(_, v) => setAcTemp(v as number)} color="info" sx={{ flex: 1 }} />
                  <IconButton size="small" onClick={() => setAcTemp(t => Math.min(30, t + 1))}><TrendingUp /></IconButton>
                </Box>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock color="success" /> Door Locks
            </Typography>
            <Stack spacing={1.5}>
              {Object.entries(locks).map(([door, locked]) => (
                <Box key={door} display="flex" alignItems="center" justifyContent="space-between"
                  p={1.5} sx={{ bgcolor: locked ? 'success.main' + '12' : 'error.main' + '12', borderRadius: 2 }}>
                  <Box display="flex" gap={1.5} alignItems="center">
                    <Lock sx={{ color: locked ? 'success.main' : 'error.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600} textTransform="capitalize">{door} Door</Typography>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip label={locked ? 'Locked' : 'Unlocked'} size="small" color={locked ? 'success' : 'error'} />
                    <Switch size="small" checked={locked} onChange={() => setLocks(l => ({ ...l, [door]: !l[door] }))} color="success" />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Energy Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Today's Energy Consumption</Typography>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={energyData}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="A" />
                <RTooltip formatter={v => [`${v}A`, 'Load']} />
                <Area type="monotone" dataKey="kw" stroke="#6C63FF" fill="rgba(108,99,255,0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Alerts & Irrigation */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Smart Irrigation</Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Auto Irrigation</Typography>
                <Typography variant="caption" color="text.secondary">Scheduled: 6:00 AM, 6:00 PM</Typography>
              </Box>
              <Switch checked={irrigation} onChange={() => setIrrigation(i => !i)} color="success" />
            </Box>
            {irrigation && <Alert severity="info" sx={{ py: 0.5 }}>Irrigation running — 15 min cycle</Alert>}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Recent Alerts</Typography>
            <Stack spacing={1.5}>
              {alerts.map((a, i) => (
                <Box key={i} display="flex" gap={1.5} p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Box sx={{ color: a.type === 'warning' ? 'warning.main' : a.type === 'success' ? 'success.main' : 'info.main' }}>{a.icon}</Box>
                  <Typography variant="caption">{a.msg}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
