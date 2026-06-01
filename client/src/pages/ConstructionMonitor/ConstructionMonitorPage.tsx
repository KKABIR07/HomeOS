// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Chip, Alert, Stack, LinearProgress, Divider, Button, TextField,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
  ToggleButton, ToggleButtonGroup, Badge,
} from '@mui/material'
import {
  Videocam, FlightTakeoff, Security, TrendingUp, Warning,
  CheckCircle, Cancel, Upload, Timeline, Assignment, Calculate,
  CameraAlt, BarChart,
} from '@mui/icons-material'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, BarChart as BC, Bar, Legend } from 'recharts'
import { motion } from 'framer-motion'

// ─── Feature 3: AI Construction Fraud Detector ─────────────────────────────────
function FraudDetectorTab() {
  const [items, setItems] = useState([
    { material: 'Cement (OPC 53)', purchased: 850, used: 720, unit: 'bags', rate: 420 },
    { material: 'Fe 500 Steel', purchased: 12500, used: 11200, unit: 'kg', rate: 68 },
    { material: 'River Sand', purchased: 45, used: 38, unit: 'm³', rate: 1800 },
    { material: 'Coarse Aggregate', purchased: 60, used: 55, unit: 'm³', rate: 1200 },
    { material: 'AAC Blocks', purchased: 1800, used: 1420, unit: 'blocks', rate: 85 },
    { material: 'Vitrified Tiles', purchased: 2200, used: 1950, unit: 'sq ft', rate: 80 },
  ])

  const analysis = useMemo(() => items.map(item => {
    const diff = item.purchased - item.used
    const pct = (diff / item.purchased) * 100
    const value = diff * item.rate
    const risk = pct > 20 ? 'high' : pct > 10 ? 'medium' : pct > 5 ? 'low' : 'ok'
    return { ...item, diff, pct: pct.toFixed(1), value, risk }
  }), [items])

  const totalFraudRisk = analysis.reduce((s, a) => s + (a.risk !== 'ok' ? a.value : 0), 0)
  const highRisk = analysis.filter(a => a.risk === 'high')

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {totalFraudRisk > 0 && (
          <Alert severity="error" icon={<Security />} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>Potential Discrepancy Detected: ₹{totalFraudRisk.toLocaleString()}</Typography>
            {highRisk.map(r => <Typography key={r.material} variant="body2">• {r.material}: {r.pct}% unaccounted ({r.diff} {r.unit} = ₹{r.value.toLocaleString()})</Typography>)}
          </Alert>
        )}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Material Quantity Comparison</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Material</TableCell>
                <TableCell align="center">Purchased</TableCell>
                <TableCell align="center">Actual Used</TableCell>
                <TableCell align="center">Variance</TableCell>
                <TableCell align="center">Value at Risk</TableCell>
                <TableCell align="center">Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis.map((row) => (
                <TableRow key={row.material} sx={{ bgcolor: row.risk === 'high' ? 'error.light' + '22' : 'inherit' }}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{row.material}</Typography></TableCell>
                  <TableCell align="center">{row.purchased} {row.unit}</TableCell>
                  <TableCell align="center">
                    <TextField size="small" type="number" value={row.used} sx={{ width: 80 }}
                      onChange={e => setItems(prev => prev.map(i => i.material === row.material ? { ...i, used: Number(e.target.value) } : i))} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={row.risk === 'high' ? 'error.main' : row.risk === 'medium' ? 'warning.main' : 'success.main'} fontWeight={700}>
                      {row.diff > 0 ? '+' : ''}{row.diff} ({row.pct}%)
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color={row.value > 0 ? 'error.main' : 'text.secondary'}>
                      {row.value > 0 ? `₹${row.value.toLocaleString()}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={row.risk.toUpperCase()} size="small"
                      color={row.risk === 'high' ? 'error' : row.risk === 'medium' ? 'warning' : row.risk === 'low' ? 'info' : 'success'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Fraud Detection Tips</Typography>
          {[
            { tip: 'Request weigh-bridge slips for every steel delivery', icon: '⚖️' },
            { tip: 'Match cement dispatch notes with batch-plant receipts', icon: '📋' },
            { tip: 'Cross-check labour attendance with biometric records', icon: '👷' },
            { tip: 'Install camera at material store to detect night removal', icon: '📷' },
            { tip: 'Get independent quantity surveyor monthly inspection', icon: '🔍' },
          ].map(item => (
            <Box key={item.tip} display="flex" gap={1.5} py={1} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Typography fontSize="1.2rem">{item.icon}</Typography>
              <Typography variant="body2">{item.tip}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 4: Construction Camera Monitoring ────────────────────────────────
function CameraMonitorTab() {
  const [feeds] = useState([
    { id: 1, name: 'Main Gate Camera', status: 'online', workers: 12, violations: 1, progress: 'Foundation Stage' },
    { id: 2, name: 'Slab Work Camera', status: 'online', workers: 8, violations: 0, progress: 'RCC Slab Ongoing' },
    { id: 3, name: 'Material Store', status: 'online', workers: 2, violations: 0, progress: 'Storage Secure' },
    { id: 4, name: 'North Elevation', status: 'offline', workers: 0, violations: 0, progress: 'Offline' },
  ])

  const dailyReport = [
    { date: 'Mon', workers: 18, violations: 1, progress: 12 },
    { date: 'Tue', workers: 22, violations: 0, progress: 15 },
    { date: 'Wed', workers: 19, violations: 2, progress: 10 },
    { date: 'Thu', workers: 25, violations: 0, progress: 18 },
    { date: 'Fri', workers: 21, violations: 1, progress: 14 },
    { date: 'Sat', workers: 15, violations: 0, progress: 8 },
  ]

  return (
    <Grid container spacing={3}>
      {/* Camera Feeds */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {feeds.map(cam => (
            <Grid item xs={12} sm={6} md={3} key={cam.id}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '2px solid', borderColor: cam.status === 'online' ? 'success.main' : 'error.main', position: 'relative' }}>
                <Chip label={cam.status.toUpperCase()} size="small" color={cam.status === 'online' ? 'success' : 'error'} sx={{ position: 'absolute', top: 12, right: 12 }} />
                <Box sx={{ width: '100%', height: 100, bgcolor: cam.status === 'online' ? '#1a1a2e' : '#2a2a2a', borderRadius: 2, mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cam.status === 'online' ? <Videocam sx={{ color: '#00ff88', fontSize: 40 }} /> : <Cancel sx={{ color: 'grey.600', fontSize: 40 }} />}
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>{cam.name}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{cam.progress}</Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  {cam.status === 'online' && <Chip label={`👷 ${cam.workers}`} size="small" />}
                  {cam.violations > 0 && <Chip label={`⚠️ ${cam.violations} violation`} size="small" color="warning" />}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Safety Violations */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>AI Safety Detection</Typography>
          {[
            { time: '09:14', cam: 'Main Gate', type: 'Worker without helmet', severity: 'high' },
            { time: '11:32', cam: 'Slab Work', type: 'No safety harness on elevated work', severity: 'critical' },
            { time: '14:05', cam: 'Main Gate', type: 'Unauthorised person entered site', severity: 'medium' },
          ].map((v, i) => (
            <Box key={i} display="flex" gap={2} p={1.5} mb={1} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
              <Warning sx={{ color: v.severity === 'critical' ? 'error.main' : v.severity === 'high' ? 'warning.main' : 'info.main', flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>{v.type}</Typography>
                <Typography variant="caption" color="text.secondary">{v.time} · {v.cam}</Typography>
              </Box>
              <Chip label={v.severity} size="small" color={v.severity === 'critical' ? 'error' : v.severity === 'high' ? 'warning' : 'info'} sx={{ ml: 'auto', alignSelf: 'center' }} />
            </Box>
          ))}
        </Paper>
      </Grid>

      {/* Weekly Progress */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Weekly Worker & Progress Report</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BC data={dailyReport}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RTooltip />
              <Legend />
              <Bar dataKey="workers" fill="#6C63FF" name="Workers" radius={[3, 3, 0, 0]} />
              <Bar dataKey="progress" fill="#4caf50" name="Progress %" radius={[3, 3, 0, 0]} />
            </BC>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 5: Drone Site Inspection ─────────────────────────────────────────
function DroneInspectionTab() {
  const [uploaded, setUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)

  const handleUpload = () => {
    setUploaded(true); setAnalyzing(true)
    setTimeout(() => { setAnalyzing(false); setDone(true) }, 2000)
  }

  const findings = [
    { check: 'Boundary Accuracy', status: 'pass', detail: 'All 4 boundary walls within 5cm of approved plan' },
    { check: 'Excavation Progress', status: 'pass', detail: 'Foundation depth matches structural drawings (1.8m)' },
    { check: 'Roof Structure', status: 'warn', detail: 'Northwest corner shows 3cm settlement — monitor weekly' },
    { check: 'Crack Detection', status: 'warn', detail: '2 hairline cracks detected on south wall — minor, non-structural' },
    { check: 'Water Pooling', status: 'fail', detail: 'Waterlogging at rear of plot — drainage blocked' },
    { check: 'Material Storage', status: 'pass', detail: 'Steel and cement stored correctly per IS guidelines' },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightTakeoff color="primary" /> Drone Footage Upload
          </Typography>
          <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4, textAlign: 'center', mb: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
            onClick={handleUpload}>
            <Upload sx={{ fontSize: 48, color: uploaded ? 'success.main' : 'text.disabled', mb: 1 }} />
            <Typography variant="subtitle2">{uploaded ? 'drone_inspection_12jun.mp4' : 'Click to upload drone footage'}</Typography>
            <Typography variant="caption" color="text.secondary">{uploaded ? '47MB · MP4 · Ready for AI analysis' : 'Supports MP4, MOV, AVI up to 2GB'}</Typography>
          </Box>
          {analyzing && (
            <Box textAlign="center" py={2}>
              <CircularProgress sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">AI analyzing footage frame by frame...</Typography>
            </Box>
          )}
          {done && <Alert severity="success">Analysis complete — 6 checks performed</Alert>}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Inspection Checklist</Typography>
          {['Boundary accuracy','Excavation depth','Foundation quality','Wall alignment','Roof structure','Crack detection','Water pooling','Material storage'].map(c => (
            <Box key={c} display="flex" gap={1} py={0.8} alignItems="center">
              <CheckCircle sx={{ color: done ? 'success.main' : 'text.disabled', fontSize: 16 }} />
              <Typography variant="body2">{c}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        {done ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>AI Drone Analysis Report</Typography>
            <Stack spacing={1.5}>
              {findings.map(f => (
                <Box key={f.check} display="flex" gap={1.5} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                  {f.status === 'pass' ? <CheckCircle sx={{ color: 'success.main', flexShrink: 0 }} />
                    : f.status === 'warn' ? <Warning sx={{ color: 'warning.main', flexShrink: 0 }} />
                    : <Cancel sx={{ color: 'error.main', flexShrink: 0 }} />}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{f.check}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.detail}</Typography>
                  </Box>
                  <Chip label={f.status === 'pass' ? 'OK' : f.status === 'warn' ? 'Warning' : 'Issue'} size="small"
                    color={f.status === 'pass' ? 'success' : f.status === 'warn' ? 'warning' : 'error'} sx={{ ml: 'auto', alignSelf: 'flex-start' }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <Typography fontSize="3rem" mb={2}>🚁</Typography>
            <Typography variant="h6" color="text.secondary">Upload drone footage to start AI inspection</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

// ─── Feature 20: Construction Progress Tracker ────────────────────────────────
function ProgressTrackerTab() {
  const stages = [
    { name: 'Site Preparation', planned: 100, actual: 100, budget: 150000, spent: 148000 },
    { name: 'Foundation', planned: 100, actual: 100, budget: 850000, spent: 920000 },
    { name: 'Structure (RCC)', planned: 100, actual: 85, budget: 2200000, spent: 1900000 },
    { name: 'Masonry Walls', planned: 80, actual: 60, budget: 680000, spent: 510000 },
    { name: 'MEP Rough-In', planned: 40, actual: 25, budget: 320000, spent: 180000 },
    { name: 'Finishing', planned: 0, actual: 0, budget: 1100000, spent: 0 },
    { name: 'Exterior', planned: 0, actual: 0, budget: 380000, spent: 0 },
  ]

  const overallPlanned = Math.round(stages.reduce((s, st) => s + st.planned, 0) / stages.length)
  const overallActual = Math.round(stages.reduce((s, st) => s + st.actual, 0) / stages.length)
  const totalBudget = stages.reduce((s, st) => s + st.budget, 0)
  const totalSpent = stages.reduce((s, st) => s + st.spent, 0)
  const delay = overallPlanned - overallActual
  const budgetVariance = totalSpent - stages.filter(s => s.actual > 0).reduce((sum, s) => sum + s.budget * (s.actual / 100), 0)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {[
            { label: 'Overall Planned', value: `${overallPlanned}%`, color: '#6C63FF' },
            { label: 'Actual Progress', value: `${overallActual}%`, color: '#4caf50' },
            { label: 'Schedule Delay', value: `${delay}%`, color: delay > 10 ? '#f44336' : '#ff9800' },
            { label: 'Budget Spent', value: `₹${(totalSpent / 100000).toFixed(1)}L / ₹${(totalBudget / 100000).toFixed(1)}L`, color: '#2196f3' },
          ].map(item => (
            <Grid item xs={6} md={3} key={item.label}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: item.color }}>{item.value}</Typography>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Planned vs Actual Progress</Typography>
          <ResponsiveContainer width="100%" height={240}>
            <BC data={stages} layout="vertical">
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
              <RTooltip formatter={v => [`${v}%`, '']} />
              <Legend />
              <Bar dataKey="planned" fill="#6C63FF" name="Planned" radius={[0, 3, 3, 0]} />
              <Bar dataKey="actual" fill="#4caf50" name="Actual" radius={[0, 3, 3, 0]} />
            </BC>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Budget Status</Typography>
          {stages.filter(s => s.actual > 0).map(s => {
            const budgetUsed = s.spent / s.budget * 100
            const over = s.spent > s.budget
            return (
              <Box key={s.name} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{s.name}</Typography>
                  <Typography variant="caption" color={over ? 'error.main' : 'success.main'} fontWeight={700}>
                    ₹{(s.spent / 1000).toFixed(0)}k / ₹{(s.budget / 1000).toFixed(0)}k
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, budgetUsed)}
                  sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: over ? 'error.main' : 'success.main' } }} />
              </Box>
            )
          })}
          {budgetVariance > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>₹{(budgetVariance / 1000).toFixed(0)}k over budget on completed stages</Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

export default function ConstructionMonitorPage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Construction Monitor</Typography>
        <Typography variant="body1" color="text.secondary">AI fraud detection, live camera monitoring, drone inspection, and progress tracking.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['🔍 Fraud Detector', '📷 Camera Monitor', '🚁 Drone Inspection', '📊 Progress Tracker'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <FraudDetectorTab />}
      {tab === 1 && <CameraMonitorTab />}
      {tab === 2 && <DroneInspectionTab />}
      {tab === 3 && <ProgressTrackerTab />}
    </Box>
  )
}
