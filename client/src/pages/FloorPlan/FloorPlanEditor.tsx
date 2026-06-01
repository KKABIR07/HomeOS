import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, IconButton, Tooltip, Stack,
  Divider, Button, ButtonGroup, Chip, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Slider,
} from '@mui/material'
import {
  Undo, Redo, Delete, ZoomIn, ZoomOut, GridOn, GridOff,
  Save, Download, ArrowBack, AutoAwesome, Straighten,
  CropSquare, SquareFoot, Add,
} from '@mui/icons-material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'
import type { FloorPlan, FloorPlanElement } from '../../types/floorplan'

type Tool = 'select' | 'wall' | 'door' | 'window' | 'room' | 'column' | 'stair' | 'erase'
type RoomType = 'bedroom' | 'kitchen' | 'bathroom' | 'living' | 'dining' | 'garage' | 'balcony' | 'study'

const ROOM_COLORS: Record<RoomType, string> = {
  bedroom: '#FEF3C7', kitchen: '#DCFCE7', bathroom: '#E0E7FF',
  living: '#DBEAFE', dining: '#FCE7F3', garage: '#F3F4F6',
  balcony: '#ECFDF5', study: '#FFF7ED',
}

const ROOM_LABELS: Record<RoomType, string> = {
  bedroom: 'Bedroom', kitchen: 'Kitchen', bathroom: 'Bathroom',
  living: 'Living Room', dining: 'Dining Room', garage: 'Garage',
  balcony: 'Balcony', study: 'Study',
}

const GRID_SIZE = 20
const SCALE = 1

interface DrawingState {
  isDrawing: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export default function FloorPlanEditor() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [tool, setTool] = useState<Tool>('select')
  const [roomType, setRoomType] = useState<RoomType>('bedroom')
  const [elements, setElements] = useState<FloorPlanElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<FloorPlanElement[][]>([[]])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [drawing, setDrawing] = useState<DrawingState | null>(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [canvasSize] = useState({ width: 900, height: 600 })
  const [floorPlanId, setFloorPlanId] = useState<string | null>(null)
  const [measurementsDialogOpen, setMeasurementsDialogOpen] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
  })

  const { data: floorPlans } = useQuery({
    queryKey: ['floorplans', projectId],
    queryFn: async () => (await api.get(`/floorplans?projectId=${projectId}`)).data.floorPlans,
  })

  useEffect(() => {
    if (floorPlans && floorPlans.length > 0) {
      const fp = floorPlans[0] as FloorPlan
      setElements(fp.elements || [])
      setFloorPlanId(fp._id || null)
    }
  }, [floorPlans])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const totalArea = elements
        .filter((e) => e.type === 'room')
        .reduce((sum, e) => sum + ((e.width * e.height) / (GRID_SIZE * GRID_SIZE)), 0)

      const payload = {
        project: projectId,
        name: `${project?.projectName || 'Floor'} - Floor 1`,
        floor: 1,
        elements,
        dimensions: { width: canvasSize.width, height: canvasSize.height, scale: SCALE },
        gridSize: GRID_SIZE,
        measurements: {
          totalArea: Math.round(totalArea),
          carpetArea: Math.round(totalArea * 0.85),
          rooms: elements.filter((e) => e.type === 'room').map((e) => ({
            name: e.label,
            area: Math.round((e.width * e.height) / (GRID_SIZE * GRID_SIZE)),
          })),
        },
      }
      if (floorPlanId) return (await api.put(`/floorplans/${floorPlanId}`, payload)).data
      return (await api.post('/floorplans', payload)).data
    },
    onSuccess: (data) => {
      if (!floorPlanId) setFloorPlanId(data.floorPlan._id)
      queryClient.invalidateQueries({ queryKey: ['floorplans', projectId] })
      toast.success('Floor plan saved!')
    },
    onError: () => toast.error('Failed to save floor plan'),
  })

  const pushHistory = useCallback((newElements: FloorPlanElement[]) => {
    setHistory((h) => {
      const newH = h.slice(0, historyIdx + 1)
      newH.push([...newElements])
      if (newH.length > 50) newH.shift()
      return newH
    })
    setHistoryIdx((i) => i + 1)
    setElements(newElements)
  }, [historyIdx])

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx((i) => i - 1)
      setElements([...history[historyIdx - 1]])
    }
  }

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx((i) => i + 1)
      setElements([...history[historyIdx + 1]])
    }
  }

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: snapToGrid((e.clientX - rect.left) / zoom),
      y: snapToGrid((e.clientY - rect.top) / zoom),
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e)

    if (tool === 'select') {
      const clicked = elements.find((el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height)
      setSelectedId(clicked ? clicked.id : null)
      return
    }

    if (tool === 'erase') {
      const toErase = elements.find((el) => x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height)
      if (toErase) pushHistory(elements.filter((el) => el.id !== toErase.id))
      return
    }

    setDrawing({ isDrawing: true, startX: x, startY: y, currentX: x, currentY: y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing?.isDrawing) return
    const { x, y } = getCanvasPos(e)
    setDrawing((d) => d ? { ...d, currentX: x, currentY: y } : d)
    redraw()
  }

  const handleMouseUp = () => {
    if (!drawing?.isDrawing) return
    const { startX, startY, currentX, currentY } = drawing

    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    if (width < GRID_SIZE || height < GRID_SIZE) { setDrawing(null); return }

    const id = `${tool}-${Date.now()}`
    let newEl: FloorPlanElement

    if (tool === 'room') {
      newEl = { id, type: 'room', x, y, width, height, rotation: 0, label: ROOM_LABELS[roomType], color: ROOM_COLORS[roomType], properties: { roomType } }
    } else if (tool === 'wall') {
      newEl = { id, type: 'wall', x, y, width, height: Math.max(height, GRID_SIZE / 2), rotation: 0, label: 'Wall', color: '#374151', properties: { thickness: 10 } }
    } else if (tool === 'door') {
      newEl = { id, type: 'door', x, y, width: Math.max(width, GRID_SIZE * 2), height: GRID_SIZE, rotation: 0, label: 'Door', color: '#92400e', properties: { swing: 'inward' } }
    } else if (tool === 'window') {
      newEl = { id, type: 'window', x, y, width: Math.max(width, GRID_SIZE * 2), height: GRID_SIZE / 2, rotation: 0, label: 'Window', color: '#93c5fd', properties: {} }
    } else if (tool === 'column') {
      newEl = { id, type: 'column', x, y, width: GRID_SIZE, height: GRID_SIZE, rotation: 0, label: 'Column', color: '#6b7280', properties: {} }
    } else if (tool === 'stair') {
      newEl = { id, type: 'stair', x, y, width: Math.max(width, GRID_SIZE * 2), height: Math.max(height, GRID_SIZE * 3), rotation: 0, label: 'Stairs', color: '#e5e7eb', properties: {} }
    } else {
      setDrawing(null)
      return
    }

    pushHistory([...elements, newEl])
    setDrawing(null)
  }

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(zoom, zoom)

    if (showGrid) {
      ctx.strokeStyle = 'rgba(108,99,255,0.08)'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= canvas.width / zoom; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height / zoom); ctx.stroke()
      }
      for (let y = 0; y <= canvas.height / zoom; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width / zoom, y); ctx.stroke()
      }
    }

    elements.forEach((el) => {
      ctx.save()
      const isSelected = el.id === selectedId
      ctx.fillStyle = el.color || '#e5e7eb'
      ctx.strokeStyle = isSelected ? '#6C63FF' : (el.type === 'wall' ? '#1f2937' : 'rgba(0,0,0,0.3)')
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.fillRect(el.x, el.y, el.width, el.height)
      ctx.strokeRect(el.x, el.y, el.width, el.height)
      if (isSelected) {
        ctx.strokeStyle = '#6C63FF'
        ctx.setLineDash([4, 4])
        ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4)
        ctx.setLineDash([])
      }
      if (el.label && el.width > 30 && el.height > 20) {
        ctx.fillStyle = '#1f2937'
        ctx.font = `${Math.min(12, el.height / 3)}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(el.label, el.x + el.width / 2, el.y + el.height / 2)
        if (el.type === 'room' && el.width > 60) {
          const area = Math.round((el.width * el.height) / (GRID_SIZE * GRID_SIZE))
          ctx.font = '9px Inter, sans-serif'
          ctx.fillStyle = '#6b7280'
          ctx.fillText(`${area} sq ft`, el.x + el.width / 2, el.y + el.height / 2 + 14)
        }
      }
      ctx.restore()
    })

    if (drawing?.isDrawing) {
      const x = Math.min(drawing.startX, drawing.currentX)
      const y = Math.min(drawing.startY, drawing.currentY)
      const w = Math.abs(drawing.currentX - drawing.startX)
      const h = Math.abs(drawing.currentY - drawing.startY)
      ctx.strokeStyle = '#6C63FF'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 3])
      ctx.strokeRect(x, y, w, h)
      ctx.fillStyle = 'rgba(108,99,255,0.1)'
      ctx.fillRect(x, y, w, h)
      ctx.setLineDash([])
    }

    ctx.restore()
  }, [elements, selectedId, showGrid, zoom, drawing])

  useEffect(() => { redraw() }, [redraw])

  const deleteSelected = () => {
    if (selectedId) {
      pushHistory(elements.filter((e) => e.id !== selectedId))
      setSelectedId(null)
    }
  }

  const totalArea = elements.filter((e) => e.type === 'room').reduce((s, e) => s + (e.width * e.height) / (GRID_SIZE * GRID_SIZE), 0)

  const generateAIFloorPlan = async () => {
    if (!project) return
    setAiLoading(true)
    try {
      const res = await api.post('/ai/generate-floorplan', {
        projectId, plotWidth: project.plotWidth || 30, plotLength: project.plotLength || 40,
        floors: project.floors || 1, houseStyle: project.houseStyle || 'modern',
        rooms: ['living', 'kitchen', 'bedroom', 'bathroom'],
      })
      const generated = res.data.floorPlan
      pushHistory(generated.elements || [])
      toast.success('AI floor plan generated!')
      setAiDialogOpen(false)
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${project?.projectName || 'floorplan'}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('Floor plan exported as PNG')
  }

  const selectedEl = elements.find((e) => e.id === selectedId)

  const tools: { key: Tool; label: string; icon: React.ReactNode }[] = [
    { key: 'select', label: 'Select', icon: '↖' },
    { key: 'wall', label: 'Wall', icon: '▬' },
    { key: 'door', label: 'Door', icon: '🚪' },
    { key: 'window', label: 'Window', icon: '⬜' },
    { key: 'room', label: 'Room', icon: '🏠' },
    { key: 'column', label: 'Column', icon: '⬛' },
    { key: 'stair', label: 'Stairs', icon: '📶' },
    { key: 'erase', label: 'Erase', icon: '✕' },
  ]

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Top Bar */}
      <Box display="flex" alignItems="center" gap={2} px={1} py={0.5} flexWrap="wrap">
        <Button size="small" startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}`)}>Back</Button>
        <Typography variant="subtitle1" fontWeight={600}>{project?.projectName || 'Floor Plan Editor'}</Typography>
        <Box flex={1} />
        <Chip label={`Total: ${Math.round(totalArea)} sq ft`} icon={<SquareFoot />} size="small" color="primary" variant="outlined" />
        <Tooltip title="Measurements"><IconButton size="small" onClick={() => setMeasurementsDialogOpen(true)}><Straighten /></IconButton></Tooltip>
        <Tooltip title="Toggle Grid"><IconButton size="small" onClick={() => setShowGrid((g) => !g)}>{showGrid ? <GridOn /> : <GridOff />}</IconButton></Tooltip>
        <Tooltip title="Zoom Out"><IconButton size="small" onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}><ZoomOut /></IconButton></Tooltip>
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Typography>
        <Tooltip title="Zoom In"><IconButton size="small" onClick={() => setZoom((z) => Math.min(3, z + 0.1))}><ZoomIn /></IconButton></Tooltip>
        <Tooltip title="Undo"><span><IconButton size="small" onClick={undo} disabled={historyIdx <= 0}><Undo /></IconButton></span></Tooltip>
        <Tooltip title="Redo"><span><IconButton size="small" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo /></IconButton></span></Tooltip>
        <Button size="small" variant="outlined" startIcon={<AutoAwesome />} onClick={() => setAiDialogOpen(true)}>AI Generate</Button>
        <Button size="small" variant="outlined" startIcon={<Download />} onClick={exportCanvas}>Export PNG</Button>
        <Button size="small" variant="contained" startIcon={saveMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <Save />} onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
      </Box>

      <Box display="flex" flex={1} gap={1} overflow="hidden">
        {/* Left Toolbar */}
        <Paper sx={{ width: 120, p: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>TOOLS</Typography>
          {tools.map((t) => (
            <Button key={t.key} size="small" variant={tool === t.key ? 'contained' : 'text'}
              onClick={() => setTool(t.key)}
              sx={{ justifyContent: 'flex-start', fontSize: '0.75rem', px: 1 }}>
              <Box component="span" sx={{ mr: 0.5, fontSize: '1rem' }}>{t.icon}</Box>
              {t.label}
            </Button>
          ))}

          {tool === 'room' && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>ROOM TYPE</Typography>
              {(Object.keys(ROOM_LABELS) as RoomType[]).map((rt) => (
                <Button key={rt} size="small" variant={roomType === rt ? 'contained' : 'text'}
                  onClick={() => setRoomType(rt)}
                  sx={{ justifyContent: 'flex-start', fontSize: '0.7rem', px: 1 }}>
                  {ROOM_LABELS[rt]}
                </Button>
              ))}
            </>
          )}

          {selectedEl && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>SELECTED</Typography>
              <Typography variant="caption" sx={{ px: 1 }}>{selectedEl.label}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>{selectedEl.width}×{selectedEl.height}px</Typography>
              <Button size="small" color="error" startIcon={<Delete />} onClick={deleteSelected}>Delete</Button>
            </>
          )}
        </Paper>

        {/* Canvas Area */}
        <Box ref={containerRef} flex={1} overflow="auto" sx={{ bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
            style={{ cursor: tool === 'select' ? 'default' : tool === 'erase' ? 'crosshair' : 'crosshair', display: 'block' }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} />
        </Box>
      </Box>

      {/* AI Dialog */}
      <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Floor Plan Generator</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Generate an AI floor plan for:</Typography>
          {project && (
            <Stack spacing={1} mt={1}>
              <Typography variant="body2">• Plot: {project.plotWidth || 30}ft × {project.plotLength || 40}ft</Typography>
              <Typography variant="body2">• Floors: {project.floors || 1}</Typography>
              <Typography variant="body2">• Style: {project.houseStyle || 'modern'}</Typography>
            </Stack>
          )}
          <Typography variant="body2" color="text.secondary" mt={2}>This will replace the current floor plan elements.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />} onClick={generateAIFloorPlan} disabled={aiLoading}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Measurements Dialog */}
      <Dialog open={measurementsDialogOpen} onClose={() => setMeasurementsDialogOpen(false)}>
        <DialogTitle>Measurements</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>Total Floor Area: {Math.round(totalArea)} sq ft</Typography>
          <Typography variant="subtitle2" gutterBottom>Carpet Area: {Math.round(totalArea * 0.85)} sq ft</Typography>
          <Divider sx={{ my: 1 }} />
          {elements.filter((e) => e.type === 'room').map((e) => (
            <Typography key={e.id} variant="body2">
              {e.label}: {Math.round((e.width * e.height) / (GRID_SIZE * GRID_SIZE))} sq ft
            </Typography>
          ))}
          {elements.filter((e) => e.type === 'room').length === 0 && <Typography color="text.secondary">No rooms placed yet</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeasurementsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
