// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Grid, Paper, Avatar, Rating, Chip, Stack,
  Button, TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Divider,
} from '@mui/material'
import { Search, Storefront, Star, Work, LocationOn, Send } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

const SPECIALIZATIONS = ['All', 'Residential', 'Commercial', 'Interior Design', 'Landscape', 'Vastu']

interface ArchitectProfile {
  _id: string
  user: { name: string; avatar?: string; email: string }
  bio: string
  specializations: string[]
  experience: number
  hourlyRate: number
  rating: number
  reviewCount: number
  availability: boolean
  location: string
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [spec, setSpec] = useState('All')
  const [selectedArch, setSelectedArch] = useState<ArchitectProfile | null>(null)
  const [hireMsg, setHireMsg] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['architects', search, spec],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (spec !== 'All') params.append('specialization', spec)
      return (await api.get(`/architects?${params}`)).data
    },
  })

  const hireMutation = useMutation({
    mutationFn: (archId: string) => api.post(`/architects/${archId}/hire`, { message: hireMsg }),
    onSuccess: () => {
      toast.success('Hire request sent!')
      setSelectedArch(null)
      setHireMsg('')
    },
    onError: () => toast.error('Failed to send request'),
  })

  const architects: ArchitectProfile[] = data?.architects || []

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        <Storefront sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
        Architect Marketplace
      </Typography>
      <Typography color="text.secondary" mb={3}>Find and hire verified architects for your project</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField placeholder="Search architects..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          size="small" sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Specialization</InputLabel>
          <Select value={spec} label="Specialization" onChange={(e) => setSpec(e.target.value)}>
            {SPECIALIZATIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" pt={4}><CircularProgress /></Box>
      ) : architects.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Storefront sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography color="text.secondary" mt={2}>No architects found</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {architects.map((arch) => (
            <Grid item xs={12} sm={6} md={4} key={arch._id}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Avatar src={arch.user.avatar} sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontSize: 20 }}>
                    {arch.user.name[0]}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{arch.user.name}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Rating value={arch.rating || 0} readOnly size="small" precision={0.5} />
                      <Typography variant="caption" color="text.secondary">({arch.reviewCount || 0})</Typography>
                    </Box>
                  </Box>
                  <Chip label={arch.availability ? 'Available' : 'Busy'} size="small"
                    color={arch.availability ? 'success' : 'default'} />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {arch.bio || 'Professional architect specializing in residential and commercial designs.'}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {(arch.specializations || []).slice(0, 3).map((s) => (
                    <Chip key={s} label={s} size="small" variant="outlined" />
                  ))}
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Work sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption">{arch.experience || 0}yr exp</Typography>
                  </Box>
                  {arch.location && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption">{arch.location}</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Hourly Rate</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="primary">
                      ₹{(arch.hourlyRate || 0).toLocaleString('en-IN')}/hr
                    </Typography>
                  </Box>
                  <Button variant="contained" size="small" onClick={() => setSelectedArch(arch)} disabled={!arch.availability}>
                    Hire
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Hire Dialog */}
      <Dialog open={!!selectedArch} onClose={() => setSelectedArch(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Hire {selectedArch?.user.name}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Send a hire request with details about your project.</Typography>
          <TextField fullWidth multiline rows={4} label="Message to Architect"
            value={hireMsg} onChange={(e) => setHireMsg(e.target.value)} sx={{ mt: 2 }}
            placeholder="Describe your project requirements, timeline, and budget..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedArch(null)}>Cancel</Button>
          <Button variant="contained" startIcon={hireMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Send />}
            onClick={() => selectedArch && hireMutation.mutate(selectedArch._id)}
            disabled={!hireMsg.trim() || hireMutation.isPending}>
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
