// @ts-nocheck
import { useState, useMemo } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Alert, Stack,
  LinearProgress, TextField, Button, Slider, ToggleButton,
  ToggleButtonGroup, Table, TableBody, TableCell, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, CircularProgress,
} from '@mui/material'
import {
  Gavel, Assignment, Shield, CheckCircle, Warning, Cancel,
  ExpandMore, Calculate, Download,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

// ─── Feature 6: Building Code Compliance Checker ──────────────────────────────
function CodeComplianceTab() {
  const [form, setForm] = useState({
    plotArea: 2400, builtArea: 3200, floors: 3, buildingHeight: 11.5,
    parkingSpaces: 2, setbackFront: 3.5, setbackRear: 2.5, setbackSide: 1.5,
    city: 'Kolkata', zoneType: 'residential',
  })

  const checks = useMemo(() => {
    const far = form.builtArea / form.plotArea
    const coverage = (form.builtArea / form.floors / form.plotArea) * 100

    const rules = [
      { label: 'FAR / FSI', current: far.toFixed(2), allowed: '1.5', pass: far <= 1.5, detail: `Calculated FAR: ${far.toFixed(2)} | Allowed: 1.5 for residential zone` },
      { label: 'Ground Coverage', current: `${coverage.toFixed(0)}%`, allowed: '40%', pass: coverage <= 40, detail: `Ground floor coverage: ${coverage.toFixed(0)}% | Max allowed: 40%` },
      { label: 'Front Setback', current: `${form.setbackFront}m`, allowed: '3m min', pass: form.setbackFront >= 3, detail: `Provided: ${form.setbackFront}m | Required minimum: 3.0m` },
      { label: 'Rear Setback', current: `${form.setbackRear}m`, allowed: '2m min', pass: form.setbackRear >= 2, detail: `Provided: ${form.setbackRear}m | Required: 2.0m` },
      { label: 'Side Setback', current: `${form.setbackSide}m`, allowed: '1.5m min', pass: form.setbackSide >= 1.5, detail: `Provided: ${form.setbackSide}m | Required: 1.5m per side` },
      { label: 'Building Height', current: `${form.buildingHeight}m`, allowed: '15m', pass: form.buildingHeight <= 15, detail: `Height: ${form.buildingHeight}m | Max without NOC: 15m` },
      { label: 'Parking Requirement', current: `${form.parkingSpaces} spaces`, allowed: `${Math.ceil(form.builtArea / 1000 * 1.5)} min`, pass: form.parkingSpaces >= Math.ceil(form.builtArea / 1000 * 1.5), detail: `1 space per 65m² carpet area required` },
      { label: 'Fire Safety', current: form.buildingHeight > 15 ? 'NOC Required' : 'Standard', allowed: 'Compliant', pass: form.buildingHeight <= 15, detail: form.buildingHeight > 15 ? 'Fire NOC from fire dept. mandatory above 15m' : 'Standard fire safety measures apply' },
    ]
    return rules
  }, [form])

  const passCount = checks.filter(c => c.pass).length
  const overallPass = passCount === checks.length

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Building Parameters</Typography>
          <Stack spacing={2}>
            {[
              { label: 'Plot Area (sq ft)', key: 'plotArea' },
              { label: 'Total Built-up Area (sq ft)', key: 'builtArea' },
              { label: 'Number of Floors', key: 'floors' },
              { label: 'Building Height (metres)', key: 'buildingHeight' },
              { label: 'Front Setback (metres)', key: 'setbackFront' },
              { label: 'Rear Setback (metres)', key: 'setbackRear' },
              { label: 'Side Setback (metres)', key: 'setbackSide' },
              { label: 'Parking Spaces', key: 'parkingSpaces' },
            ].map(f => (
              <TextField key={f.key} label={f.label} type="number" size="small" fullWidth
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>Compliance Results</Typography>
            <Chip label={`${passCount}/${checks.length} Passed`}
              color={overallPass ? 'success' : passCount >= 6 ? 'warning' : 'error'} />
          </Box>
          <Stack spacing={1.5}>
            {checks.map(c => (
              <Box key={c.label} display="flex" gap={2} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                {c.pass ? <CheckCircle sx={{ color: 'success.main', flexShrink: 0 }} /> : <Cancel sx={{ color: 'error.main', flexShrink: 0 }} />}
                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>{c.label}</Typography>
                    <Box display="flex" gap={1}>
                      <Chip label={`Provided: ${c.current}`} size="small" variant="outlined" />
                      <Chip label={`Limit: ${c.allowed}`} size="small" color={c.pass ? 'success' : 'error'} />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{c.detail}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
        {!overallPass && (
          <Alert severity="error">
            {checks.filter(c => !c.pass).length} violations found. Modify design to comply before submitting permit application.
          </Alert>
        )}
        {overallPass && <Alert severity="success">✅ All parameters comply with local building regulations. Ready for permit submission.</Alert>}
      </Grid>
    </Grid>
  )
}

// ─── Feature 7: AI Building Permit Assistant ──────────────────────────────────
function PermitAssistantTab() {
  const [state, setState] = useState('West Bengal')
  const [buildType, setBuildType] = useState('residential')

  const permits: Record<string, { docs: string[]; steps: string[]; fee: string; time: string }> = {
    residential: {
      docs: ['Building plan (3 copies, signed by licensed architect)', 'Site plan showing boundaries and setbacks', 'Ownership proof (Sale deed / Khata certificate)', 'NOC from fire department (if height > 15m)', 'Structural stability certificate from licensed engineer', 'Soil investigation report', 'Water and drainage NOC', 'Electricity connection NOC', 'Neighbourhood NOC (if applicable)', 'Affidavit of compliance with local bye-laws'],
      steps: ['Engage licensed architect', 'Prepare building plan per local bye-laws', 'Submit online at state portal + physical copies', 'Fee payment (based on built-up area)', 'Site inspection by municipality officer', 'Technical scrutiny (15–30 days)', 'Approval letter / building permit issued', 'Start construction after permit', 'Plinth inspection (at DPC level)', 'Completion certificate on project finish'],
      fee: '₹25–₹80 per sq ft (varies by city)',
      time: '30–90 days',
    },
    commercial: {
      docs: ['Approved building plan from registered architect', 'Fire NOC (mandatory)', 'Environment clearance (if >20,000 sq ft)', 'Lift NOC (if applicable)', 'Structural design by licensed structural engineer', 'Green building certificate (LEED/IGBC if required)', 'Trade licence', 'RERA registration'],
      steps: ['Pre-application meeting with municipality', 'Submit complete set of drawings', 'Fire department clearance (simultaneous)', 'Environment review (if applicable)', 'Pay scrutiny fee', 'Technical committee review', 'Commercial building permit issued', 'Commencement certificate'],
      fee: '₹100–₹250 per sq ft',
      time: '60–180 days',
    },
  }

  const data = permits[buildType]

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField label="State" size="small" value={state} onChange={e => setState(e.target.value)} sx={{ minWidth: 180 }} />
            <ToggleButtonGroup size="small" value={buildType} exclusive onChange={(_, v) => v && setBuildType(v)}>
              <ToggleButton value="residential">Residential</ToggleButton>
              <ToggleButton value="commercial">Commercial</ToggleButton>
            </ToggleButtonGroup>
            <Chip label={`Typical Time: ${data.time}`} color="info" />
            <Chip label={`Fee: ${data.fee}`} color="success" />
            <Button variant="outlined" startIcon={<Download />} size="small" sx={{ ml: 'auto', borderRadius: 2 }}>Export Checklist</Button>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Required Documents</Typography>
          {data.docs.map((doc, i) => (
            <Box key={i} display="flex" gap={1.5} py={1.2} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Chip label={i + 1} size="small" color="primary" sx={{ minWidth: 28, height: 24 }} />
              <Typography variant="body2">{doc}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Approval Process Steps</Typography>
          {data.steps.map((step, i) => (
            <Box key={i} display="flex" gap={1.5} py={1.2} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }} alignItems="flex-start">
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                <Typography variant="caption" color="white" fontWeight={700}>{i + 1}</Typography>
              </Box>
              <Typography variant="body2">{step}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  )
}

// ─── Feature 25: Disaster Resilience Module ───────────────────────────────────
function DisasterResilienceTab() {
  const [params, setParams] = useState({
    eqZone: 'III', floodRisk: 'low', cycloneZone: false, fireProofing: 'basic',
    constructionType: 'RCC', roofType: 'flat', lightningRod: false,
  })

  const scores = useMemo(() => {
    const eq = { 'I': 95, 'II': 85, 'III': 70, 'IV': 50, 'V': 35 }[params.eqZone] ?? 70
    const flood = { none: 95, low: 80, moderate: 55, high: 30 }[params.floodRisk] ?? 80
    const cyclone = params.cycloneZone ? 55 : 90
    const fire = { basic: 60, intermediate: 78, advanced: 92 }[params.fireProofing] ?? 60
    const lightning = params.lightningRod ? 92 : 55
    const overall = Math.round((eq + flood + cyclone + fire + lightning) / 5)
    return { earthquake: eq, flood, cyclone, fire, lightning, overall }
  }, [params])

  const recs: Record<string, string[]> = {
    earthquake: ['Use ductile detailing in RCC (IS 13920)', 'Provide shear walls on both axes', 'Avoid soft storey configuration', 'Use Fe 500D seismic grade steel'],
    flood: ['Raise plinth level by 600mm above road', 'Install waterproof membrane on basement walls', 'Provide perimeter drainage channel', 'Use marine-grade plywood for low-level joinery'],
    cyclone: ['Use hurricane straps on roof trusses', 'Provide deep roof anchor bolts', 'Install impact-resistant glazing', 'Use concrete roof tiles instead of clay tiles'],
    fire: ['Install smoke detectors in every room', 'Provide fire extinguishers at 15m intervals', 'Use fire-rated doors for staircase', 'Ensure 2-hour fire-rated construction for escape routes'],
    lightning: ['Install copper lightning rod at highest point', 'Provide earthing through copper cable to ground', 'Use SPD (surge protection device) on electrical panel'],
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Building Parameters</Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" mb={1}>Earthquake Zone</Typography>
              <ToggleButtonGroup size="small" value={params.eqZone} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, eqZone: v }))}>
                {['I','II','III','IV','V'].map(z => <ToggleButton key={z} value={z}>Zone {z}</ToggleButton>)}
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="body2" mb={1}>Flood Risk</Typography>
              <ToggleButtonGroup size="small" value={params.floodRisk} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, floodRisk: v }))}>
                {['none','low','moderate','high'].map(r => <ToggleButton key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</ToggleButton>)}
              </ToggleButtonGroup>
            </Box>
            {[
              { label: 'Cyclone Risk Zone', key: 'cycloneZone', type: 'bool' },
              { label: 'Lightning Rod Installed', key: 'lightningRod', type: 'bool' },
            ].map(f => (
              <Box key={f.key} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">{f.label}</Typography>
                <ToggleButtonGroup size="small" value={(params as any)[f.key] ? 'yes' : 'no'} exclusive
                  onChange={(_, v) => v && setParams(p => ({ ...p, [f.key]: v === 'yes' }))}>
                  <ToggleButton value="yes">Yes</ToggleButton>
                  <ToggleButton value="no">No</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            ))}
            <Box>
              <Typography variant="body2" mb={1}>Fire Proofing Level</Typography>
              <ToggleButtonGroup size="small" value={params.fireProofing} exclusive fullWidth onChange={(_, v) => v && setParams(p => ({ ...p, fireProofing: v }))}>
                {['basic','intermediate','advanced'].map(l => <ToggleButton key={l} value={l} sx={{ textTransform: 'capitalize' }}>{l}</ToggleButton>)}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Disaster Resilience Scores</Typography>
          <Grid container spacing={2} mb={2}>
            {[
              { label: 'Earthquake', score: scores.earthquake, icon: '🏚️' },
              { label: 'Flood', score: scores.flood, icon: '🌊' },
              { label: 'Cyclone', score: scores.cyclone, icon: '🌀' },
              { label: 'Fire', score: scores.fire, icon: '🔥' },
              { label: 'Lightning', score: scores.lightning, icon: '⚡' },
            ].map(item => {
              const color = item.score >= 80 ? '#4caf50' : item.score >= 60 ? '#ff9800' : '#f44336'
              return (
                <Grid item xs={6} md={4} key={item.label}>
                  <Box textAlign="center" p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography fontSize="1.8rem">{item.icon}</Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color }}>{item.score}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <LinearProgress variant="determinate" value={item.score} sx={{ mt: 0.5, height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                  </Box>
                </Grid>
              )
            })}
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} sx={{ background: 'linear-gradient(135deg,rgba(108,99,255,.15),rgba(255,101,132,.08))', borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
                <Typography fontSize="1.8rem">🏠</Typography>
                <Typography variant="h4" fontWeight={900} color="primary.main">{scores.overall}</Typography>
                <Typography variant="caption" color="text.secondary">Overall Resilience Score</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Improvement Recommendations</Typography>
          {Object.entries(recs).filter(([k]) => (scores as any)[k] < 80).map(([cat, items]) => (
            <Accordion key={cat} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" fontWeight={700} textTransform="capitalize">{cat} Protection — Score: {(scores as any)[cat]}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={0.8}>
                  {items.map(item => (
                    <Box key={item} display="flex" gap={1}><CheckCircle sx={{ color: 'primary.main', fontSize: 16, mt: 0.2, flexShrink: 0 }} /><Typography variant="body2">{item}</Typography></Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
          {Object.entries(recs).every(([k]) => (scores as any)[k] >= 80) && (
            <Alert severity="success">Excellent! All disaster resilience scores are above 80. No critical improvements needed.</Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}

export default function CompliancePage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Building Compliance & Safety</Typography>
        <Typography variant="body1" color="text.secondary">Code compliance checker, permit document assistant, and disaster resilience module.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['⚖️ Code Compliance', '📋 Permit Assistant', '🛡️ Disaster Resilience'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <CodeComplianceTab />}
      {tab === 1 && <PermitAssistantTab />}
      {tab === 2 && <DisasterResilienceTab />}
    </Box>
  )
}
