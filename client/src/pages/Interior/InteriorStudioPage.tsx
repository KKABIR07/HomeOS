import { useState } from 'react'
import {
  Box, Typography, Paper, Grid, Button, Chip, Stack,
  MenuItem, TextField, CircularProgress, Divider,
  Card, CardContent, Avatar,
} from '@mui/material'
import { Brush, AutoAwesome, Palette, Lightbulb, Chair } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STYLES = ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist']
const ROOMS_LIST = ['living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'study', 'balcony']
const BUDGET_CATS = ['budget', 'mid-range', 'premium', 'luxury']
const CLIMATES = ['tropical', 'dry', 'temperate', 'cold']

interface InteriorResult {
  style: string
  colorPalette: string[]
  materialSuggestions: string[]
  furnitureGuidance: string
  lightingPlan: string
  roomSuggestions: { room: string; suggestions: string[] }[]
  plants: string[]
  tips: string[]
}

export default function InteriorStudioPage() {
  const [form, setForm] = useState({ houseStyle: 'modern', budgetCategory: 'mid-range', climate: 'tropical' })
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['living', 'bedroom'])
  const [result, setResult] = useState<InteriorResult | null>(null)

  const mutation = useMutation({
    mutationFn: async () => (await api.post('/ai/interior-design', { ...form, rooms: selectedRooms })).data.design,
    onSuccess: (data) => { setResult(data); toast.success('Interior design generated!') },
    onError: () => toast.error('Generation failed'),
  })

  const toggleRoom = (r: string) => setSelectedRooms((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        <Brush sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
        Interior Design Studio
      </Typography>
      <Typography color="text.secondary" mb={3}>AI-powered interior design recommendations for every room</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Design Preferences</Typography>
            <Stack spacing={2}>
              <TextField select label="House Style" value={form.houseStyle}
                onChange={(e) => setForm({ ...form, houseStyle: e.target.value })} size="small" fullWidth>
                {STYLES.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
              </TextField>
              <TextField select label="Budget Category" value={form.budgetCategory}
                onChange={(e) => setForm({ ...form, budgetCategory: e.target.value })} size="small" fullWidth>
                {BUDGET_CATS.map((b) => <MenuItem key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</MenuItem>)}
              </TextField>
              <TextField select label="Climate Zone" value={form.climate}
                onChange={(e) => setForm({ ...form, climate: e.target.value })} size="small" fullWidth>
                {CLIMATES.map((c) => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Rooms to Design</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {ROOMS_LIST.map((r) => (
                <Chip key={r} label={r} size="small" clickable
                  color={selectedRooms.includes(r) ? 'primary' : 'default'}
                  variant={selectedRooms.includes(r) ? 'filled' : 'outlined'}
                  onClick={() => toggleRoom(r)} />
              ))}
            </Stack>

            <Button fullWidth variant="contained" sx={{ mt: 3 }} size="large"
              startIcon={mutation.isPending ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
              onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Designing...' : 'Generate Design'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {!result && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400} gap={2}>
              <Brush sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography color="text.secondary">Set your preferences and generate design ideas</Typography>
            </Box>
          )}

          {result && (
            <Stack spacing={3}>
              {/* Color Palette */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />Color Palette
                </Typography>
                <Stack direction="row" gap={1.5} flexWrap="wrap">
                  {result.colorPalette.map((color, i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: color, border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                        onClick={() => { navigator.clipboard.writeText(color); toast.success(`Copied ${color}`) }} />
                      <Typography variant="caption" display="block" mt={0.5}>{color}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Materials & Furniture */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Materials</Typography>
                    <Stack gap={0.5}>
                      {result.materialSuggestions.map((m, i) => (
                        <Chip key={i} label={m} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      <Chair sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />Furniture
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{result.furnitureGuidance}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      <Lightbulb sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />Lighting
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{result.lightingPlan}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Room Suggestions */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Room-by-Room Suggestions</Typography>
                <Grid container spacing={2}>
                  {result.roomSuggestions.map((room) => (
                    <Grid item xs={12} sm={6} key={room.room}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ textTransform: 'capitalize' }}>{room.room}</Typography>
                          <Stack spacing={0.5}>
                            {room.suggestions.map((s, i) => (
                              <Typography key={i} variant="caption" color="text.secondary">• {s}</Typography>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Plants & Tips */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>🌿 Recommended Plants</Typography>
                    <Stack spacing={0.5}>
                      {result.plants.map((p, i) => <Typography key={i} variant="body2">• {p}</Typography>)}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>💡 Pro Tips</Typography>
                    <Stack spacing={0.5}>
                      {result.tips.map((t, i) => <Typography key={i} variant="body2" color="text.secondary">• {t}</Typography>)}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
