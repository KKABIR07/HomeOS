// @ts-nocheck
import { useState, useMemo } from 'react'
import { Box, Card, Typography, Tabs, Tab, Grid, Alert, LinearProgress, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProjects'

const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }
const COLORS = ['#6C63FF', '#FF6584', '#4FC3F7', '#81C784', '#FFB74D', '#F06292', '#4DD0E1', '#AED581']

function buildBOQ(project: any) {
  const area = project?.builtArea || project?.plotArea || 100
  const floors = project?.floors || 1
  const rate = project?.houseType === 'commercial' ? 2200 : 1600
  const budget = project?.budget || area * floors * rate

  const items = [
    { item: 'Site Preparation & Earthwork', pct: 2 },
    { item: 'Foundation (RCC)', pct: 12 },
    { item: 'Structural Concrete & Steel', pct: 20 },
    { item: 'Masonry & Brickwork', pct: 8 },
    { item: 'Roofing & Waterproofing', pct: 6 },
    { item: 'Internal Plastering', pct: 5 },
    { item: 'Flooring (tiles/marble)', pct: 8 },
    { item: 'Doors & Windows', pct: 6 },
    { item: 'Painting (interior + exterior)', pct: 4 },
    { item: 'Electrical Works', pct: 8 },
    { item: 'Plumbing & Sanitary', pct: 6 },
    { item: 'HVAC / Ventilation', pct: 4 },
    { item: 'False Ceiling & Carpentry', pct: 5 },
    { item: 'External Works & Landscaping', pct: 3 },
    { item: 'Contingency', pct: 3 },
  ]
  return items.map((i) => ({ ...i, amount: Math.round((i.pct / 100) * budget) }))
}

export default function FinanceHubPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState(0)
  const { data: project, isLoading } = useProject(id ?? '')

  const boq = useMemo(() => buildBOQ(project), [project])

  const cashflow = useMemo(() => {
    if (!project?.budget) return []
    const b = project.budget
    return [
      { month: 'M1', spent: Math.round(b * 0.05), cumulative: Math.round(b * 0.05) },
      { month: 'M3', spent: Math.round(b * 0.12), cumulative: Math.round(b * 0.17) },
      { month: 'M6', spent: Math.round(b * 0.20), cumulative: Math.round(b * 0.37) },
      { month: 'M9', spent: Math.round(b * 0.18), cumulative: Math.round(b * 0.55) },
      { month: 'M12', spent: Math.round(b * 0.20), cumulative: Math.round(b * 0.75) },
      { month: 'M15', spent: Math.round(b * 0.15), cumulative: Math.round(b * 0.90) },
      { month: 'M18', spent: Math.round(b * 0.10), cumulative: b },
    ]
  }, [project])

  if (isLoading || !project) return (
    <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Loading project…</Typography></Box>
  )

  const budget = project.budget || 0
  const currency = project.currency || '₹'
  const area = project.builtArea || project.plotArea || 0
  const costPerSqm = area && budget ? Math.round(budget / area) : 0

  return (
    <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Finance Hub</Typography>
        <Typography variant="body2" color="text.secondary">{project.projectName || project.title} · Budget: {budget ? `${currency} ${budget.toLocaleString()}` : 'Not set'}</Typography>
      </Box>

      {!budget && <Alert severity="warning" sx={{ mb: 3 }}>No budget set. Edit the project to add a budget and unlock finance analysis.</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ['Total Budget', budget ? `${currency} ${budget.toLocaleString()}` : '–'],
          ['Cost / m²', costPerSqm ? `${currency} ${costPerSqm.toLocaleString()}` : '–'],
          ['Built Area', area ? `${area} m²` : '–'],
          ['Project Type', project.houseType || '–'],
        ].map(([k, v]) => (
          <Grid item xs={6} md={3} key={k}>
            <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{k}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{v}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['📋 Bill of Quantities', '📈 Cash Flow', '🥧 Cost Breakdown'].map((l, i) => <Tab key={i} label={l} />)}
      </Tabs>

      {tab === 0 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!budget ? (
            <Alert severity="info">Set a project budget to generate the Bill of Quantities.</Alert>
          ) : (
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Bill of Quantities</Typography>
                <Chip label={`${currency} ${budget.toLocaleString()} total`} size="small" color="primary" />
              </Box>
              {boq.map((row, i) => (
                <Box key={i} sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>{row.item}</Typography>
                  <Box sx={{ width: 80, mr: 1 }}>
                    <LinearProgress variant="determinate" value={row.pct * 3} sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ width: 40 }}>{row.pct}%</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, width: 100, textAlign: 'right' }}>{currency} {row.amount.toLocaleString()}</Typography>
                </Box>
              ))}
            </Card>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!budget ? (
            <Alert severity="info">Set a project budget to see cash flow projections.</Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>Projected cash flow over 18-month construction period.</Alert>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashflow}>
                  <defs>
                    <linearGradient id="gradCum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="cumulative" name="Cumulative Spend" stroke="#6C63FF" fill="url(#gradCum)" strokeWidth={2} />
                  <Area type="monotone" dataKey="spent" name="Monthly Spend" stroke="#FF6584" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box component={motion.div} variants={fade} initial="hidden" animate="visible">
          {!budget ? (
            <Alert severity="info">Set a project budget to see cost breakdown.</Alert>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Cost Distribution</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={boq.slice(0, 8)} dataKey="amount" nameKey="item" cx="50%" cy="50%" outerRadius={100} label={({ pct }) => `${pct}%`} labelLine={false}>
                        {boq.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Top Cost Items</Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart layout="vertical" data={boq.sort((a, b) => b.amount - a.amount).slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                      <YAxis type="category" dataKey="item" tick={{ fontSize: 9 }} width={140} />
                      <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`} />
                      <Bar dataKey="amount" fill="#6C63FF" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}
