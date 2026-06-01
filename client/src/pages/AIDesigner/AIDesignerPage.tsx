import { useState, useRef, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  Chip, Stack, Divider, Avatar, CircularProgress, IconButton,
  InputAdornment, Tab, Tabs, LinearProgress,
} from '@mui/material'
import { AutoAwesome, Send, Person, SmartToy, Refresh, ContentCopy } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: Date }

const STYLES = ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist']
const ROOMS = ['Living Room', 'Kitchen', 'Master Bedroom', '2 Bedrooms', 'Bathroom', 'Dining Room', 'Garage', 'Balcony', 'Study']

export default function AIDesignerPage() {
  const [tab, setTab] = useState(0)
  const [wizard, setWizard] = useState({
    plotWidth: '30', plotLength: '40', floors: '1',
    bedrooms: '2', bathrooms: '2', style: 'modern',
    budget: '2500000', parking: false,
  })
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom'])
  const [generatedPlan, setGeneratedPlan] = useState<Record<string, unknown> | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Architect Assistant. I can help you design your dream home, provide Vastu guidance, suggest materials, optimize space, and estimate construction costs. What would you like to know?', timestamp: new Date() },
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/ai/generate-floorplan', {
        plotWidth: parseFloat(wizard.plotWidth),
        plotLength: parseFloat(wizard.plotLength),
        floors: parseInt(wizard.floors),
        houseStyle: wizard.style,
        rooms: selectedRooms.map((r) => r.toLowerCase()),
        budget: parseFloat(wizard.budget),
      })
      return res.data
    },
    onSuccess: (data) => { setGeneratedPlan(data.floorPlan); toast.success('AI floor plan generated!') },
    onError: () => toast.error('Generation failed'),
  })

  const chatMutation = useMutation({
    mutationFn: async (msg: string) => {
      const messages = [...chatMessages, { role: 'user' as const, content: msg, timestamp: new Date() }]
      const res = await api.post('/ai/chat', {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        context: { plotWidth: wizard.plotWidth, plotLength: wizard.plotLength, houseStyle: wizard.style },
      })
      return { userMsg: msg, response: res.data.response }
    },
    onSuccess: ({ userMsg, response }) => {
      setChatMessages((prev) => [
        ...prev,
        { role: 'user', content: userMsg, timestamp: new Date() },
        { role: 'assistant', content: response.content, timestamp: new Date() },
      ])
    },
    onError: () => toast.error('Chat failed'),
  })

  const sendChat = () => {
    if (!chatInput.trim() || chatMutation.isPending) return
    const msg = chatInput.trim()
    setChatInput('')
    chatMutation.mutate(msg)
  }

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) => prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room])
  }

  const quickPrompts = ['How do I optimize my floor plan?', 'What are the best materials for my budget?', 'Give me Vastu suggestions', 'How long will construction take?']

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        <AutoAwesome sx={{ mr: 1, color: 'primary.main', verticalAlign: 'middle' }} />
        AI Designer
      </Typography>
      <Typography color="text.secondary" mb={3}>Generate floor plans and get expert architecture advice with AI</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="AI Floor Plan Generator" />
        <Tab label="AI Architect Assistant" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Design Parameters</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Plot Width (ft)" type="number"
                    value={wizard.plotWidth} onChange={(e) => setWizard({ ...wizard, plotWidth: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Plot Length (ft)" type="number"
                    value={wizard.plotLength} onChange={(e) => setWizard({ ...wizard, plotLength: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Floors" type="number" inputProps={{ min: 1, max: 5 }}
                    value={wizard.floors} onChange={(e) => setWizard({ ...wizard, floors: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" select label="Style" value={wizard.style}
                    onChange={(e) => setWizard({ ...wizard, style: e.target.value })}>
                    {STYLES.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Budget (₹)" type="number"
                    value={wizard.budget} onChange={(e) => setWizard({ ...wizard, budget: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Required Rooms</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {ROOMS.map((r) => (
                  <Chip key={r} label={r} size="small" clickable
                    color={selectedRooms.includes(r) ? 'primary' : 'default'}
                    variant={selectedRooms.includes(r) ? 'filled' : 'outlined'}
                    onClick={() => toggleRoom(r)} />
                ))}
              </Stack>

              <Button fullWidth variant="contained" sx={{ mt: 3 }} size="large"
                startIcon={generateMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating...' : 'Generate AI Floor Plan'}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Generated Result</Typography>
              {generateMutation.isPending && (
                <Box>
                  <Typography color="text.secondary" mb={2}>AI is designing your floor plan...</Typography>
                  <LinearProgress />
                </Box>
              )}
              {!generatedPlan && !generateMutation.isPending && (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={300} gap={2}>
                  <AutoAwesome sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography color="text.secondary">Configure parameters and click Generate</Typography>
                </Box>
              )}
              {generatedPlan && (
                <Box>
                  <Chip label="AI Generated" color="primary" size="small" icon={<AutoAwesome />} sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {(generatedPlan as { name?: string }).name || 'Floor Plan'}
                  </Typography>
                  {(generatedPlan as { measurements?: { totalArea?: number; carpetArea?: number; rooms?: { name: string; area: number }[] } }).measurements && (
                    <>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}><Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={700} color="primary">
                            {(generatedPlan as { measurements: { totalArea: number } }).measurements.totalArea}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Total Area (sq ft)</Typography>
                        </Paper></Grid>
                        <Grid item xs={6}><Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={700} color="secondary">
                            {(generatedPlan as { measurements: { carpetArea: number } }).measurements.carpetArea}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Carpet Area (sq ft)</Typography>
                        </Paper></Grid>
                      </Grid>
                      <Typography variant="subtitle2" gutterBottom>Room Distribution</Typography>
                      <Stack spacing={0.5}>
                        {((generatedPlan as { measurements: { rooms: { name: string; area: number }[] } }).measurements.rooms || []).map((r) => (
                          <Box key={r.name} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">{r.name}</Typography>
                            <Chip label={`${r.area} sq ft`} size="small" variant="outlined" />
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}
                  <Button variant="outlined" startIcon={<Refresh />} sx={{ mt: 2 }} onClick={() => generateMutation.mutate()}>
                    Regenerate
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ display: 'flex', flexDirection: 'column', height: 500 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600}>AI Architect Assistant</Typography>
              </Box>
              <Box flex={1} overflow="auto" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chatMessages.map((msg, i) => (
                  <Box key={i} display="flex" gap={1.5} alignItems="flex-start" flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main', flexShrink: 0 }}>
                      {msg.role === 'user' ? <Person sx={{ fontSize: 18 }} /> : <SmartToy sx={{ fontSize: 18 }} />}
                    </Avatar>
                    <Paper sx={{ p: 1.5, maxWidth: '80%', bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper' }}>
                      <Typography variant="body2" sx={{ color: msg.role === 'user' ? 'white' : 'inherit', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                {chatMutation.isPending && (
                  <Box display="flex" gap={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}><SmartToy sx={{ fontSize: 18 }} /></Avatar>
                    <CircularProgress size={20} />
                  </Box>
                )}
                <div ref={chatEndRef} />
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Ask your AI architect..." value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChat())} />
                <IconButton color="primary" onClick={sendChat} disabled={!chatInput.trim() || chatMutation.isPending}>
                  <Send />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Quick Questions</Typography>
              <Stack spacing={1}>
                {quickPrompts.map((p) => (
                  <Button key={p} variant="outlined" size="small" fullWidth sx={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.75rem' }}
                    onClick={() => { setChatInput(p) }}>
                    {p}
                  </Button>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Capabilities</Typography>
              <Stack spacing={0.5}>
                {['House Design Advice', 'Vastu Guidance', 'Material Recommendations', 'Space Optimization', 'Cost Planning', 'Construction Timeline'].map((c) => (
                  <Chip key={c} label={c} size="small" variant="outlined" />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
