// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Divider, LinearProgress, Alert,
} from '@mui/material'
import { Calculate, Download, PieChart } from '@mui/icons-material'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STYLES = ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist']

const COLORS = ['#6C63FF', '#FF6584', '#42A5F5', '#66BB6A', '#FFB74D', '#EF5350', '#AB47BC']

interface CostEstimate {
  summary: { plotArea: number; builtUpArea: number; carpetArea: number; houseStyle: string }
  breakdown: {
    construction: { items: Record<string, number>; total: number }
    materials: { items: Record<string, { cost: number; unit: string }>; total: number }
    labor: { items: Record<string, { cost: number; days: number }>; total: number }
    interior: { total: number }
    landscaping: { total: number }
    architectFee: { total: number }
    contingency: { total: number }
  }
  totals: { grandTotal: number; costPerSqft: number; construction: number; materials: number; labor: number; interior: number }
  timeline: { realistic: number; phases: { phase: string; duration: string }[] }
  budgetStatus: null | { withinBudget: boolean; difference: number; percentageDiff: number }
}

export default function CostEstimatorPage() {
  const [form, setForm] = useState({
    plotWidth: '30', plotLength: '40', floors: '1',
    houseStyle: 'modern', location: '', budget: '',
  })
  const [estimate, setEstimate] = useState<CostEstimate | null>(null)

  const mutation = useMutation({
    mutationFn: async () => (await api.post('/cost-estimate', form)).data.estimate,
    onSuccess: (data) => { setEstimate(data); toast.success('Cost estimate calculated!') },
    onError: () => toast.error('Failed to calculate estimate'),
  })

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

  const pieData = estimate ? [
    { name: 'Construction', value: estimate.totals.construction },
    { name: 'Materials', value: estimate.totals.materials },
    { name: 'Labor', value: estimate.totals.labor },
    { name: 'Interior', value: estimate.totals.interior },
    { name: 'Architect Fee', value: estimate.breakdown.architectFee.total },
    { name: 'Contingency', value: estimate.breakdown.contingency.total },
  ] : []

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        <Calculate sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
        Construction Cost Estimator
      </Typography>
      <Typography color="text.secondary" mb={3}>Get detailed BOQ and cost breakdown for your house project</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Project Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Width (ft)" type="number" value={form.plotWidth}
                  onChange={(e) => setForm({ ...form, plotWidth: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Length (ft)" type="number" value={form.plotLength}
                  onChange={(e) => setForm({ ...form, plotLength: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" select label="Style" value={form.houseStyle}
                  onChange={(e) => setForm({ ...form, houseStyle: e.target.value })}>
                  {STYLES.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Floors" type="number" inputProps={{ min: 1, max: 10 }} value={form.floors}
                  onChange={(e) => setForm({ ...form, floors: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="City (optional)" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Mumbai" helperText="Affects cost multiplier" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Your Budget (₹, optional)" type="number" value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  InputProps={{ startAdornment: '₹' }} />
              </Grid>
            </Grid>
            <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }}
              onClick={() => mutation.mutate()} disabled={mutation.isPending}
              startIcon={mutation.isPending ? null : <Calculate />}>
              {mutation.isPending ? <LinearProgress sx={{ width: '100%' }} /> : 'Calculate Estimate'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {!estimate && !mutation.isPending && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400} gap={2}>
              <Calculate sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography color="text.secondary">Enter project details to get your estimate</Typography>
            </Box>
          )}

          {estimate && (
            <Stack spacing={3}>
              {/* Summary Cards */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2.5, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="primary">{fmt(estimate.totals.grandTotal)}</Typography>
                    <Typography variant="caption" color="text.secondary">Total Estimate</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>{fmt(estimate.totals.costPerSqft)}</Typography>
                    <Typography variant="caption" color="text.secondary">Per sq ft</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>{estimate.timeline.realistic}m</Typography>
                    <Typography variant="caption" color="text.secondary">Timeline</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {estimate.budgetStatus && (
                <Alert severity={estimate.budgetStatus.withinBudget ? 'success' : 'warning'}>
                  {estimate.budgetStatus.withinBudget
                    ? `Within budget! You have ${fmt(estimate.budgetStatus.difference)} to spare.`
                    : `Over budget by ${fmt(Math.abs(estimate.budgetStatus.difference))} (${Math.abs(estimate.budgetStatus.percentageDiff)}%)`}
                </Alert>
              )}

              {/* Pie Chart */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom><PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />Cost Distribution</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </RechartsPie>
                </ResponsiveContainer>
              </Paper>

              {/* Breakdown Table */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Detailed Breakdown</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { name: 'Construction', val: estimate.breakdown.construction.total },
                        { name: 'Materials', val: estimate.breakdown.materials.total },
                        { name: 'Labor', val: estimate.breakdown.labor.total },
                        { name: 'Interior', val: estimate.breakdown.interior.total },
                        { name: 'Landscaping', val: estimate.breakdown.landscaping.total },
                        { name: 'Architect Fee (5%)', val: estimate.breakdown.architectFee.total },
                        { name: 'Contingency (8%)', val: estimate.breakdown.contingency.total },
                      ].map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">{fmt(row.val)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'action.selected' }}>
                        <TableCell><strong>Grand Total</strong></TableCell>
                        <TableCell align="right"><strong>{fmt(estimate.totals.grandTotal)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Timeline */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Construction Timeline</Typography>
                <Stack spacing={1}>
                  {estimate.timeline.phases.map((phase, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={i + 1} size="small" color="primary" sx={{ width: 28, height: 28, borderRadius: '50%' }} />
                        <Typography variant="body2">{phase.phase}</Typography>
                      </Box>
                      <Chip label={phase.duration} size="small" variant="outlined" />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
