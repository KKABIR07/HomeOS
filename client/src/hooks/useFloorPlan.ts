import { useState, useCallback, useRef } from 'react'
import type { FloorPlanElement, RoomType } from '../types/floorplan'
import { generateId, snapToGrid, getRoomColor } from '../utils/helpers'

type Tool = 'select' | 'wall' | 'room' | 'door' | 'window' | 'column' | 'stair' | 'delete'
type DrawingState = 'idle' | 'drawing' | 'selected'

interface UseFloorPlanOptions {
  gridSize?: number
  scale?: number
}

export const useFloorPlan = (options: UseFloorPlanOptions = {}) => {
  const { gridSize = 20, scale = 10 } = options

  const [elements, setElements] = useState<FloorPlanElement[]>([])
  const [selectedElement, setSelectedElement] = useState<FloorPlanElement | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [drawingState, setDrawingState] = useState<DrawingState>('idle')
  const [showGrid, setShowGrid] = useState(true)
  const [undoStack, setUndoStack] = useState<FloorPlanElement[][]>([])
  const [redoStack, setRedoStack] = useState<FloorPlanElement[][]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('bedroom')

  const startPointRef = useRef<{ x: number; y: number } | null>(null)

  const saveToHistory = useCallback(
    (currentElements: FloorPlanElement[]) => {
      setUndoStack((prev) => [...prev.slice(-19), [...currentElements]])
      setRedoStack([])
    },
    [],
  )

  const addElement = useCallback(
    (element: Omit<FloorPlanElement, 'id'>) => {
      const newElement: FloorPlanElement = {
        ...element,
        id: generateId(),
      }
      setElements((prev) => {
        const newElements = [...prev, newElement]
        saveToHistory(prev)
        return newElements
      })
      return newElement
    },
    [saveToHistory],
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<FloorPlanElement>) => {
      setElements((prev) => {
        saveToHistory(prev)
        return prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      })
    },
    [saveToHistory],
  )

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => {
        saveToHistory(prev)
        return prev.filter((el) => el.id !== id)
      })
      if (selectedElement?.id === id) {
        setSelectedElement(null)
      }
    },
    [selectedElement, saveToHistory],
  )

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    const previous = undoStack[undoStack.length - 1]
    setRedoStack((prev) => [...prev, [...elements]])
    setUndoStack((prev) => prev.slice(0, -1))
    setElements(previous)
  }, [undoStack, elements])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack((prev) => [...prev, [...elements]])
    setRedoStack((prev) => prev.slice(0, -1))
    setElements(next)
  }, [redoStack, elements])

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const rawX = e.clientX - rect.left
      const rawY = e.clientY - rect.top
      const x = snapToGrid(rawX, gridSize)
      const y = snapToGrid(rawY, gridSize)

      if (activeTool === 'select') {
        const clicked = [...elements].reverse().find((el) => {
          return (
            x >= el.x &&
            x <= el.x + el.width &&
            y >= el.y &&
            y <= el.y + el.height
          )
        })
        setSelectedElement(clicked ?? null)
        return
      }

      if (activeTool === 'delete') {
        const clicked = [...elements].reverse().find((el) => {
          return (
            x >= el.x &&
            x <= el.x + el.width &&
            y >= el.y &&
            y <= el.y + el.height
          )
        })
        if (clicked) deleteElement(clicked.id)
        return
      }

      startPointRef.current = { x, y }
      setDrawingState('drawing')
    },
    [activeTool, elements, gridSize, deleteElement],
  )

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (drawingState !== 'drawing' || !startPointRef.current) return

      const rect = e.currentTarget.getBoundingClientRect()
      const rawX = e.clientX - rect.left
      const rawY = e.clientY - rect.top
      const endX = snapToGrid(rawX, gridSize)
      const endY = snapToGrid(rawY, gridSize)
      const { x: startX, y: startY } = startPointRef.current

      const minX = Math.min(startX, endX)
      const minY = Math.min(startY, endY)
      const width = Math.abs(endX - startX)
      const height = Math.abs(endY - startY)

      if (width < gridSize || height < gridSize) {
        setDrawingState('idle')
        startPointRef.current = null
        return
      }

      if (activeTool === 'room') {
        addElement({
          type: 'room',
          x: minX,
          y: minY,
          width,
          height,
          rotation: 0,
          label: selectedRoomType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          color: getRoomColor(selectedRoomType),
          properties: { roomType: selectedRoomType, area: (width * height) / (scale * scale) },
        })
      } else if (activeTool === 'wall') {
        addElement({
          type: 'wall',
          x: minX,
          y: minY,
          width,
          height: 8,
          rotation: width > height ? 0 : 90,
          label: 'Wall',
          color: '#555',
          properties: { thickness: 8 },
        })
      } else if (activeTool === 'door') {
        addElement({
          type: 'door',
          x: minX,
          y: minY,
          width: gridSize * 2,
          height: gridSize,
          rotation: 0,
          label: 'Door',
          color: '#8B4513',
          properties: {},
        })
      } else if (activeTool === 'window') {
        addElement({
          type: 'window',
          x: minX,
          y: minY,
          width: gridSize * 3,
          height: 8,
          rotation: 0,
          label: 'Window',
          color: '#87CEEB',
          properties: {},
        })
      } else if (activeTool === 'stair') {
        addElement({
          type: 'stair',
          x: minX,
          y: minY,
          width,
          height,
          rotation: 0,
          label: 'Stair',
          color: '#DEB887',
          properties: {},
        })
      }

      setDrawingState('idle')
      startPointRef.current = null
    },
    [drawingState, activeTool, gridSize, selectedRoomType, scale, addElement],
  )

  const totalArea = elements
    .filter((el) => el.type === 'room')
    .reduce((sum, el) => sum + (el.width * el.height) / (scale * scale), 0)

  return {
    elements,
    selectedElement,
    activeTool,
    drawingState,
    showGrid,
    undoStack,
    redoStack,
    selectedRoomType,
    totalArea,
    setActiveTool,
    setShowGrid,
    setSelectedRoomType,
    setSelectedElement,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    startPointRef,
  }
}
