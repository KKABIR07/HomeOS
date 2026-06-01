// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, TextField,
  Button, Chip, Avatar, Stack, Divider, CircularProgress,
  IconButton, Tooltip, Alert, Fade,
} from '@mui/material'
import {
  Send, AutoAwesome, Architecture, Engineering, Handyman,
  Brush, Park, Calculate, VerifiedUser, Person, ContentCopy,
  Refresh, LightbulbOutlined,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ─── Types & Data ───────────────────────────────────────────────────────────────
interface Role {
  id: string; name: string; subtitle: string; color: string
  gradient: string; icon: React.ReactNode; systemContext: string
}

const ROLES: Role[] = [
  {
    id: 'architect', name: 'Architect', subtitle: 'Design & space planning',
    color: '#6C63FF', gradient: 'linear-gradient(135deg,#6C63FF,#8B85FF)',
    icon: <Architecture />,
    systemContext: 'You are an expert residential and commercial architect with 20+ years of experience in Indian construction. You specialise in vastu-compliant designs, space optimisation, building regulations, NBC compliance, and modern architectural trends.',
  },
  {
    id: 'structural', name: 'Structural Engineer', subtitle: 'Structural & RCC design',
    color: '#ff9800', gradient: 'linear-gradient(135deg,#ff9800,#ffb74d)',
    icon: <Engineering />,
    systemContext: 'You are a licensed structural engineer experienced in RCC design, steel structures, foundation engineering, IS code compliance (IS 456, IS 800, IS 1893), seismic design, and construction supervision.',
  },
  {
    id: 'civil', name: 'Civil Engineer', subtitle: 'Construction & materials',
    color: '#f44336', gradient: 'linear-gradient(135deg,#f44336,#e57373)',
    icon: <Handyman />,
    systemContext: 'You are a senior civil engineer with expertise in construction methodology, building materials, quantity estimation, BOQ preparation, quality control, and project management in the Indian construction industry.',
  },
  {
    id: 'interior', name: 'Interior Designer', subtitle: 'Interiors & aesthetics',
    color: '#e91e63', gradient: 'linear-gradient(135deg,#e91e63,#f06292)',
    icon: <Brush />,
    systemContext: 'You are a talented interior designer specialising in residential interiors, space planning, colour theory, material selection, furniture layout, lighting design, and various design styles including modern, traditional, minimalist, and luxury.',
  },
  {
    id: 'landscape', name: 'Landscape Designer', subtitle: 'Gardens & outdoor spaces',
    color: '#4caf50', gradient: 'linear-gradient(135deg,#4caf50,#81c784)',
    icon: <Park />,
    systemContext: 'You are an experienced landscape architect specialising in garden design, plant selection for Indian climate zones, water management, outdoor living spaces, and sustainable landscape practices.',
  },
  {
    id: 'qs', name: 'Quantity Surveyor', subtitle: 'Costs & estimates',
    color: '#2196f3', gradient: 'linear-gradient(135deg,#2196f3,#64b5f6)',
    icon: <Calculate />,
    systemContext: 'You are a certified quantity surveyor specialising in construction cost estimation, bill of quantities (BOQ), material procurement, value engineering, and budget management for Indian residential and commercial projects. You are familiar with current material rates across Indian cities.',
  },
  {
    id: 'vastu', name: 'Vastu Consultant', subtitle: 'Vastu Shastra guidance',
    color: '#9c27b0', gradient: 'linear-gradient(135deg,#9c27b0,#ba68c8)',
    icon: <VerifiedUser />,
    systemContext: 'You are an expert Vastu Shastra consultant with deep knowledge of Vastu principles for residential and commercial properties. You provide practical, science-backed Vastu recommendations for plot selection, room placement, entrance direction, kitchen, bedroom, and overall energy flow.',
  },
]

const QUICK_QUESTIONS: Record<string, string[]> = {
  architect: [
    'Which foundation is best for clay soil in a G+2 house?',
    'What is the ideal room layout for a 30×40 ft plot with vastu?',
    'How much setback is required for a residential building?',
    'Suggest a floor plan for a 3BHK in 1500 sq ft carpet area',
  ],
  structural: [
    'What rebar diameter should I use for a G+2 RCC frame?',
    'What is the minimum column size for a residential building?',
    'How to design a flat slab vs beam-slab system?',
    'Which IS code governs earthquake-resistant design?',
  ],
  civil: [
    'How many bricks do I need for a 2000 sq ft house?',
    'What is the mix ratio for M20 concrete?',
    'How long should concrete be cured?',
    'What is the standard thickness for a roof slab?',
  ],
  interior: [
    'Suggest a minimalist living room design for a 15×18 ft room',
    'Which flooring stays coolest in summer — marble or tiles?',
    'What are the best paint colours for a north-facing bedroom?',
    'How to design a modular kitchen for a 10×12 ft space?',
  ],
  landscape: [
    'Best grass for a West Bengal garden — high rainfall climate?',
    'How to design a low-maintenance garden for a 30×20 ft area?',
    'Which trees provide the most shade and are fast-growing?',
    'How to set up a rainwater harvesting system for a 1200 sqft roof?',
  ],
  qs: [
    'Estimate cost of a G+2 duplex in Kolkata (1500 sq ft each floor)',
    'What is the current rate of OPC 53 cement in Delhi?',
    'How to prepare a BOQ for plastering work?',
    'What percentage of total cost is typically labour in house construction?',
  ],
  vastu: [
    'Which direction should the main entrance face for good energy?',
    'Where should the kitchen be placed in a north-facing house?',
    'Is it bad vastu to have a staircase in the centre of the house?',
    'What vastu remedies can fix a south-west cut in the plot?',
  ],
}

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim(), timestamp: new Date() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build prompt with role context
      const prompt = `${selectedRole.systemContext}\n\nUser question: ${text.trim()}\n\nProvide a practical, detailed answer focused on Indian construction context. Use bullet points or numbered lists where helpful. Keep response under 400 words.`

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ prompt, role: selectedRole.id }),
      })

      let reply = ''
      if (res.ok) {
        const data = await res.json()
        reply = data.reply || data.message || data.content || 'I can help with that. Please check your project details.'
      } else {
        // Fallback demo responses
        reply = getDemoResponse(selectedRole.id, text)
      }

      setMessages(m => [...m, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: getDemoResponse(selectedRole.id, text), timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }, [selectedRole, loading])

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role)
    setMessages([])
  }

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <Box mb={2}>
        <Typography variant="h4" fontWeight={800} gutterBottom>AI Construction Assistant</Typography>
        <Typography variant="body1" color="text.secondary">
          Ask our AI experts — Architect, Engineer, Interior Designer, Vastu Consultant and more.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Role Selector */}
        <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', maxHeight: '100%' }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ px: 0.5 }}>SELECT EXPERT ROLE</Typography>
          {ROLES.map(role => (
            <Card
              key={role.id}
              onClick={() => handleRoleChange(role)}
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                cursor: 'pointer', borderRadius: 2, border: '2px solid',
                borderColor: selectedRole.id === role.id ? role.color : 'divider',
                bgcolor: selectedRole.id === role.id ? `${role.color}12` : 'background.paper',
                transition: 'all 0.2s',
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 1.5, background: role.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box sx={{ color: 'white', '& .MuiSvgIcon-root': { fontSize: 18 } }}>{role.icon}</Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{role.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{role.subtitle}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={9} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', background: selectedRole.gradient, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ color: 'white', '& .MuiSvgIcon-root': { fontSize: 22 } }}>{selectedRole.icon}</Box>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} color="white">{selectedRole.name}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{selectedRole.subtitle}</Typography>
              </Box>
              <Tooltip title="Clear conversation">
                <IconButton size="small" sx={{ ml: 'auto', color: 'rgba(255,255,255,0.8)' }} onClick={() => setMessages([])}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {messages.length === 0 && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LightbulbOutlined color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>Quick Questions</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    {(QUICK_QUESTIONS[selectedRole.id] || []).map(q => (
                      <Grid item xs={12} sm={6} key={q}>
                        <Card
                          onClick={() => sendMessage(q)}
                          sx={{
                            cursor: 'pointer', borderRadius: 2, border: '1px solid', borderColor: 'divider',
                            '&:hover': { borderColor: selectedRole.color, bgcolor: `${selectedRole.color}08` },
                            transition: 'all 0.2s',
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="body2">{q}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}>
                    <Box display="flex" gap={1.5} mb={2.5}
                      flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}>
                      <Avatar
                        sx={{
                          width: 34, height: 34, flexShrink: 0,
                          background: msg.role === 'user' ? 'linear-gradient(135deg,#6C63FF,#FF6584)' : selectedRole.gradient,
                        }}
                      >
                        {msg.role === 'user' ? <Person sx={{ fontSize: 18 }} /> : <AutoAwesome sx={{ fontSize: 18 }} />}
                      </Avatar>
                      <Box maxWidth="82%">
                        <Box
                          sx={{
                            p: 2, borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                            bgcolor: msg.role === 'user' ? selectedRole.color : 'background.default',
                            border: msg.role === 'assistant' ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2" sx={{
                            color: msg.role === 'user' ? 'white' : 'text.primary',
                            whiteSpace: 'pre-wrap', lineHeight: 1.7,
                          }}>
                            {msg.content}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'} mt={0.5}>
                          <Typography variant="caption" color="text.disabled">
                            {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          {msg.role === 'assistant' && (
                            <Tooltip title="Copy">
                              <IconButton size="small" sx={{ ml: 0.5, p: 0.3 }} onClick={() => copyMessage(msg.content)}>
                                <ContentCopy sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <Box display="flex" gap={1.5} mb={2} alignItems="center">
                  <Avatar sx={{ width: 34, height: 34, background: selectedRole.gradient }}>
                    <AutoAwesome sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box p={1.5} sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: '4px 16px 16px 16px' }}>
                    <Box display="flex" gap={0.8} alignItems="center">
                      {[0, 1, 2].map(i => (
                        <Box key={i} component={motion.div}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: selectedRole.color }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth multiline maxRows={4} size="small"
                  placeholder={`Ask the ${selectedRole.name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                  disabled={loading}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Button
                  variant="contained" onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  sx={{ borderRadius: 3, minWidth: 48, px: 1.5, background: selectedRole.gradient }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                </Button>
              </Box>
              <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                Press Enter to send · Shift+Enter for new line
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

// ─── Demo fallback responses ─────────────────────────────────────────────────────
function getDemoResponse(roleId: string, question: string): string {
  const q = question.toLowerCase()

  if (roleId === 'qs' || q.includes('cost') || q.includes('estimate') || q.includes('price')) {
    return `**Cost Estimation Guide**\n\nFor Indian residential construction (2024 rates):\n\n• Basic construction: ₹1,500–2,000/sq ft\n• Standard finish: ₹2,000–2,800/sq ft\n• Premium finish: ₹2,800–4,000/sq ft\n\n**Cost Breakdown (approx):**\n• Foundation: 10–15%\n• Structure (RCC): 25–30%\n• Brickwork & plaster: 10–12%\n• Flooring: 8–12%\n• Electrical: 6–8%\n• Plumbing: 5–7%\n• Finishes & paint: 8–10%\n• Contractor profit: 10–15%\n\nNote: Rates vary by city — Mumbai adds ~50%, Delhi ~40%, Bangalore ~35% over base rates.`
  }

  if (q.includes('foundation') || q.includes('soil')) {
    return `**Foundation Recommendations**\n\nFor residential buildings, the choice depends on soil type:\n\n**Clay Soil:** Use raft or pile foundation. Clay expands/contracts with moisture — isolated footings are risky.\n\n**Sandy Soil:** Strip foundation works for G+1. For G+2 and above, consider pile foundation.\n\n**Rocky Soil:** Isolated pad footings are sufficient and most economical.\n\n**Loamy Soil:** Best soil type. Strip foundation handles G+3 comfortably.\n\n**Key factors to always check:**\n1. Soil Bearing Capacity (SBC) via bore test\n2. Water table depth\n3. Building load (floors × area)\n4. Seismic zone\n\nAlways get a geotechnical report before finalising foundation design.`
  }

  if (q.includes('vastu') || roleId === 'vastu') {
    return `**Vastu Guidance**\n\n**Key Vastu Principles for Homes:**\n\n1. **Main Entrance:** North, East, or North-East preferred. Avoid South-West.\n\n2. **Kitchen:** South-East corner is ideal (Agni direction). Cook facing East.\n\n3. **Master Bedroom:** South-West corner for stability and prosperity.\n\n4. **Living Room:** North or East zone — promotes positive energy flow.\n\n5. **Pooja Room:** North-East corner — divine energy zone.\n\n6. **Staircase:** South, West, or South-West. Never in North-East.\n\n7. **Toilet/Bathroom:** North-West or South is acceptable. Avoid North-East.\n\n8. **Plot Shape:** Square or rectangular plots are ideal. Avoid irregular cuts.\n\nRemember: Vastu is about optimising natural light, wind flow, and magnetic fields — many principles align with good architecture.`
  }

  if (q.includes('brick') || q.includes('cement') || q.includes('material')) {
    return `**Material Recommendations**\n\n**For standard residential construction:**\n\n**Cement:** OPC 53 Grade for RCC (columns, beams, slabs). PPC for masonry and plastering.\n\n**Bricks:** AAC blocks are the best modern choice:\n• 3× thermal insulation vs clay bricks\n• 60% lighter — reduces structural load\n• Precise dimensions — faster construction\n• Cost: ₹70–90/block (larger size covers more area)\n\n**Steel:** Fe 500 TMT bars are the industry standard. Use Fe 550 for seismic zones IV/V.\n\n**Aggregate:** 20mm for RCC work, 10mm for thin slabs.\n\n**Quality checks:**\n• Always check cement batch date (use within 3 months)\n• Verify steel manufacturer certificate\n• Water: potable quality only\n• Sand: Zone II (medium) for concrete, Zone III for masonry`
  }

  return `**Professional Guidance**\n\nThank you for your question. As a ${ROLES.find(r => r.id === roleId)?.name || 'expert'}, here is my advice:\n\nThis is an important aspect of construction planning. Key considerations include:\n\n1. Always consult local building regulations and NBC (National Building Code of India)\n2. Get proper structural drawings from a licensed engineer\n3. Use quality materials with ISI certification\n4. Ensure proper waterproofing at all critical junctions\n5. Plan MEP (Mechanical, Electrical, Plumbing) before concrete pours\n\nFeel free to ask specific questions about your project — include plot dimensions, number of floors, location, and budget for a more tailored response.`
}
