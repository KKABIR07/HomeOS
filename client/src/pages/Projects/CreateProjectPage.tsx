import { useState } from 'react'
import {
  Box, Card, Grid, Typography, TextField, Button, MenuItem,
  Select, FormControl, InputLabel, Slider, Stepper, Step, StepLabel,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService } from '../../services/projectService'
import type { CreateProjectPayload, DesignStyle, HouseType } from '../../types/project'

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

const defaultForm: CreateProjectPayload = {
  title: '', description: '', houseType: 'residential', style: 'modern',
  floors: 1, bedrooms: 3, bathrooms: 2, plotArea: 2000, location: '', budget: 200000,
}

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState<CreateProjectPayload>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectPayload, string>>>({})

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
      navigate(`/projects/${project.id ?? project._id}`)
    },
    onError: () => toast.error('Failed to create project'),
  })

  const handleChange = <K extends keyof CreateProjectPayload>(field: K, value: CreateProjectPayload[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateStep = () => {
    const newErrors: typeof errors = {}
    if (activeStep === 0) {
      if (!form.title.trim()) newErrors.title = 'Project title is required'
      if (!form.description.trim()) newErrors.description = 'Description is required'
    }
    if (activeStep === 1) {
      if (!form.location.trim()) newErrors.location = 'Location is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => { if (validateStep()) setActiveStep((prev) => prev + 1) }
  const handleSubmit = () => { if (validateStep()) createMutation.mutate(form) }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} variant="text" sx={{ color: 'text.secondary' }} onClick={() => navigate('/projects')}>Back</Button>
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
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Project Information</Typography>
            <TextField label="Project Title *" value={form.title} onChange={(e) => handleChange('title', e.target.value)} error={!!errors.title} helperText={errors.title} fullWidth placeholder="e.g. Modern Family Villa" />
            <TextField label="Description *" value={form.description} onChange={(e) => handleChange('description', e.target.value)} error={!!errors.description} helperText={errors.description} fullWidth multiline rows={4} placeholder="Describe your project vision..." />
            <FormControl fullWidth>
              <InputLabel>House Type</InputLabel>
              <Select value={form.houseType} label="House Type" onChange={(e) => handleChange('houseType', e.target.value as HouseType)}>
                {houseTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        )}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Design Details</Typography>
            <FormControl fullWidth>
              <InputLabel>Architectural Style</InputLabel>
              <Select value={form.style} label="Architectural Style" onChange={(e) => handleChange('style', e.target.value as DesignStyle)}>
                {styles.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Location *" value={form.location} onChange={(e) => handleChange('location', e.target.value)} error={!!errors.location} helperText={errors.location} fullWidth placeholder="City, State or Address" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Number of Floors: {form.floors}</Typography>
              <Slider value={form.floors} onChange={(_, v) => handleChange('floors', v as number)} min={1} max={5} step={1} marks={[1,2,3,4,5].map((v) => ({ value: v, label: String(v) }))} sx={{ color: 'primary.main' }} />
            </Box>
          </Box>
        )}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Specifications</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Bedrooms: {form.bedrooms}</Typography>
                  <Slider value={form.bedrooms} onChange={(_, v) => handleChange('bedrooms', v as number)} min={1} max={10} step={1} marks sx={{ color: 'primary.main' }} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Bathrooms: {form.bathrooms}</Typography>
                  <Slider value={form.bathrooms} onChange={(_, v) => handleChange('bathrooms', v as number)} min={1} max={8} step={1} marks sx={{ color: 'primary.main' }} />
                </Box>
              </Grid>
            </Grid>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Plot Area: {form.plotArea.toLocaleString()} sq ft</Typography>
              <Slider value={form.plotArea} onChange={(_, v) => handleChange('plotArea', v as number)} min={500} max={20000} step={100} sx={{ color: 'primary.main' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>500 sq ft</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>20,000 sq ft</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Budget: ${form.budget.toLocaleString()}</Typography>
              <Slider value={form.budget} onChange={(_, v) => handleChange('budget', v as number)} min={50000} max={5000000} step={10000} sx={{ color: 'primary.main' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>$50K</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>$5M</Typography>
              </Box>
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/projects') : setActiveStep((prev) => prev - 1)} startIcon={activeStep > 0 ? <ArrowBackIcon /> : undefined} sx={{ color: 'text.secondary', borderColor: 'divider' }}>
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>Next</Button>
          ) : (
            <Button variant="contained" endIcon={<CheckIcon />} onClick={handleSubmit} disabled={createMutation.isPending} sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)' }}>
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  )
}
