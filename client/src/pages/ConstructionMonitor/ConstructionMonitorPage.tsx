// @ts-nocheck
import { useState } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, Chip, LinearProgress, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'
import { useProjectGeo } from '../../hooks/useProjectGeo'
import ProjectMap from '../../components/ui/ProjectMap'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function buildBudgetVsActual(budget: number) {
  const stages = [
    { stage: 'Foundation', planned: 12, actual: 11 },
    { stage: 'Structure', planned: 20, actual: 22 },
    { stage: 'Masonry', planned: 8, actual: 8 },
    { stage: 'MEP', planned: 14, actual: 0 },
    { stage: 'Finishes', planned: 13, actual: 0 },
    { stage: 'Ext. Works', planned: 5, actual: 0 },
  ]
  return stages.map((s) => ({
    ...s,
    plannedAmt: Math.round((s.planned / 100) * budget),
    actualAmt: Math.round((s.actual / 100) * budget),
  }))
}

export default function ConstructionMonitorPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const { geo, loading: geoLoading } = useProjectGeo(project?.location)

  if (isLoading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress size={20} /></Box>
  if (!project) return <Alert severity="error">Project not found.</Alert>

  const budget = project.budget || 0
  const budgetData = buildBudgetVsActual(budget)
  const currency = project.currency || '₹'
  const spentPct = 41
  const spentAmt = Math.round(budget * spentPct / 100)

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Construction Monitor</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {project.location || 'No location'}</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Status', project.status || '–'], ['Progress', `${spentPct}%`], ['Spent', budget ? `${currency} ${spentAmt.toLocaleString()}` : '–'], ['Remaining', budget ? `${currency} ${(budget - spentAmt).toLocaleString()}` : '–']].map(([k, v]) => (
          <Grid item xs={6} md={3} key={k}>
            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{k}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{v}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Overall Construction Progress</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{spentPct}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={spentPct} sx={{ height: 8, borderRadius: 4 }} />
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['📍 Site Map', '💰 Budget vs Actual', '📋 Stage Status'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!project.location && <Alert severity="info">Add a project location to see the construction site on the map.</Alert>}
          {project.location && geoLoading && <Box sx={{ display: 'flex', gap: 2, py: 4, justifyContent: 'center' }}><CircularProgress size={18} /><Typography variant="body2" color="text.secondary">Locating site…</Typography></Box>}
          {geo && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}><strong>Site location:</strong> {geo.displayName}</Alert>
              <ProjectMap lat={geo.lat} lng={geo.lng} label={`${project.projectName || project.title} — Construction Site`} height={420} />
            </>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!budget ? (
            <Alert severity="info">Set a project budget to compare planned vs actual spend.</Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>Comparison of planned vs actual expenditure by construction stage.</Alert>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="plannedAmt" name="Planned" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualAmt" name="Actual" fill="#FF6584" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {budgetData.map((row) => (
            <Card key={row.stage} sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.stage}</Typography>
                <Chip
                  label={row.actual === 0 ? 'Pending' : row.actual >= row.planned ? 'On Budget' : 'Under Budget'}
                  size="small"
                  color={row.actual === 0 ? 'default' : row.actual <= row.planned ? 'success' : 'error'}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Planned: {row.planned}%</Typography>
                <Typography variant="caption" color="text.secondary">Actual: {row.actual}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={row.actual > 0 ? (row.actual / row.planned) * 100 : 0} sx={{ height: 5, borderRadius: 3 }} />
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
