// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Chip, LinearProgress, Stack, Accordion, AccordionSummary,
  AccordionDetails, Checkbox, FormControlLabel, Alert, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Button, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material'
import {
  ExpandMore, CheckCircle, RadioButtonUnchecked, Construction,
  Timeline, Assignment, Flag, Warning, TrendingUp,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

// ─── Types & Data ───────────────────────────────────────────────────────────────
interface Task { id: string; name: string; done: boolean; critical?: boolean }
interface Stage { id: string; name: string; icon: string; color: string; tasks: Task[]; durationWeeks: number }

const STAGES: Stage[] = [
  {
    id: 'survey', name: 'Site Survey & Approval', icon: '📐', color: '#6C63FF', durationWeeks: 2,
    tasks: [
      { id: 's1', name: 'Topographic survey completed', done: false, critical: true },
      { id: 's2', name: 'Soil investigation report', done: false, critical: true },
      { id: 's3', name: 'Building plan submission (Municipality)', done: false, critical: true },
      { id: 's4', name: 'Structural design approval', done: false },
      { id: 's5', name: 'Environmental clearance (if required)', done: false },
    ],
  },
  {
    id: 'foundation', name: 'Foundation Stage', icon: '🏗️', color: '#ff9800', durationWeeks: 4,
    tasks: [
      { id: 'f1', name: 'Site clearing & demarcation', done: false, critical: true },
      { id: 'f2', name: 'Excavation & earthwork', done: false, critical: true },
      { id: 'f3', name: 'PCC (Plain Cement Concrete) laid', done: false, critical: true },
      { id: 'f4', name: 'Reinforcement (rebar) placement inspected', done: false },
      { id: 'f5', name: 'Foundation concrete poured & cured', done: false, critical: true },
      { id: 'f6', name: 'Waterproofing of foundation', done: false },
      { id: 'f7', name: 'Anti-termite treatment', done: false },
      { id: 'f8', name: 'Foundation inspection passed', done: false, critical: true },
    ],
  },
  {
    id: 'structure', name: 'Structural Stage', icon: '🏛️', color: '#2196f3', durationWeeks: 12,
    tasks: [
      { id: 'st1', name: 'Column formwork & reinforcement', done: false, critical: true },
      { id: 'st2', name: 'Columns poured floor-wise', done: false, critical: true },
      { id: 'st3', name: 'Beam & slab shuttering', done: false },
      { id: 'st4', name: 'Beam & slab reinforcement checked', done: false, critical: true },
      { id: 'st5', name: 'Concrete poured (slab)', done: false, critical: true },
      { id: 'st6', name: 'Curing (minimum 14 days)', done: false },
      { id: 'st7', name: 'Brickwork — external walls', done: false },
      { id: 'st8', name: 'Brickwork — internal partitions', done: false },
      { id: 'st9', name: 'Staircase construction', done: false },
      { id: 'st10', name: 'Lintel casting (over openings)', done: false },
    ],
  },
  {
    id: 'mep', name: 'MEP Rough-In', icon: '⚡', color: '#9c27b0', durationWeeks: 4,
    tasks: [
      { id: 'm1', name: 'Electrical conduit laying (walls & slab)', done: false, critical: true },
      { id: 'm2', name: 'Plumbing pipe routing (supply)', done: false, critical: true },
      { id: 'm3', name: 'Drainage pipe layout', done: false, critical: true },
      { id: 'm4', name: 'Earthing & lightning protection', done: false },
      { id: 'm5', name: 'Internet / LAN conduit routing', done: false },
      { id: 'm6', name: 'MEP inspection & pressure test', done: false, critical: true },
    ],
  },
  {
    id: 'finishing', name: 'Finishing Stage', icon: '🎨', color: '#4caf50', durationWeeks: 10,
    tasks: [
      { id: 'fin1', name: 'External plastering', done: false },
      { id: 'fin2', name: 'Internal plastering', done: false },
      { id: 'fin3', name: 'Waterproofing (bathroom, terrace)', done: false, critical: true },
      { id: 'fin4', name: 'Flooring — ground floor', done: false },
      { id: 'fin5', name: 'Flooring — upper floors', done: false },
      { id: 'fin6', name: 'Door & window frames fixed', done: false },
      { id: 'fin7', name: 'False ceiling work', done: false },
      { id: 'fin8', name: 'Electrical wiring & fittings', done: false },
      { id: 'fin9', name: 'Plumbing fixtures installed', done: false },
      { id: 'fin10', name: 'Wall putty & primer coat', done: false },
      { id: 'fin11', name: 'Interior paint — emulsion coats', done: false },
      { id: 'fin12', name: 'Exterior paint / texture coat', done: false },
    ],
  },
  {
    id: 'exterior', name: 'Exterior & Landscape', icon: '🌿', color: '#00bcd4', durationWeeks: 3,
    tasks: [
      { id: 'ex1', name: 'Compound wall construction', done: false },
      { id: 'ex2', name: 'Main gate installation', done: false },
      { id: 'ex3', name: 'Driveway / parking area', done: false },
      { id: 'ex4', name: 'Garden & landscape development', done: false },
      { id: 'ex5', name: 'Outdoor lighting installation', done: false },
    ],
  },
  {
    id: 'handover', name: 'Handover & Occupancy', icon: '🔑', color: '#f44336', durationWeeks: 1,
    tasks: [
      { id: 'h1', name: 'Final electrical inspection (Electricity board)', done: false, critical: true },
      { id: 'h2', name: 'Occupancy certificate (OC) obtained', done: false, critical: true },
      { id: 'h3', name: 'Water connection & sanitation test', done: false, critical: true },
      { id: 'h4', name: 'Final snag list cleared', done: false },
      { id: 'h5', name: 'Handover document & drawings', done: false },
    ],
  },
]

// ─── Sub-components ─────────────────────────────────────────────────────────────
function TaskTrackerTab() {
  const [stages, setStages] = useState<Stage[]>(STAGES)

  const toggleTask = (stageId: string, taskId: string) => {
    setStages(s => s.map(stage =>
      stage.id === stageId
        ? { ...stage, tasks: stage.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
        : stage
    ))
  }

  const { totalTasks, doneTasks, overallPct } = useMemo(() => {
    const total = stages.reduce((s, st) => s + st.tasks.length, 0)
    const done = stages.reduce((s, st) => s + st.tasks.filter(t => t.done).length, 0)
    return { totalTasks: total, doneTasks: done, overallPct: Math.round((done / total) * 100) }
  }, [stages])

  const incompleteCritical = stages.flatMap(st =>
    st.tasks.filter(t => t.critical && !t.done).map(t => ({ stage: st.name, task: t.name }))
  ).slice(0, 4)

  return (
    <Grid container spacing={3}>
      {/* Overall Progress */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h6" fontWeight={700}>Overall Construction Progress</Typography>
            <Chip label={`${doneTasks} / ${totalTasks} tasks`} color="primary" />
          </Box>
          <LinearProgress variant="determinate" value={overallPct} sx={{ height: 12, borderRadius: 6, mb: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">0%</Typography>
            <Typography variant="h5" fontWeight={800} color="primary.main">{overallPct}%</Typography>
            <Typography variant="body2" color="text.secondary">100%</Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Critical Alerts */}
      {incompleteCritical.length > 0 && (
        <Grid item xs={12}>
          <Alert severity="warning" icon={<Warning />}>
            <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Pending Critical Tasks</Typography>
            {incompleteCritical.map(c => (
              <Typography key={c.task} variant="body2">• [{c.stage}] {c.task}</Typography>
            ))}
          </Alert>
        </Grid>
      )}

      {/* Stage Checklists */}
      <Grid item xs={12}>
        {stages.map(stage => {
          const donePct = Math.round((stage.tasks.filter(t => t.done).length / stage.tasks.length) * 100)
          return (
            <Accordion key={stage.id} sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, overflow: 'hidden' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} flex={1} mr={2}>
                  <Typography fontSize="1.5rem">{stage.icon}</Typography>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{stage.name}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress variant="determinate" value={donePct}
                        sx={{ flex: 1, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: stage.color } }} />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>{donePct}%</Typography>
                    </Box>
                  </Box>
                  <Chip label={`${stage.tasks.filter(t => t.done).length}/${stage.tasks.length}`} size="small"
                    sx={{ bgcolor: `${stage.color}22`, color: stage.color, fontWeight: 700 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {stage.tasks.map(task => (
                    <Grid item xs={12} sm={6} key={task.id}>
                      <Box display="flex" alignItems="center" gap={1}
                        sx={{ p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}
                        onClick={() => toggleTask(stage.id, task.id)}>
                        {task.done
                          ? <CheckCircle sx={{ color: 'success.main', fontSize: 20, flexShrink: 0 }} />
                          : <RadioButtonUnchecked sx={{ color: task.critical ? 'error.main' : 'text.disabled', fontSize: 20, flexShrink: 0 }} />}
                        <Typography variant="body2" sx={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'text.disabled' : 'text.primary' }}>
                          {task.name}
                        </Typography>
                        {task.critical && !task.done && <Chip label="Critical" size="small" color="error" sx={{ ml: 'auto', height: 18, fontSize: '0.65rem' }} />}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Grid>
    </Grid>
  )
}

function TimelineTab() {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [scale, setScale] = useState<'weeks' | 'months'>('months')

  const stagesWithDates = useMemo(() => {
    let cursor = new Date(startDate)
    return STAGES.map(s => {
      const start = new Date(cursor)
      cursor.setDate(cursor.getDate() + s.durationWeeks * 7)
      const end = new Date(cursor)
      return { ...s, start, end }
    })
  }, [startDate])

  const totalWeeks = STAGES.reduce((s, st) => s + st.durationWeeks, 0)
  const totalMonths = Math.ceil(totalWeeks / 4.33)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box display="flex" gap={2} alignItems="center" mb={3} flexWrap="wrap">
            <TextField label="Construction Start Date" type="date" size="small"
              value={startDate} onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }} />
            <Chip label={`Total Duration: ~${totalMonths} months`} color="primary" />
            <Chip label={`~${totalWeeks} weeks`} variant="outlined" />
          </Box>

          {/* Gantt-style timeline */}
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 600 }}>
              {stagesWithDates.map((s, i) => {
                const pct = (s.durationWeeks / totalWeeks) * 100
                const offset = (stagesWithDates.slice(0, i).reduce((sum, st) => sum + st.durationWeeks, 0) / totalWeeks) * 100
                return (
                  <Box key={s.id} mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography fontSize="1rem">{s.icon}</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 200 }}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} →{' '}
                        {s.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'relative', height: 28, bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden' }}>
                      <Box
                        component={motion.div}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        sx={{
                          position: 'absolute', left: `${offset}%`, height: '100%',
                          bgcolor: s.color, borderRadius: 2, display: 'flex', alignItems: 'center', px: 1,
                          opacity: 0.85,
                        }}
                      >
                        <Typography variant="caption" color="white" fontWeight={700} noWrap>
                          {s.durationWeeks}w
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Stage Duration Summary</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Stage</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell align="right">Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stagesWithDates.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Box display="flex" gap={1} alignItems="center">
                      <Typography>{s.icon}</Typography>
                      <Typography variant="body2">{s.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="caption">{s.start.toLocaleDateString('en-IN')}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{s.end.toLocaleDateString('en-IN')}</Typography></TableCell>
                  <TableCell align="right">
                    <Chip label={`${s.durationWeeks}w`} size="small"
                      sx={{ bgcolor: `${s.color}22`, color: s.color, fontWeight: 700 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Key Milestones</Typography>
          <Stack spacing={2}>
            {[
              { label: 'Foundation Complete', stage: 1, icon: '🏗️' },
              { label: 'Structure Complete', stage: 2, icon: '🏛️' },
              { label: 'MEP Rough-In Done', stage: 3, icon: '⚡' },
              { label: 'Finishing Stage', stage: 4, icon: '🎨' },
              { label: 'Handover / Occupancy', stage: 6, icon: '🔑' },
            ].map(m => {
              const date = stagesWithDates[m.stage]?.end
              return (
                <Box key={m.label} display="flex" alignItems="center" gap={2}
                  p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography fontSize="1.4rem">{m.icon}</Typography>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>{m.label}</Typography>
                  </Box>
                  {date && (
                    <Chip label={date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      size="small" color="primary" variant="outlined" />
                  )}
                </Box>
              )
            })}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function ConstructionManagerPage() {
  const [tab, setTab] = useState(0)

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Construction Manager</Typography>
        <Typography variant="body1" color="text.secondary">
          Track construction stages, manage tasks, and visualise the project timeline.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {[
            { label: 'Task Tracker', icon: <Assignment /> },
            { label: 'Timeline', icon: <Timeline /> },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start"
              sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>

      <Box mt={3}>
        {tab === 0 && <TaskTrackerTab />}
        {tab === 1 && <TimelineTab />}
      </Box>
    </Box>
  )
}
