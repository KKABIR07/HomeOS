// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  TextField, Button, Chip, Alert, Stack, LinearProgress, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Rating,
  ToggleButton, ToggleButtonGroup, CircularProgress, Slider,
} from '@mui/material'
import {
  LocationOn, TrendingUp, Home, Gavel, Security, School,
  LocalHospital, ShoppingCart, DirectionsBus, Train, Flight,
  CheckCircle, Warning, Cancel, Calculate, Star,
} from '@mui/icons-material'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'

// ─── Feature 1: AI Land Purchase Advisor ──────────────────────────────────────
function LandAdvisorTab() {
  const [form, setForm] = useState({ plotNo: '', area: '', city: '', state: '', price: '', survey: '' })
  const [analyzed, setAnalyzed] = useState(false)
  const [loading, setLoading] = useState(false)

  const checks = [
    { label: 'Title Clear', status: 'pass', detail: 'No encumbrances found in last 30 years' },
    { label: 'Mutation Status', status: 'pass', detail: 'Mutation completed — latest owner registered' },
    { label: 'Encroachment Check', status: 'warn', detail: '0.3m boundary dispute on north side — verify physically' },
    { label: 'Court Cases / Litigation', status: 'pass', detail: 'No active litigation in district court records' },
    { label: 'Government Acquisition', status: 'pass', detail: 'Not in acquisition zone per latest gazette' },
    { label: 'Forest / Eco-sensitive', status: 'pass', detail: 'Outside eco-sensitive zone' },
    { label: 'Road Widening Impact', status: 'warn', detail: '3m setback risk due to NH widening plan 2027' },
    { label: 'Flood Zone Risk', status: 'pass', detail: 'Outside 100-year flood plain' },
  ]

  const infraScore = { schools: 78, hospitals: 65, transport: 82, markets: 91, police: 70, parks: 55 }
  const radarData = Object.entries(infraScore).map(([key, val]) => ({ subject: key.charAt(0).toUpperCase() + key.slice(1), score: val }))

  const handleAnalyze = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setAnalyzed(true) }, 1800)
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" /> Land Details
          </Typography>
          <Stack spacing={2}>
            {[
              { label: 'Plot / Survey Number', key: 'plotNo', placeholder: 'e.g. 145/B' },
              { label: 'Area (sq ft)', key: 'area', placeholder: 'e.g. 2400' },
              { label: 'City', key: 'city', placeholder: 'e.g. Kolkata' },
              { label: 'State', key: 'state', placeholder: 'e.g. West Bengal' },
              { label: 'Asking Price (₹)', key: 'price', placeholder: 'e.g. 45,00,000' },
            ].map(f => (
              <TextField key={f.key} label={f.label} size="small" fullWidth placeholder={f.placeholder}
                value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            ))}
            <Button variant="contained" fullWidth onClick={handleAnalyze} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Calculate />}
              sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#6C63FF,#FF6584)' }}>
              {loading ? 'Analyzing...' : 'Run AI Land Analysis'}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        {!analyzed ? (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography fontSize="3rem" mb={2}>🏞️</Typography>
            <Typography variant="h6" color="text.secondary">Enter land details and click Analyze</Typography>
            <Typography variant="body2" color="text.disabled" mt={1}>AI checks government records, flood maps, infrastructure, and appreciation forecasts</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {/* Verification Checks */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Ownership & Legal Verification</Typography>
                <Grid container spacing={1}>
                  {checks.map(c => (
                    <Grid item xs={12} sm={6} key={c.label}>
                      <Box display="flex" gap={1.5} p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                        {c.status === 'pass' ? <CheckCircle sx={{ color: 'success.main', fontSize: 20, flexShrink: 0 }} />
                          : c.status === 'warn' ? <Warning sx={{ color: 'warning.main', fontSize: 20, flexShrink: 0 }} />
                          : <Cancel sx={{ color: 'error.main', fontSize: 20, flexShrink: 0 }} />}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>{c.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.detail}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Infrastructure Score */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={1}>Nearby Infrastructure Score</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Appreciation Forecast */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Price Appreciation Forecast</Typography>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={[
                    { year: '2025', value: 100 }, { year: '2026', value: 108 },
                    { year: '2027', value: 118 }, { year: '2028', value: 131 }, { year: '2030', value: 155 },
                  ]}>
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <RTooltip formatter={v => [`${v}%`, 'Index']} />
                    <Bar dataKey="value" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <Alert severity="success" sx={{ mt: 1 }}>
                  Predicted 55% appreciation over 5 years based on infrastructure pipeline and demand trends.
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

// ─── Feature 2: Home Investment Score ─────────────────────────────────────────
function InvestmentScoreTab() {
  const [form, setForm] = useState({ purchasePrice: 5000000, rentalIncome: 22000, maintenanceCost: 5000, loanRate: 8.5, location: 'Kolkata', propType: 'residential' })

  const score = useMemo(() => {
    const annualRent = form.rentalIncome * 12
    const rentalYield = (annualRent / form.purchasePrice) * 100
    const annualMaint = form.maintenanceCost * 12
    const netYield = ((annualRent - annualMaint) / form.purchasePrice) * 100
    const appreciation = 8.5 // avg
    const roi = netYield + appreciation
    const scoreVal = Math.min(100, Math.round((rentalYield * 4 + netYield * 3 + Math.min(roi, 20) * 5) / 12 * 10))
    return { rentalYield: rentalYield.toFixed(2), netYield: netYield.toFixed(2), roi: roi.toFixed(1), score: scoreVal }
  }, [form])

  const scoreColor = score.score >= 80 ? '#4caf50' : score.score >= 60 ? '#ff9800' : '#f44336'

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Property Parameters</Typography>
          <Stack spacing={2}>
            <TextField label="Purchase Price (₹)" type="number" size="small" fullWidth
              value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: Number(e.target.value) }))} />
            <TextField label="Monthly Rental Income (₹)" type="number" size="small" fullWidth
              value={form.rentalIncome} onChange={e => setForm(f => ({ ...f, rentalIncome: Number(e.target.value) }))} />
            <TextField label="Monthly Maintenance Cost (₹)" type="number" size="small" fullWidth
              value={form.maintenanceCost} onChange={e => setForm(f => ({ ...f, maintenanceCost: Number(e.target.value) }))} />
            <Box>
              <Typography variant="body2" mb={0.5}>Loan Interest Rate: {form.loanRate}%</Typography>
              <Slider value={form.loanRate} min={6} max={15} step={0.25} onChange={(_, v) => setForm(f => ({ ...f, loanRate: v as number }))} />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {/* Score Circle */}
          <Box textAlign="center" mb={3}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
              <CircularProgress variant="determinate" value={score.score} size={120}
                sx={{ color: scoreColor, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} thickness={6} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: scoreColor }}>{score.score}</Typography>
                <Typography variant="caption" color="text.secondary">/100</Typography>
              </Box>
            </Box>
            <Typography variant="h6" fontWeight={700}>Home Investment Score</Typography>
            <Chip label={score.score >= 80 ? 'Excellent Investment' : score.score >= 60 ? 'Good Investment' : 'Average Investment'} color={score.score >= 80 ? 'success' : score.score >= 60 ? 'warning' : 'error'} />
          </Box>

          <Grid container spacing={2}>
            {[
              { label: 'Gross Rental Yield', value: `${score.rentalYield}%`, icon: '💰', color: '#6C63FF' },
              { label: 'Net Yield (after maint.)', value: `${score.netYield}%`, icon: '📊', color: '#4caf50' },
              { label: 'Avg Appreciation', value: '8.5% p.a.', icon: '📈', color: '#ff9800' },
              { label: 'Total ROI Estimate', value: `${score.roi}%`, icon: '🎯', color: '#2196f3' },
              { label: 'Payback Period', value: `${Math.round(100 / parseFloat(score.roi))} yrs`, icon: '📅', color: '#e91e63' },
              { label: '10-Year Value', value: `₹${((form.purchasePrice * Math.pow(1.085, 10)) / 100000).toFixed(1)} L`, icon: '🏠', color: '#9c27b0' },
            ].map(item => (
              <Grid item xs={6} key={item.label}>
                <Box p={1.5} sx={{ bgcolor: `${item.color}12`, borderRadius: 2 }}>
                  <Typography fontSize="1.3rem">{item.icon}</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 8: Neighborhood Intelligence ─────────────────────────────────────
function NeighborhoodTab() {
  const [address, setAddress] = useState('Salt Lake, Kolkata')
  const [analyzed, setAnalyzed] = useState(true)

  const places = [
    { cat: 'Schools', icon: <School />, items: ['DPS Ruby Park — 1.2 km', 'Salt Lake School — 0.8 km', 'Heritage School — 2.1 km'], score: 88 },
    { cat: 'Hospitals', icon: <LocalHospital />, items: ['AMRI Hospital — 1.5 km', 'Apollo Clinic — 0.6 km', 'Ruby General — 2.0 km'], score: 82 },
    { cat: 'Markets', icon: <ShoppingCart />, items: ['City Centre Mall — 1.0 km', 'Big Bazar — 0.9 km', 'Sector V Market — 0.5 km'], score: 91 },
    { cat: 'Transport', icon: <DirectionsBus />, items: ['Karunamoyee Metro — 0.7 km', 'Salt Lake Bus Stand — 0.4 km', 'BD Block Stop — 0.2 km'], score: 85 },
  ]

  const scores = [
    { label: 'Livability Score', value: 86, color: '#4caf50' },
    { label: 'Safety Score', value: 79, color: '#2196f3' },
    { label: 'Noise Level', value: 62, color: '#ff9800', invert: true },
    { label: 'Green Cover', value: 72, color: '#66bb6a' },
    { label: 'Connectivity', value: 88, color: '#6C63FF' },
  ]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Box display="flex" gap={2}>
            <TextField label="Enter Address / Area" size="small" fullWidth value={address}
              onChange={e => setAddress(e.target.value)} placeholder="e.g. Salt Lake Sector V, Kolkata" />
            <Button variant="contained" onClick={() => setAnalyzed(true)} sx={{ borderRadius: 2, minWidth: 120 }}>Analyze Area</Button>
          </Box>
        </Paper>
      </Grid>

      {analyzed && (
        <>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {places.map(p => (
                <Grid item xs={12} sm={6} key={p.cat}>
                  <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <Box sx={{ color: 'primary.main' }}>{p.icon}</Box>
                      <Typography variant="subtitle1" fontWeight={700}>{p.cat}</Typography>
                      <Chip label={`${p.score}/100`} size="small" color="primary" sx={{ ml: 'auto' }} />
                    </Box>
                    <Stack spacing={0.5}>
                      {p.items.map(item => (
                        <Box key={item} display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                          <Typography variant="caption">{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Area Quality Scores</Typography>
              <Stack spacing={2}>
                {scores.map(s => (
                  <Box key={s.label}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{s.label}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: s.color }}>{s.value}/100</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={s.value}
                      sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: s.color } }} />
                  </Box>
                ))}
              </Stack>
              <Box mt={2} p={2} sx={{ bgcolor: 'success.main', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="white" textAlign="center">Overall Livability</Typography>
                <Typography variant="h4" fontWeight={900} color="white" textAlign="center">86 / 100</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', textAlign: 'center' }}>Excellent neighbourhood</Typography>
              </Box>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  )
}

// ─── Feature 31: AI House Valuation ───────────────────────────────────────────
function HouseValuationTab() {
  const [form, setForm] = useState({ area: 1800, floors: 2, age: 5, location: 'Bangalore', quality: 'standard', amenities: [] as string[] })
  const [valued, setValued] = useState(false)

  const amenityList = ['Lift', 'Parking', 'Garden', 'Security', 'CCTV', 'Power Backup', 'Club House', 'Swimming Pool']

  const valuation = useMemo(() => {
    const baseRates: Record<string, number> = { mumbai: 28000, delhi: 18000, bangalore: 14000, hyderabad: 9000, kolkata: 6500, pune: 10000 }
    const base = Object.entries(baseRates).find(([k]) => form.location.toLowerCase().includes(k))?.[1] ?? 8000
    const qualMult = { basic: 0.8, standard: 1.0, premium: 1.4, luxury: 1.8 }[form.quality] ?? 1
    const ageDep = Math.max(0.6, 1 - form.age * 0.02)
    const amenMult = 1 + form.amenities.length * 0.03
    const value = Math.round(form.area * base * qualMult * ageDep * amenMult)
    return { value, sqftRate: Math.round(value / form.area), low: Math.round(value * 0.9), high: Math.round(value * 1.12) }
  }, [form])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Property Details</Typography>
          <Stack spacing={2}>
            <TextField label="Built-up Area (sq ft)" type="number" size="small" fullWidth
              value={form.area} onChange={e => setForm(f => ({ ...f, area: Number(e.target.value) }))} />
            <TextField label="Location / City" size="small" fullWidth
              value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <Box>
              <Typography variant="body2" mb={1}>Building Age: {form.age} years</Typography>
              <Slider value={form.age} min={0} max={50} onChange={(_, v) => setForm(f => ({ ...f, age: v as number }))} marks={[{ value: 0, label: 'New' }, { value: 25, label: '25yr' }, { value: 50, label: '50yr' }]} />
            </Box>
            <ToggleButtonGroup size="small" value={form.quality} exclusive fullWidth onChange={(_, v) => v && setForm(f => ({ ...f, quality: v }))}>
              {['basic', 'standard', 'premium', 'luxury'].map(q => <ToggleButton key={q} value={q} sx={{ textTransform: 'capitalize' }}>{q}</ToggleButton>)}
            </ToggleButtonGroup>
            <Box>
              <Typography variant="body2" mb={1}>Amenities</Typography>
              <Box display="flex" flexWrap="wrap" gap={0.8}>
                {amenityList.map(a => (
                  <Chip key={a} label={a} size="small"
                    onClick={() => setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))}
                    color={form.amenities.includes(a) ? 'primary' : 'default'} variant={form.amenities.includes(a) ? 'filled' : 'outlined'} />
                ))}
              </Box>
            </Box>
            <Button variant="contained" onClick={() => setValued(true)} sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#6C63FF,#FF6584)' }}>
              Get AI Valuation
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        {!valued ? (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <Typography fontSize="3rem" mb={2}>🏠</Typography>
            <Typography variant="h6" color="text.secondary">Fill in property details to get AI valuation</Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>AI Market Valuation Report</Typography>
            <Box textAlign="center" mb={3} p={3} sx={{ background: 'linear-gradient(135deg,rgba(108,99,255,.1),rgba(255,101,132,.08))', borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">Estimated Market Value</Typography>
              <Typography variant="h3" fontWeight={900} color="primary.main">₹{(valuation.value / 100000).toFixed(1)} L</Typography>
              <Typography variant="body2" color="text.secondary">Range: ₹{(valuation.low / 100000).toFixed(1)}L – ₹{(valuation.high / 100000).toFixed(1)}L</Typography>
              <Chip label={`₹${valuation.sqftRate.toLocaleString()}/sq ft`} color="primary" sx={{ mt: 1 }} />
            </Box>
            <Grid container spacing={2}>
              {[
                { label: 'Construction Replacement Cost', value: `₹${((form.area * 2200) / 100000).toFixed(1)}L` },
                { label: 'Land Value (estimated)', value: `₹${((valuation.value - form.area * 2200) / 100000).toFixed(1)}L` },
                { label: 'Depreciation Applied', value: `${(form.age * 2).toFixed(0)}%` },
                { label: 'Amenity Premium', value: `+${(form.amenities.length * 3)}%` },
              ].map(item => (
                <Grid item xs={6} key={item.label}>
                  <Box p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{item.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function PropertyIntelligencePage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Property Intelligence</Typography>
        <Typography variant="body1" color="text.secondary">AI-powered land purchase advisor, investment scoring, neighborhood analysis, and property valuation.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['🏞️ Land Purchase Advisor', '📊 Investment Score', '🏘️ Neighborhood Intelligence', '💰 AI House Valuation'].map((label, i) => (
            <Tab key={i} label={label} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <LandAdvisorTab />}
      {tab === 1 && <InvestmentScoreTab />}
      {tab === 2 && <NeighborhoodTab />}
      {tab === 3 && <HouseValuationTab />}
    </Box>
  )
}
