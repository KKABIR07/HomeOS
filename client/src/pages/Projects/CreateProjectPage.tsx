import { useState } from 'react'
import {
  Box, Card, Grid, Typography, TextField, Button, MenuItem,
  Select, FormControl, InputLabel, Slider, Stepper, Step, StepLabel,
  InputAdornment, CircularProgress, Tooltip, IconButton,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'
import type { DesignStyle, HouseType } from '../../types/project'

const steps = ['Basic Info', 'Design Details', 'Specifications']

const styles: { value: DesignStyle; label: string }[] = [
  { value: 'modern', label: 'Modern' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'colonial', label: 'Colonial' },
  { value: 'craftsman', label: 'Craftsman' },
]

const houseTypes: { value: HouseType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed', label: 'Mixed Use' },
]

interface FormState {
  projectName: string
  description: string
  houseType: HouseType
  style: DesignStyle
  floors: number
  bedrooms: number
  bathrooms: number
  plotWidth: number
  plotLength: number
  location: string
  budget: number
}

const defaultForm: FormState = {
  projectName: '', description: '', houseType: 'residential', style: 'modern',
  floors: 1, bedrooms: 3, bathrooms: 2, plotWidth: 30, plotLength: 40,
  location: '', budget: 2500000,
}

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // ── AI generate description via Groq llama-3.3-70b ──────────────────────────
  const handleAIDescription = async () => {
    setAiDescLoading(true)
    try {
      const res = await api.post('/ai/generate-description', {
        projectName: form.projectName,
        houseStyle: form.style,
        houseType: form.houseType,
        location: form.location,
        plotWidth: form.plotWidth,
        plotLength: form.plotLength,
        floors: form.floors,
        budget: form.budget,
      })
      set('description', res.data.description)
      toast.success(`Description generated${res.data.source?.includes('groq') ? ' via Groq Llama 3.3' : ''}!`)
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiDescLoading(false)
    }
  }

  // ── Auto-detect location via browser geolocation + Nominatim ────────────────
  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const addr = data.address || {}
          const city = addr.city || addr.town || addr.village || addr.county || ''
          const state = addr.state || ''
          const country = addr.country || ''
          const location = [city, state, country].filter(Boolean).join(', ')
          set('location', location)
          toast.success(`Location detected: ${location}`)
        } catch {
          toast.error('Could not fetch location name')
        } finally {
          setLocationLoading(false)
        }
      },
      (err) => {
        setLocationLoading(false)
        if (err.code === 1) toast.error('Location permission denied. Please allow access.')
        else toast.error('Could not detect location')
      },
      { timeout: 10000 }
    )
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/projects', {
        projectName: form.projectName,
        description: form.description,
        houseStyle: form.style,
        location: form.location,
        plotWidth: form.plotWidth,
        plotLength: form.plotLength,
        floors: form.floors,
        budget: form.budget,
      })
      return res.data.project
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created!')
      navigate(`/projects/${project._id}`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to create project')
    },
  })

  const validateStep = () => {
    const errs: typeof errors = {}
    if (activeStep === 0) {
      if (!form.projectName.trim()) errs.projectName = 'Project name is required'
    }
    if (activeStep === 1) {
      if (!form.location.trim()) errs.location = 'Location is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => { if (validateStep()) setActiveStep((p) => p + 1) }
  const handleBack = () => setActiveStep((p) => p - 1)
  const handleSubmit = () => { if (validateStep()) createMutation.mutate() }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} variant="text" sx={{ color: 'text.secondary' }} onClick={() => navigate('/projects')}>
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Create New Project</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.875rem' }, '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' }, '& .MuiStepIcon-root.Mui-completed': { color: 'primary.main' } }}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ p: 4 }}>
        {/* ── Step 0: Basic Info ── */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Project Information</Typography>

            <TextField
              label="Project Name *"
              value={form.projectName}
              onChange={(e) => set('projectName', e.target.value)}
              error={!!errors.projectName}
              helperText={errors.projectName}
              fullWidth
              placeholder="e.g. Modern Family Villa"
            />

            <Box>
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="Describe your project vision... or click AI Generate below"
                sx={{ mb: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={aiDescLoading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleAIDescription}
                disabled={aiDescLoading}
                sx={{
                  borderStyle: 'dashed',
                  fontSize: '0.75rem',
                  '&:hover': { background: 'rgba(108,99,255,0.08)' },
                }}
              >
                {aiDescLoading ? 'Generating with Groq Llama 3.3…' : 'AI Generate Description'}
              </Button>
            </Box>

            <FormControl fullWidth>
              <InputLabel>House Type</InputLabel>
              <Select value={form.houseType} label="House Type" onChange={(e) => set('houseType', e.target.value as HouseType)}>
                {houseTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* ── Step 1: Design Details ── */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Design Details</Typography>

            <FormControl fullWidth>
              <InputLabel>Architectural Style</InputLabel>
              <Select value={form.style} label="Architectural Style" onChange={(e) => set('style', e.target.value as DesignStyle)}>
                {styles.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              label="Location *"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              error={!!errors.location}
              helperText={errors.location || 'City, State or Address'}
              fullWidth
              placeholder="e.g. Mumbai, Maharashtra"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Auto-detect my location">
                      <IconButton
                        size="small"
                        onClick={handleAutoLocation}
                        disabled={locationLoading}
                        color="primary"
                      >
                        {locationLoading
                          ? <CircularProgress size={18} color="inherit" />
                          : <MyLocationIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Plot Width (ft)"
                  type="number"
                  value={form.plotWidth}
                  onChange={(e) => set('plotWidth', Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 10 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Plot Length (ft)"
                  type="number"
                  value={form.plotLength}
                  onChange={(e) => set('plotLength', Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 10 }}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Number of Floors: {form.floors}</Typography>
              <Slider
                value={form.floors}
                onChange={(_, v) => set('floors', v as number)}
                min={1} max={5} step={1}
                marks={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
                sx={{ color: 'primary.main' }}
              />
            </Box>
          </Box>
        )}

        {/* ── Step 2: Specifications ── */}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Specifications</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Bedrooms: {form.bedrooms}</Typography>
                  <Slider value={form.bedrooms} onChange={(_, v) => set('bedrooms', v as number)} min={1} max={10} step={1} marks sx={{ color: 'primary.main' }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Bathrooms: {form.bathrooms}</Typography>
                  <Slider value={form.bathrooms} onChange={(_, v) => set('bathrooms', v as number)} min={1} max={8} step={1} marks sx={{ color: 'primary.main' }} />
                </Box>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Plot Area: {(form.plotWidth * form.plotLength).toLocaleString()} sq ft ({form.plotWidth}ft × {form.plotLength}ft)
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Budget: ₹{form.budget.toLocaleString('en-IN')}
              </Typography>
              <Slider
                value={form.budget}
                onChange={(_, v) => set('budget', v as number)}
                min={500000} max={50000000} step={100000}
                sx={{ color: 'primary.main' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>₹5 Lakh</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>₹5 Crore</Typography>
              </Box>
            </Box>

            {/* Summary */}
            <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Project Summary</Typography>
              <Grid container spacing={1}>
                {[
                  { label: 'Name', value: form.projectName },
                  { label: 'Style', value: form.style },
                  { label: 'Location', value: form.location || '—' },
                  { label: 'Plot', value: `${form.plotWidth}×${form.plotLength} ft` },
                  { label: 'Floors', value: form.floors },
                  { label: 'Budget', value: `₹${form.budget.toLocaleString('en-IN')}` },
                ].map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={500} noWrap>{item.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* ── Navigation ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/projects') : handleBack}
            startIcon={activeStep > 0 ? <ArrowBackIcon /> : undefined}
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}
              sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>
              Next
            </Button>
          ) : (
            <Button variant="contained" endIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
              onClick={handleSubmit} disabled={createMutation.isPending}
              sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>
              {createMutation.isPending ? 'Creating…' : 'Create Project'}
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  )
}
