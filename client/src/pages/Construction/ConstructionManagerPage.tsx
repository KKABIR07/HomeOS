// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Chip, LinearProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel } from '@mui/material'
import { motion } from 'framer-motion'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

function buildStages(project: any) {
  const isCommercial = project?.houseType === 'commercial'
  const floors = project?.floors || 1
  const baseStages = [
    { name: 'Site Survey & Soil Test', weeks: 2, tasks: ['Topographic survey', 'Soil bearing capacity test', 'Utility marking', 'Boundary demarcation'] },
    { name: 'Foundation', weeks: floors > 2 ? 6 : 4, tasks: ['Excavation', 'PCC (Plain Cement Concrete)', 'Reinforcement (rebar)', 'Formwork & concrete pour', 'Curing (7 days min)'] },
    { name: 'Structural Frame', weeks: 4 * floors, tasks: Array.from({ length: floors }, (_, i) => `Floor ${i + 1} columns & slab`).concat(['Staircase construction', 'Shear walls (if needed)']) },
    { name: 'MEP Rough-In', weeks: 3, tasks: ['Electrical conduit & wiring rough-in', 'Plumbing pipes', 'HVAC ductwork', 'Data/internet conduits'] },
    { name: 'Brick & Masonry', weeks: 3, tasks: ['External brick/block walls', 'Internal partition walls', 'Door/window frames', 'Lintel beams'] },
    { name: 'Roofing', weeks: 2, tasks: ['Roof slab pour', 'Waterproofing membrane', 'Insulation layer', 'Parapet walls'] },
    { name: 'Interior Finishes', weeks: 5, tasks: ['Internal plastering', 'Floor tiling', 'Wall tiling (bathrooms/kitchen)', 'False ceiling', 'Painting (primer + 2 coats)'] },
    { name: 'Doors, Windows & Glazing', weeks: 2, tasks: ['Door frames & shutters', 'Window grills & shutters', 'Glazing & sealing', 'Hardware fitting'] },
    { name: 'MEP Final Fix', weeks: 2, tasks: ['Switch plates & outlets', 'Fixtures & fittings', 'AC units & ducting', 'Sanitary fixtures', 'Fire alarm & CCTV'] },
    { name: 'External Works', weeks: 2, tasks: ['External plastering & paint', 'Compound wall', 'Gate & driveway', 'Landscaping', 'Drainage channels'] },
    ...(isCommercial ? [{ name: 'Commercial Fit-Out', weeks: 4, tasks: ['Raised flooring', 'Modular partitions', 'Signage', 'Elevator installation', 'Loading dock'] }] : []),
    { name: 'Handover', weeks: 1, tasks: ['Punch list review', 'Snag fixing', 'As-built drawings', 'Occupation certificate', 'Final cleaning'] },
  ]
  return baseStages
}

export default function ConstructionManagerPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const stages = useMemo(() => buildStages(project), [project])

  const totalTasks = useMemo(() => stages.reduce((a, s) => a + s.tasks.length, 0), [stages])
  const doneTasks = Object.values(checked).filter(Boolean).length
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  const ganttData = useMemo(() => {
    let week = 0
    return stages.map((s) => {
      const start = week
      week += s.weeks
      return { name: s.name.substring(0, 20), start, duration: s.weeks, end: week }
    })
  }, [stages])

  const toggleTask = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))

  if (isLoading || !project) return (
    <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading project…</Typography></Box>
  )

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Construction Management</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · {project.floors || 1} floor(s) · {project.houseType}</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Total Tasks', totalTasks], ['Completed', doneTasks], ['Remaining', totalTasks - doneTasks], ['Progress', `${progress}%`]].map(([k, v]) => (
          <Grid item xs={6} md={3} key={k}>
            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{k}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{v}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Overall Progress</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{progress}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['✅ Task Tracker', '📅 Timeline'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {stages.map((stage, si) => {
            const stageDone = stage.tasks.filter((_, ti) => checked[`${si}-${ti}`]).length
            return (
              <Accordion key={si} sx={{ mb: 1, borderRadius: '12px !important', border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' }, overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{stage.name}</Typography>
                    <Chip label={`${stage.weeks}w`} size="small" sx={{ fontSize: '0.7rem' }} />
                    <Chip label={`${stageDone}/${stage.tasks.length}`} size="small" color={stageDone === stage.tasks.length ? 'success' : 'default'} sx={{ fontSize: '0.7rem' }} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <LinearProgress variant="determinate" value={stage.tasks.length ? (stageDone / stage.tasks.length) * 100 : 0} sx={{ mb: 1.5, height: 4, borderRadius: 2 }} />
                  <Grid container spacing={1}>
                    {stage.tasks.map((task, ti) => (
                      <Grid item xs={12} sm={6} key={ti}>
                        <FormControlLabel
                          control={<Checkbox checked={!!checked[`${si}-${ti}`]} onChange={() => toggleTask(`${si}-${ti}`)} size="small" />}
                          label={<Typography variant="body2" sx={{ textDecoration: checked[`${si}-${ti}`] ? 'line-through' : 'none', color: checked[`${si}-${ti}`] ? 'text.disabled' : 'text.primary' }}>{task}</Typography>}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          <Alert severity="info" sx={{ mb: 3 }}>Total estimated duration: <strong>{ganttData[ganttData.length - 1]?.end ?? 0} weeks</strong> for a {project.floors}-floor {project.houseType} project.</Alert>
          <ResponsiveContainer width="100%" height={Math.max(300, stages.length * 36)}>
            <BarChart data={ganttData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: 'Weeks', position: 'insideBottom', offset: -2 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
              <Tooltip formatter={(v, n) => [v, n === 'start' ? 'Start Week' : 'Duration (weeks)']} />
              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="duration" stackId="a" fill="#6C63FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  )
}
