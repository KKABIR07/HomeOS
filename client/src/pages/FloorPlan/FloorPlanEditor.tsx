// @ts-nocheck
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, IconButton, Tooltip, Stack, Divider,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Slider, ToggleButton, ToggleButtonGroup,
  Menu, MenuItem, Badge,
} from '@mui/material'
import {
  Undo, Redo, Delete, ZoomIn, ZoomOut, GridOn, GridOff,
  Save, Download, ArrowBack, AutoAwesome, Straighten,
  NearMe, DoorBack, Window, SquareFoot, TableRows,
  Stairs, Roofing, CleaningServices, ContentCopy, FitScreen,
  KingBed, Kitchen, Bathtub, Weekend, Garage, Balcony,
  MeetingRoom, Work, OpenWith, Crop, Add,
} from '@mui/icons-material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'
import type { FloorPlanElement } from '../../types/floorplan'

// ─── Types ────────────────────────────────────────────────────────────────────
type DrawTool = 'select' | 'wall' | 'door' | 'window' | 'column' | 'stair' | 'erase'
type RoomTool = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining' | 'garage' | 'balcony' | 'study' | 'custom'

interface CanvasPan { x: number; y: number }

// ─── Constants ────────────────────────────────────────────────────────────────
const GRID = 20
const SCALE_FT = 1 // 20px = 1 ft

const ROOM_STYLES: Record<RoomTool, { color: string; border: string; label: string }> = {
  living:    { color: '#dbeafe', border: '#3b82f6', label: 'Living Room' },
  bedroom:   { color: '#fef3c7', border: '#f59e0b', label: 'Bedroom' },
  kitchen:   { color: '#d1fae5', border: '#10b981', label: 'Kitchen' },
  bathroom:  { color: '#ede9fe', border: '#8b5cf6', label: 'Bathroom' },
  dining:    { color: '#fce7f3', border: '#ec4899', label: 'Dining Room' },
  garage:    { color: '#f3f4f6', border: '#6b7280', label: 'Garage' },
  balcony:   { color: '#ecfdf5', border: '#34d399', label: 'Balcony' },
  study:     { color: '#fff7ed', border: '#f97316', label: 'Study' },
  custom:    { color: '#f0f4ff', border: '#6366f1', label: 'Room' },
}

const TOOL_CURSOR: Record<DrawTool, string> = {
  select: 'default', wall: 'crosshair', door: 'crosshair',
  window: 'crosshair', column: 'crosshair', stair: 'crosshair', erase: 'not-allowed',
}

// ─── Drawing tools config ─────────────────────────────────────────────────────
const DRAW_TOOLS: { tool: DrawTool; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { tool: 'select', label: 'Select / Move', icon: <NearMe sx={{ fontSize: 18 }} />, shortcut: 'S' },
  { tool: 'wall', label: 'Wall', icon: <TableRows sx={{ fontSize: 18 }} />, shortcut: 'W' },
  { tool: 'door', label: 'Door', icon: <DoorBack sx={{ fontSize: 18 }} />, shortcut: 'D' },
  { tool: 'window', label: 'Window', icon: <Window sx={{ fontSize: 18 }} />, shortcut: 'I' },
  { tool: 'column', label: 'Column', icon: <Crop sx={{ fontSize: 18 }} />, shortcut: 'C' },
  { tool: 'stair', label: 'Staircase', icon: <Stairs sx={{ fontSize: 18 }} />, shortcut: 'T' },
  { tool: 'erase', label: 'Erase', icon: <CleaningServices sx={{ fontSize: 18 }} />, shortcut: 'E' },
]

const ROOM_TOOLS: { type: RoomTool; icon: React.ReactNode }[] = [
  { type: 'living', icon: <Weekend sx={{ fontSize: 14 }} /> },
  { type: 'bedroom', icon: <KingBed sx={{ fontSize: 14 }} /> },
  { type: 'kitchen', icon: <Kitchen sx={{ fontSize: 14 }} /> },
  { type: 'bathroom', icon: <Bathtub sx={{ fontSize: 14 }} /> },
  { type: 'dining', icon: <MeetingRoom sx={{ fontSize: 14 }} /> },
  { type: 'garage', icon: <Garage sx={{ fontSize: 14 }} /> },
  { type: 'balcony', icon: <Balcony sx={{ fontSize: 14 }} /> },
  { type: 'study', icon: <Work sx={{ fontSize: 14 }} /> },
]

// ─── Snap to grid ─────────────────────────────────────────────────────────────
const snap = (v: number) => Math.round(v / GRID) * GRID

// ─── Canvas position from mouse event ────────────────────────────────────────
const getCanvasPos = (e: React.MouseEvent, canvas: HTMLCanvasElement, zoom: number, pan: CanvasPan) => {
  const rect = canvas.getBoundingClientRect()
  return {
    x: snap((e.clientX - rect.left - pan.x) / zoom),
    y: snap((e.clientY - rect.top - pan.y) / zoom),
  }
}

// ─── Render canvas ────────────────────────────────────────────────────────────
function renderCanvas(
  canvas: HTMLCanvasElement,
  elements: FloorPlanElement[],
  selectedId: string | null,
  hoverId: string | null,
  showGrid: boolean,
  zoom: number,
  pan: CanvasPan,
  drawing: { x: number; y: number; ex: number; ey: number } | null,
  activeTool: DrawTool,
  activeRoomType: RoomTool,
  dark: boolean,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width; const H = canvas.height

  ctx.clearRect(0, 0, W, H)
  ctx.save()
  ctx.translate(pan.x, pan.y)
  ctx.scale(zoom, zoom)

  // Background
  ctx.fillStyle = dark ? '#0f1117' : '#f8f9ff'
  ctx.fillRect(-pan.x / zoom, -pan.y / zoom, W / zoom, H / zoom)

  // Grid
  if (showGrid) {
    const gridColor = dark ? 'rgba(100,110,180,0.12)' : 'rgba(108,99,255,0.08)'
    const majorColor = dark ? 'rgba(100,110,180,0.22)' : 'rgba(108,99,255,0.15)'
    const ox = (-pan.x / zoom) - GRID * 2
    const oy = (-pan.y / zoom) - GRID * 2
    const ew = W / zoom + GRID * 4
    const eh = H / zoom + GRID * 4

    for (let x = Math.floor(ox / GRID) * GRID; x <= ox + ew; x += GRID) {
      ctx.strokeStyle = x % (GRID * 5) === 0 ? majorColor : gridColor
      ctx.lineWidth = x % (GRID * 5) === 0 ? 0.8 : 0.4
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + eh); ctx.stroke()
    }
    for (let y = Math.floor(oy / GRID) * GRID; y <= oy + eh; y += GRID) {
      ctx.strokeStyle = y % (GRID * 5) === 0 ? majorColor : gridColor
      ctx.lineWidth = y % (GRID * 5) === 0 ? 0.8 : 0.4
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + ew, y); ctx.stroke()
    }
  }

  // Draw elements
  for (const el of elements) {
    const isSel = el.id === selectedId
    const isHov = el.id === hoverId

    ctx.save()

    if (el.type === 'room') {
      const style = ROOM_STYLES[el.properties?.roomType as RoomTool] ?? ROOM_STYLES.custom
      // Fill
      ctx.fillStyle = isSel ? style.border + '44' : isHov ? style.color + 'dd' : style.color + 'cc'
      ctx.strokeStyle = isSel ? style.border : isHov ? style.border + 'cc' : style.border + '88'
      ctx.lineWidth = isSel ? 2.5 : isHov ? 2 : 1.5
      ctx.beginPath()
      ctx.roundRect(el.x, el.y, el.width, el.height, 3)
      ctx.fill()
      ctx.stroke()

      // Label
      if (el.width > 30 && el.height > 24) {
        ctx.fillStyle = dark ? '#e0e7ff' : '#1e1b4b'
        ctx.font = `${isSel ? 600 : 500} ${Math.min(12, el.height / 3.5)}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(el.label, el.x + el.width / 2, el.y + el.height / 2 - 6)

        // Area
        const areaSqFt = Math.round((el.width / GRID) * (el.height / GRID))
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.font = `400 ${Math.min(9, el.height / 5)}px Inter, sans-serif`
        ctx.fillText(`${areaSqFt} sq ft`, el.x + el.width / 2, el.y + el.height / 2 + 8)
      }

      // Dimension lines when selected
      if (isSel) {
        const wFt = (el.width / GRID).toFixed(1)
        const hFt = (el.height / GRID).toFixed(1)
        ctx.strokeStyle = '#6C63FF'
        ctx.fillStyle = '#6C63FF'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        // Width dim
        ctx.beginPath(); ctx.moveTo(el.x, el.y - 10); ctx.lineTo(el.x + el.width, el.y - 10); ctx.stroke()
        ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
        ctx.fillText(`${wFt}ft`, el.x + el.width / 2, el.y - 12)
        // Height dim
        ctx.beginPath(); ctx.moveTo(el.x - 10, el.y); ctx.lineTo(el.x - 10, el.y + el.height); ctx.stroke()
        ctx.save(); ctx.translate(el.x - 24, el.y + el.height / 2)
        ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
        ctx.fillText(`${hFt}ft`, 0, 0); ctx.restore()
        ctx.setLineDash([])
      }

    } else if (el.type === 'wall') {
      ctx.strokeStyle = isSel ? '#6C63FF' : dark ? '#94a3b8' : '#374151'
      ctx.lineWidth = Math.max(el.height, 8)
      ctx.lineCap = 'square'
      ctx.beginPath(); ctx.moveTo(el.x, el.y + el.height / 2)
      ctx.lineTo(el.x + el.width, el.y + el.height / 2); ctx.stroke()
      // Wall hatch
      if (!isSel && el.height >= 10) {
        ctx.strokeStyle = dark ? '#475569' : '#9ca3af'
        ctx.lineWidth = 0.5
        for (let xi = el.x + 4; xi < el.x + el.width - 2; xi += 6) {
          ctx.beginPath(); ctx.moveTo(xi, el.y + 2); ctx.lineTo(xi - 4, el.y + el.height - 2); ctx.stroke()
        }
      }

    } else if (el.type === 'door') {
      ctx.strokeStyle = isSel ? '#6C63FF' : '#92400e'
      ctx.lineWidth = 2
      // Door leaf
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.width, el.y); ctx.stroke()
      // Swing arc
      ctx.strokeStyle = isSel ? '#6C63FF' : '#b45309'
      ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.arc(el.x, el.y, el.width, 0, Math.PI / 2); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = isSel ? '#6C63FF' : '#92400e'
      ctx.font = '9px Inter'; ctx.textAlign = 'center'
      ctx.fillText('Door', el.x + el.width / 2, el.y - 6)

    } else if (el.type === 'window') {
      ctx.strokeStyle = isSel ? '#6C63FF' : '#3b82f6'
      ctx.lineWidth = 1.5
      ctx.fillStyle = '#bfdbfe44'
      ctx.fillRect(el.x, el.y, el.width, GRID)
      ctx.strokeRect(el.x, el.y, el.width, GRID)
      // Center line
      ctx.beginPath(); ctx.moveTo(el.x + el.width / 2, el.y)
      ctx.lineTo(el.x + el.width / 2, el.y + GRID); ctx.stroke()
      // Diagonal hatch
      ctx.strokeStyle = '#93c5fd88'
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.width, el.y + GRID); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(el.x + el.width, el.y); ctx.lineTo(el.x, el.y + GRID); ctx.stroke()

    } else if (el.type === 'column') {
      ctx.fillStyle = isSel ? '#6C63FF44' : dark ? '#475569' : '#d1d5db'
      ctx.strokeStyle = isSel ? '#6C63FF' : dark ? '#94a3b8' : '#374151'
      ctx.lineWidth = 1.5
      ctx.fillRect(el.x, el.y, el.width, el.height)
      ctx.strokeRect(el.x, el.y, el.width, el.height)
      // Diagonal cross
      ctx.strokeStyle = isSel ? '#6C63FF' : dark ? '#94a3b8' : '#6b7280'
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.width, el.y + el.height); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(el.x + el.width, el.y); ctx.lineTo(el.x, el.y + el.height); ctx.stroke()

    } else if (el.type === 'stair') {
      ctx.fillStyle = isSel ? '#6C63FF22' : dark ? '#1e293b' : '#f1f5f9'
      ctx.strokeStyle = isSel ? '#6C63FF' : dark ? '#94a3b8' : '#475569'
      ctx.lineWidth = 1.5
      ctx.fillRect(el.x, el.y, el.width, el.height)
      ctx.strokeRect(el.x, el.y, el.width, el.height)
      // Stair steps
      const steps = Math.floor(el.height / 8)
      ctx.strokeStyle = isSel ? '#6C63FF88' : dark ? '#64748b' : '#94a3b8'
      ctx.lineWidth = 0.6
      for (let s = 1; s < steps; s++) {
        const sy = el.y + (s / steps) * el.height
        ctx.beginPath(); ctx.moveTo(el.x, sy); ctx.lineTo(el.x + el.width, sy); ctx.stroke()
      }
      // Arrow
      ctx.strokeStyle = isSel ? '#6C63FF' : dark ? '#94a3b8' : '#475569'
      ctx.lineWidth = 1.5
      const ax = el.x + el.width / 2, ay = el.y + 6
      const ab = el.y + el.height - 6
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ab); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ax - 4, ay + 6); ctx.lineTo(ax, ay); ctx.lineTo(ax + 4, ay + 6); ctx.stroke()
      ctx.font = '8px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = isSel ? '#6C63FF' : dark ? '#94a3b8' : '#475569'
      ctx.fillText('UP', ax, el.y + el.height / 2 + 4)
    }

    // Selection handles
    if (isSel && el.type !== 'wall' && el.type !== 'door' && el.type !== 'window') {
      const handles = [
        [el.x, el.y], [el.x + el.width / 2, el.y], [el.x + el.width, el.y],
        [el.x + el.width, el.y + el.height / 2], [el.x + el.width, el.y + el.height],
        [el.x + el.width / 2, el.y + el.height], [el.x, el.y + el.height], [el.x, el.y + el.height / 2],
      ]
      handles.forEach(([hx, hy]) => {
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#6C63FF'
        ctx.lineWidth = 1.5
        ctx.fillRect(hx - 4, hy - 4, 8, 8)
        ctx.strokeRect(hx - 4, hy - 4, 8, 8)
      })
    }

    ctx.restore()
  }

  // Live drawing preview
  if (drawing) {
    const { x, y, ex, ey } = drawing
    const w = ex - x; const h = ey - y
    ctx.save()
    ctx.strokeStyle = '#6C63FF'
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 4])

    if (activeTool === 'room') {
      const style = ROOM_STYLES[activeRoomType]
      ctx.fillStyle = style.color + '55'
      ctx.strokeStyle = style.border
      ctx.fillRect(Math.min(x, ex), Math.min(y, ey), Math.abs(w), Math.abs(h))
      ctx.strokeRect(Math.min(x, ex), Math.min(y, ey), Math.abs(w), Math.abs(h))
      // Live dimensions
      ctx.setLineDash([]); ctx.fillStyle = '#6C63FF'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center'
      ctx.fillText(`${(Math.abs(w) / GRID).toFixed(1)}ft × ${(Math.abs(h) / GRID).toFixed(1)}ft`, Math.min(x, ex) + Math.abs(w) / 2, Math.min(y, ey) - 8)
    } else if (activeTool === 'wall') {
      ctx.strokeStyle = '#6C63FF'; ctx.lineWidth = 8; ctx.lineCap = 'square'
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke()
      const len = Math.sqrt(w * w + h * h)
      ctx.setLineDash([]); ctx.fillStyle = '#6C63FF'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center'
      ctx.fillText(`${(len / GRID).toFixed(1)}ft`, (x + ex) / 2, (y + ey) / 2 - 12)
    } else {
      ctx.strokeRect(Math.min(x, ex), Math.min(y, ey), Math.abs(w), Math.abs(h))
    }
    ctx.restore()
  }

  // Compass rose
  ctx.save()
  const cx = W - 30, cy2 = H - 30, r = 18
  ctx.globalAlpha = 0.5
  ctx.font = 'bold 8px Inter'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
  for (const [label, angle] of [['N', -Math.PI / 2], ['S', Math.PI / 2], ['E', 0], ['W', Math.PI]] as [string, number][]) {
    ctx.fillText(label, cx + Math.cos(angle) * (r + 4) / zoom, cy2 + Math.sin(angle) * (r + 4) / zoom)
  }
  ctx.globalAlpha = 1
  ctx.restore()

  ctx.restore()
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FloorPlanEditor() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [drawTool, setDrawTool] = useState<DrawTool>('select')
  const [roomTool, setRoomTool] = useState<RoomTool>('living')
  const [activeToolGroup, setActiveToolGroup] = useState<'draw' | 'room'>('draw')
  const [elements, setElements] = useState<FloorPlanElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [history, setHistory] = useState<FloorPlanElement[][]>([[]])
  const [histIdx, setHistIdx] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<CanvasPan>({ x: 40, y: 40 })
  const [drawing, setDrawing] = useState<{ x: number; y: number; ex: number; ey: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ mx: 0, my: 0, px: 0, py: 0 })
  const [floorPlanId, setFloorPlanId] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [propOpen, setPropOpen] = useState(false)
  const [propLabel, setPropLabel] = useState('')
  const [darkCanvas, setDarkCanvas] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
    enabled: !!projectId,
  })

  const { data: floorPlans } = useQuery({
    queryKey: ['floorplans', projectId],
    queryFn: async () => (await api.get(`/floorplans?projectId=${projectId}`)).data.floorPlans,
    enabled: !!projectId,
  })

  useEffect(() => {
    if (floorPlans?.length > 0) {
      setElements(floorPlans[0].elements || [])
      setFloorPlanId(floorPlans[0]._id)
    }
  }, [floorPlans])

  // ── Canvas size ─────────────────────────────────────────────────────────────
  const CWIDTH = 1200; const CHEIGHT = 800

  // ── Re-render ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    renderCanvas(canvasRef.current, elements, selectedId, hoverId, showGrid, zoom, pan, drawing, drawTool, roomTool, darkCanvas)
  }, [elements, selectedId, hoverId, showGrid, zoom, pan, drawing, drawTool, roomTool, darkCanvas])

  // ── History ─────────────────────────────────────────────────────────────────
  const pushHistory = useCallback((els: FloorPlanElement[]) => {
    setHistory((h) => { const n = h.slice(0, histIdx + 1); n.push([...els]); return n.length > 60 ? n.slice(-60) : n })
    setHistIdx((i) => Math.min(i + 1, 59))
    setElements(els)
  }, [histIdx])

  const undo = useCallback(() => {
    if (histIdx > 0) { setHistIdx(i => i - 1); setElements([...history[histIdx - 1]]) }
  }, [histIdx, history])

  const redo = useCallback(() => {
    if (histIdx < history.length - 1) { setHistIdx(i => i + 1); setElements([...history[histIdx + 1]]) }
  }, [histIdx, history])

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo() }
        if (e.key === 'y') { e.preventDefault(); redo() }
        if (e.key === 's') { e.preventDefault(); saveMutation.mutate() }
        return
      }
      switch (e.key.toUpperCase()) {
        case 'S': setDrawTool('select'); setActiveToolGroup('draw'); break
        case 'W': setDrawTool('wall'); setActiveToolGroup('draw'); break
        case 'D': setDrawTool('door'); setActiveToolGroup('draw'); break
        case 'I': setDrawTool('window'); setActiveToolGroup('draw'); break
        case 'C': setDrawTool('column'); setActiveToolGroup('draw'); break
        case 'T': setDrawTool('stair'); setActiveToolGroup('draw'); break
        case 'E': setDrawTool('erase'); setActiveToolGroup('draw'); break
        case 'ESCAPE': setSelectedId(null); setDrawing(null); break
        case 'DELETE': case 'BACKSPACE':
          if (selectedId) { pushHistory(elements.filter(el => el.id !== selectedId)); setSelectedId(null) }
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, elements, undo, redo, pushHistory])

  // ── Mouse helpers ────────────────────────────────────────────────────────────
  const hitTest = useCallback((x: number, y: number) =>
    [...elements].reverse().find(el =>
      x >= el.x - 4 && x <= el.x + el.width + 4 &&
      y >= el.y - 4 && y <= el.y + el.height + 4
    ), [elements])

  const getPos = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    return getCanvasPos(e, canvasRef.current, zoom, pan)
  }, [zoom, pan])

  // ── Mouse events ─────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y })
      return
    }
    const { x, y } = getPos(e)

    if (drawTool === 'select') {
      const hit = hitTest(x, y)
      setSelectedId(hit?.id ?? null)
      return
    }
    if (drawTool === 'erase') {
      const hit = hitTest(x, y)
      if (hit) { pushHistory(elements.filter(el => el.id !== hit.id)) }
      return
    }
    setDrawing({ x, y, ex: x, ey: y })
  }, [drawTool, pan, getPos, hitTest, elements, pushHistory])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({ x: panStart.px + (e.clientX - panStart.mx), y: panStart.py + (e.clientY - panStart.my) })
      return
    }
    const { x, y } = getPos(e)
    if (drawing) { setDrawing(d => d ? { ...d, ex: x, ey: y } : d); return }

    if (drawTool === 'select') {
      const hit = hitTest(x, y)
      setHoverId(hit?.id ?? null)
      if (canvasRef.current) canvasRef.current.style.cursor = hit ? 'move' : 'default'
    }
  }, [isPanning, panStart, drawing, drawTool, getPos, hitTest])

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) { setIsPanning(false); return }
    if (!drawing) return
    const { x, y, ex, ey } = drawing
    const rx = Math.min(x, ex); const ry = Math.min(y, ey)
    const rw = Math.abs(ex - x); const rh = Math.abs(ey - y)
    if (rw < GRID || rh < GRID) { setDrawing(null); return }

    const id = `${drawTool}-${Date.now()}`
    let el: FloorPlanElement | null = null

    if (activeToolGroup === 'room') {
      const style = ROOM_STYLES[roomTool]
      el = { id, type: 'room', x: rx, y: ry, width: rw, height: rh, rotation: 0, label: style.label, color: style.color, properties: { roomType: roomTool } }
    } else {
      switch (drawTool) {
        case 'wall':
          el = { id, type: 'wall', x: rx, y: ry, width: rw, height: Math.max(rh, GRID / 2), rotation: 0, label: 'Wall', color: '#374151', properties: { thickness: 10 } }
          break
        case 'door':
          el = { id, type: 'door', x: rx, y: ry, width: Math.max(rw, GRID * 2), height: GRID, rotation: 0, label: 'Door', color: '#92400e', properties: { swing: 'inward' } }
          break
        case 'window':
          el = { id, type: 'window', x: rx, y: ry, width: Math.max(rw, GRID * 2), height: GRID, rotation: 0, label: 'Window', color: '#93c5fd', properties: {} }
          break
        case 'column':
          el = { id, type: 'column', x: rx, y: ry, width: Math.max(rw, GRID), height: Math.max(rh, GRID), rotation: 0, label: 'Column', color: '#6b7280', properties: {} }
          break
        case 'stair':
          el = { id, type: 'stair', x: rx, y: ry, width: Math.max(rw, GRID * 2), height: Math.max(rh, GRID * 3), rotation: 0, label: 'Stairs', color: '#e5e7eb', properties: {} }
          break
      }
    }
    if (el) { pushHistory([...elements, el]); setSelectedId(el.id) }
    setDrawing(null)
  }, [isPanning, drawing, drawTool, activeToolGroup, roomTool, elements, pushHistory])

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left; const my = e.clientY - rect.top
    setZoom(z => {
      const nz = Math.max(0.3, Math.min(4, z * factor))
      setPan(p => ({ x: mx - (mx - p.x) * (nz / z), y: my - (my - p.y) * (nz / z) }))
      return nz
    })
  }, [])

  // ── Save ─────────────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const totalArea = elements.filter(e => e.type === 'room')
        .reduce((s, e) => s + (e.width * e.height) / (GRID * GRID), 0)
      const payload = {
        projectId, name: `${project?.projectName || 'Floor'} - Floor 1`, floor: 1, elements,
        dimensions: { width: CWIDTH, height: CHEIGHT, scale: GRID },
        gridSize: GRID,
        measurements: {
          totalArea: Math.round(totalArea), carpetArea: Math.round(totalArea * 0.85),
          rooms: elements.filter(e => e.type === 'room').map(e => ({ name: e.label, area: Math.round((e.width * e.height) / (GRID * GRID)) })),
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
    onError: () => toast.error('Save failed'),
  })

  // ── AI Generate ──────────────────────────────────────────────────────────────
  const generateAI = async () => {
    if (!project) return
    setAiLoading(true)
    try {
      const res = await api.post('/ai/generate-floorplan', {
        projectId, plotWidth: project.plotWidth || 30, plotLength: project.plotLength || 40,
        floors: project.floors || 1, houseStyle: project.houseStyle || 'modern',
        rooms: ['living', 'kitchen', 'bedroom', 'bathroom'],
      })
      pushHistory(res.data.floorPlan.elements || [])
      toast.success('AI floor plan generated!')
      setAiOpen(false)
    } catch { toast.error('AI generation failed') }
    finally { setAiLoading(false) }
  }

  // ── Export PNG ───────────────────────────────────────────────────────────────
  const exportPNG = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `${project?.projectName || 'floorplan'}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
    toast.success('Exported as PNG')
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const rooms = elements.filter(e => e.type === 'room')
    return {
      totalArea: Math.round(rooms.reduce((s, e) => s + (e.width * e.height) / (GRID * GRID), 0)),
      roomCount: rooms.length, wallCount: elements.filter(e => e.type === 'wall').length,
    }
  }, [elements])

  const selectedEl = elements.find(e => e.id === selectedId)

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <Tooltip title="Back to project">
          <IconButton size="small" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowBack fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 0.5 }}>Floor Plan Editor</Typography>
        {project && <Chip label={project.projectName} size="small" color="primary" variant="outlined" />}
        <Box flex={1} />

        {/* Undo/Redo */}
        <Tooltip title="Undo (Ctrl+Z)"><span><IconButton size="small" onClick={undo} disabled={histIdx <= 0}><Undo fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title="Redo (Ctrl+Y)"><span><IconButton size="small" onClick={redo} disabled={histIdx >= history.length - 1}><Redo fontSize="small" /></IconButton></span></Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Zoom */}
        <Tooltip title="Zoom out (scroll)"><IconButton size="small" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}><ZoomOut fontSize="small" /></IconButton></Tooltip>
        <Chip label={`${Math.round(zoom * 100)}%`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22, minWidth: 48, cursor: 'pointer' }} onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }) }} />
        <Tooltip title="Zoom in (scroll)"><IconButton size="small" onClick={() => setZoom(z => Math.min(4, z + 0.15))}><ZoomIn fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Fit to screen"><IconButton size="small" onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }) }}><FitScreen fontSize="small" /></IconButton></Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Toggle grid"><IconButton size="small" color={showGrid ? 'primary' : 'default'} onClick={() => setShowGrid(g => !g)}>{showGrid ? <GridOn fontSize="small" /> : <GridOff fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title="Dark canvas"><IconButton size="small" color={darkCanvas ? 'primary' : 'default'} onClick={() => setDarkCanvas(d => !d)}><Roofing fontSize="small" /></IconButton></Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="AI Generate Floor Plan">
          <Button size="small" variant="outlined" startIcon={<AutoAwesome sx={{ fontSize: 14 }} />} onClick={() => setAiOpen(true)} sx={{ fontSize: '0.72rem', py: 0.35 }}>AI Generate</Button>
        </Tooltip>
        <Tooltip title="Export PNG">
          <Button size="small" variant="outlined" startIcon={<Download sx={{ fontSize: 14 }} />} onClick={exportPNG} sx={{ fontSize: '0.72rem', py: 0.35 }}>Export</Button>
        </Tooltip>
        <Button size="small" variant="contained" startIcon={saveMutation.isPending ? <CircularProgress size={12} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
          onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          sx={{ fontSize: '0.72rem', py: 0.35, background: 'linear-gradient(135deg,#6C63FF,#8B85FF)' }}>
          Save
        </Button>
      </Box>

      <Box display="flex" flex={1} overflow="hidden">
        {/* ── Left toolbar ─────────────────────────────────────────────────── */}
        <Paper square elevation={0} sx={{ width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1, gap: 0.3, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
          {/* Draw tools */}
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.disabled', letterSpacing: 0.5, mb: 0.3 }}>DRAW</Typography>
          {DRAW_TOOLS.map(({ tool, label, icon, shortcut }) => (
            <Tooltip key={tool} title={`${label} (${shortcut})`} placement="right">
              <IconButton size="small"
                onClick={() => { setDrawTool(tool); setActiveToolGroup('draw') }}
                sx={{
                  width: 36, height: 36, borderRadius: 1.5,
                  bgcolor: drawTool === tool && activeToolGroup === 'draw' ? 'primary.main' : 'transparent',
                  color: drawTool === tool && activeToolGroup === 'draw' ? 'white' : 'text.secondary',
                  '&:hover': { bgcolor: drawTool === tool && activeToolGroup === 'draw' ? 'primary.dark' : 'action.hover' },
                }}>
                {icon}
              </IconButton>
            </Tooltip>
          ))}

          <Divider sx={{ width: 32, my: 0.5 }} />

          {/* Room tools */}
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.disabled', letterSpacing: 0.5, mb: 0.3 }}>ROOMS</Typography>
          {ROOM_TOOLS.map(({ type, icon }) => (
            <Tooltip key={type} title={ROOM_STYLES[type].label} placement="right">
              <IconButton size="small"
                onClick={() => { setRoomTool(type); setActiveToolGroup('room'); setDrawTool('select') }}
                sx={{
                  width: 36, height: 36, borderRadius: 1.5,
                  bgcolor: roomTool === type && activeToolGroup === 'room'
                    ? ROOM_STYLES[type].border : 'transparent',
                  color: roomTool === type && activeToolGroup === 'room' ? 'white' : 'text.secondary',
                  border: roomTool === type && activeToolGroup === 'room' ? 'none' : '1px solid transparent',
                  '&:hover': { bgcolor: ROOM_STYLES[type].color, color: ROOM_STYLES[type].border, borderColor: ROOM_STYLES[type].border },
                }}>
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Paper>

        {/* ── Canvas area ──────────────────────────────────────────────────── */}
        <Box ref={wrapperRef} flex={1} sx={{ overflow: 'hidden', position: 'relative', bgcolor: darkCanvas ? '#0f1117' : '#f0f2ff' }}>
          <canvas
            ref={canvasRef}
            width={CWIDTH}
            height={CHEIGHT}
            style={{
              display: 'block', width: '100%', height: '100%',
              cursor: isPanning ? 'grabbing' : activeToolGroup === 'room' ? 'crosshair' : TOOL_CURSOR[drawTool],
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { setIsPanning(false); setDrawing(null) }}
            onWheel={onWheel}
          />

          {/* Active tool badge */}
          <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
            <Chip size="small"
              label={activeToolGroup === 'room' ? ROOM_STYLES[roomTool].label : DRAW_TOOLS.find(t => t.tool === drawTool)?.label}
              sx={{ fontSize: '0.7rem', height: 22, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)' }} />
          </Box>

          {/* Scale bar */}
          <Box sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.55)', px: 1.5, py: 0.4, borderRadius: 2 }}>
            <Box sx={{ width: GRID * 5 * zoom, height: 3, bgcolor: 'white', borderRadius: 2 }} />
            <Typography variant="caption" color="white" sx={{ fontSize: '0.65rem' }}>5 ft</Typography>
          </Box>
        </Box>

        {/* ── Right panel (properties / stats) ─────────────────────────────── */}
        <Paper square elevation={0} sx={{ width: 200, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Box sx={{ p: 1.5 }}>
            {/* Stats */}
            <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'text.secondary', letterSpacing: 1 }}>STATISTICS</Typography>
            <Stack spacing={0.5} mt={0.5} mb={1.5}>
              {[
                { label: 'Total Area', value: `${stats.totalArea} sq ft` },
                { label: 'Carpet Area', value: `${Math.round(stats.totalArea * 0.85)} sq ft` },
                { label: 'Rooms', value: stats.roomCount },
                { label: 'Walls', value: stats.wallCount },
                { label: 'Elements', value: elements.length },
              ].map(({ label, value }) => (
                <Box key={label} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="caption" fontWeight={700}>{value}</Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            {/* Element properties */}
            <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'text.secondary', letterSpacing: 1 }}>
              {selectedEl ? 'PROPERTIES' : 'SELECTION'}
            </Typography>

            {!selectedEl && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                Click an element to inspect properties
              </Typography>
            )}

            {selectedEl && (
              <Stack spacing={1} mt={0.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Label</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedEl.label}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Chip label={selectedEl.type} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Size</Typography>
                  <Typography variant="body2">{(selectedEl.width / GRID).toFixed(1)}ft × {(selectedEl.height / GRID).toFixed(1)}ft</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Position</Typography>
                  <Typography variant="body2">({selectedEl.x / GRID}ft, {selectedEl.y / GRID}ft)</Typography>
                </Box>
                {selectedEl.type === 'room' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Area</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      {Math.round((selectedEl.width / GRID) * (selectedEl.height / GRID))} sq ft
                    </Typography>
                  </Box>
                )}
                <Stack direction="row" spacing={0.5} mt={0.5}>
                  <Tooltip title="Duplicate"><IconButton size="small" onClick={() => {
                    const copy = { ...selectedEl, id: `${selectedEl.type}-${Date.now()}`, x: selectedEl.x + GRID, y: selectedEl.y + GRID }
                    pushHistory([...elements, copy])
                    setSelectedId(copy.id)
                  }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  <Tooltip title="Delete (Del)"><IconButton size="small" color="error" onClick={() => {
                    pushHistory(elements.filter(e => e.id !== selectedId))
                    setSelectedId(null)
                  }}><Delete sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                </Stack>
              </Stack>
            )}

            <Divider sx={{ my: 1.5 }} />

            {/* Keyboard shortcuts */}
            <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'text.secondary', letterSpacing: 1 }}>SHORTCUTS</Typography>
            <Stack spacing={0.3} mt={0.5}>
              {[['S', 'Select'], ['W', 'Wall'], ['D', 'Door'], ['I', 'Window'], ['E', 'Erase'], ['Del', 'Delete'], ['Ctrl+Z', 'Undo'], ['Ctrl+S', 'Save'], ['Scroll', 'Zoom'], ['Alt+Drag', 'Pan']].map(([k, v]) => (
                <Box key={k} display="flex" justifyContent="space-between">
                  <Box sx={{ bgcolor: 'action.selected', px: 0.6, py: 0.1, borderRadius: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>{k}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{v}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* ── AI Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={aiOpen} onClose={() => setAiOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" fontSize="small" /> AI Floor Plan Generator
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Generate a floor plan for <strong>{project?.projectName}</strong>:
          </Typography>
          {project && (
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Typography variant="body2">• Plot: {project.plotWidth || 30}ft × {project.plotLength || 40}ft</Typography>
              <Typography variant="body2">• Floors: {project.floors || 1}</Typography>
              <Typography variant="body2">• Style: {project.houseStyle || 'modern'}</Typography>
            </Stack>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            This will replace all current elements.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={aiLoading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesome />}
            onClick={generateAI} disabled={aiLoading}>
            {aiLoading ? 'Generating…' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
