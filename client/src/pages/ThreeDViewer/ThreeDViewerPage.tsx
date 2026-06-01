import { Suspense, useRef, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import {
  Box, Typography, Paper, Button, Stack, Chip,
  ToggleButtonGroup, ToggleButton, Slider, Divider,
  FormControl, InputLabel, Select, MenuItem, Alert,
} from '@mui/material'
import {
  ArrowBack, WbSunny, NightlightRound, ViewInAr,
  HomeWork, KingBed, Kitchen, Bathtub, Weekend,
  TableRestaurant, Refresh,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = 'exterior' | 'interior' | 'topdown'
type FloorMat = 'tiles' | 'hardwood' | 'carpet' | 'marble'

interface RoomData {
  id: string
  name: string
  type: string
  floor: number
  pos: [number, number, number]
  size: [number, number, number]
  baseColor: string
  wallColor: string
  floorMat: FloorMat
  furniture: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WALL_COLORS: Record<string, string> = {
  concrete: '#9ca3af', brick: '#b45309', glass: '#93c5fd', wood: '#92400e', stone: '#6b7280',
}
const FLOOR_MAT_COLORS: Record<FloorMat, string> = {
  tiles: '#e5e7eb', hardwood: '#b45309', carpet: '#7c3aed', marble: '#f9fafb',
}
const ROOM_COLORS: Record<string, string> = {
  living: '#dbeafe', kitchen: '#dcfce7', bedroom: '#fef3c7',
  bathroom: '#e0e7ff', dining: '#fce7f3', garage: '#f3f4f6',
}

// ─── Default room layouts ─────────────────────────────────────────────────────
function buildRooms(floors: number): RoomData[] {
  const fh = 2.8
  const rooms: RoomData[] = []

  // Ground floor always
  rooms.push(
    { id: 'living', name: 'Living Room', type: 'living', floor: 0, pos: [-1.1, fh / 2, 0.7], size: [3.2, fh - 0.1, 2.5], baseColor: ROOM_COLORS.living, wallColor: '#f0f9ff', floorMat: 'tiles', furniture: ['sofa', 'table'] },
    { id: 'kitchen', name: 'Kitchen', type: 'kitchen', floor: 0, pos: [1.5, fh / 2, 0.7], size: [2.0, fh - 0.1, 2.5], baseColor: ROOM_COLORS.kitchen, wallColor: '#f0fdf4', floorMat: 'tiles', furniture: ['counter'] },
    { id: 'dining', name: 'Dining Room', type: 'dining', floor: 0, pos: [-1.1, fh / 2, -1.2], size: [3.2, fh - 0.1, 1.8], baseColor: ROOM_COLORS.dining, wallColor: '#fff0f9', floorMat: 'hardwood', furniture: ['diningTable'] },
    { id: 'bath0', name: 'Bathroom', type: 'bathroom', floor: 0, pos: [1.5, fh / 2, -1.2], size: [2.0, fh - 0.1, 1.8], baseColor: ROOM_COLORS.bathroom, wallColor: '#f0f0ff', floorMat: 'marble', furniture: [] },
  )

  // Upper floors
  for (let f = 1; f < floors; f++) {
    const y = f * fh + fh / 2
    rooms.push(
      { id: `master${f}`, name: 'Master Bedroom', type: 'bedroom', floor: f, pos: [-1.2, y, 0.5], size: [3.5, fh - 0.1, 3.0], baseColor: ROOM_COLORS.bedroom, wallColor: '#fffbeb', floorMat: 'carpet', furniture: ['bed', 'wardrobe'] },
      { id: `bed2${f}`, name: 'Bedroom 2', type: 'bedroom', floor: f, pos: [1.4, y, 0.5], size: [2.0, fh - 0.1, 2.5], baseColor: ROOM_COLORS.bedroom, wallColor: '#fffbeb', floorMat: 'carpet', furniture: ['bed'] },
      { id: `bath${f}`, name: 'Bathroom', type: 'bathroom', floor: f, pos: [1.4, y, -1.2], size: [2.0, fh - 0.1, 1.5], baseColor: ROOM_COLORS.bathroom, wallColor: '#f0f0ff', floorMat: 'marble', furniture: [] },
    )
  }
  return rooms
}

// ─── Room mesh ────────────────────────────────────────────────────────────────
function RoomMesh({ room, selected, viewMode, onSelect }: {
  room: RoomData; selected: boolean; viewMode: ViewMode; onSelect: (id: string) => void
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const floorColor = FLOOR_MAT_COLORS[room.floorMat]

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: selected ? '#6C63FF' : room.baseColor,
    transparent: true,
    opacity: selected ? 0.85 : 0.65,
    side: THREE.DoubleSide,
  }), [selected, room.baseColor])

  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.9 }), [floorColor])

  useFrame(() => {
    if (ref.current && selected) {
      ref.current.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.015
    }
  })

  if (viewMode === 'exterior') return null

  return (
    <group>
      {/* Room volume */}
      <mesh
        ref={ref}
        position={room.pos}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(room.id) }}
        castShadow
      >
        <boxGeometry args={room.size} />
        <primitive object={mat} />
      </mesh>

      {/* Floor plane */}
      <mesh position={[room.pos[0], room.pos[1] - room.size[1] / 2 + 0.01, room.pos[2]]} receiveShadow>
        <boxGeometry args={[room.size[0], 0.04, room.size[2]]} />
        <primitive object={floorMat} />
      </mesh>

      {/* Room label */}
      {selected && (
        <mesh position={[room.pos[0], room.pos[1] + room.size[1] / 2 + 0.15, room.pos[2]]}>
          <boxGeometry args={[room.size[0] * 0.9, 0.02, room.size[2] * 0.5]} />
          <meshStandardMaterial color="#6C63FF" emissive="#6C63FF" emissiveIntensity={0.4} />
        </mesh>
      )}

      {/* Furniture hint */}
      {room.furniture.includes('bed') && (
        <mesh position={[room.pos[0] - 0.5, room.pos[1] - room.size[1] / 2 + 0.3, room.pos[2] - 0.5]}>
          <boxGeometry args={[1.4, 0.4, 0.9]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.8} />
        </mesh>
      )}
      {room.furniture.includes('sofa') && (
        <mesh position={[room.pos[0] - 0.5, room.pos[1] - room.size[1] / 2 + 0.25, room.pos[2] + 0.5]}>
          <boxGeometry args={[2.0, 0.4, 0.7]} />
          <meshStandardMaterial color="#6b7280" roughness={0.8} />
        </mesh>
      )}
      {room.furniture.includes('diningTable') && (
        <mesh position={[room.pos[0], room.pos[1] - room.size[1] / 2 + 0.35, room.pos[2]]}>
          <boxGeometry args={[1.4, 0.07, 0.8]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}

// ─── Exterior walls ───────────────────────────────────────────────────────────
function ExteriorWalls({ wallColor, transparent, floors }: { wallColor: string; transparent: boolean; floors: number }) {
  const fh = 2.8
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: wallColor, roughness: 0.6, metalness: 0.05,
    transparent, opacity: transparent ? 0.18 : 1, side: THREE.DoubleSide,
  }), [wallColor, transparent])

  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#93c5fd', transparent: true, opacity: 0.55, roughness: 0, metalness: 0.2,
  }), [])

  return (
    <group>
      {Array.from({ length: floors }).map((_, i) => (
        <group key={i} position={[0, i * fh, 0]}>
          {/* North */}
          <mesh position={[0, fh / 2, -2.5]} castShadow receiveShadow>
            <boxGeometry args={[6, fh, 0.2]} />
            <primitive object={mat} />
          </mesh>
          {/* South */}
          <mesh position={[0, fh / 2, 2.5]} castShadow receiveShadow>
            <boxGeometry args={[6, fh, 0.2]} />
            <primitive object={mat} />
          </mesh>
          {/* West */}
          <mesh position={[-3, fh / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, fh, 5]} />
            <primitive object={mat} />
          </mesh>
          {/* East */}
          <mesh position={[3, fh / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, fh, 5]} />
            <primitive object={mat} />
          </mesh>
          {/* Windows */}
          {!transparent && <>
            <mesh position={[-1.5, fh / 2 + 0.3, 2.51]}>
              <boxGeometry args={[1, 0.8, 0.05]} />
              <primitive object={windowMat} />
            </mesh>
            <mesh position={[1.5, fh / 2 + 0.3, 2.51]}>
              <boxGeometry args={[1, 0.8, 0.05]} />
              <primitive object={windowMat} />
            </mesh>
            <mesh position={[3.01, fh / 2 + 0.3, 0]}>
              <boxGeometry args={[0.05, 0.8, 1]} />
              <primitive object={windowMat} />
            </mesh>
          </>}
        </group>
      ))}

      {/* Door */}
      <mesh position={[0, 0.9, 2.52]}>
        <boxGeometry args={[0.8, 1.8, 0.05]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>

      {/* Foundation */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.2, 5.4]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Roof ─────────────────────────────────────────────────────────────────────
function Roof({ type, floors, visible }: { type: string; floors: number; visible: boolean }) {
  const totalH = floors * 2.8
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 }), [])
  if (!visible) return null
  return (
    <group>
      {type === 'flat' && <mesh position={[0, totalH + 0.1, 0]} castShadow><boxGeometry args={[6.4, 0.2, 5.4]} /><primitive object={mat} /></mesh>}
      {type === 'gable' && <mesh position={[0, totalH + 0.75, 0]} rotation={[0, Math.PI / 4, 0]}><cylinderGeometry args={[0, 3.8, 1.5, 4]} /><primitive object={mat} /></mesh>}
      {type === 'hip' && <mesh position={[0, totalH + 0.6, 0]}><coneGeometry args={[4, 1.5, 4]} /><primitive object={mat} /></mesh>}
      {type === 'mansard' && <>
        <mesh position={[0, totalH + 0.35, 0]} castShadow><boxGeometry args={[5.8, 1.0, 4.8]} /><primitive object={mat} /></mesh>
        <mesh position={[0, totalH + 1.1, 0]} castShadow><coneGeometry args={[3.2, 0.9, 4]} /><primitive object={mat} /></mesh>
      </>}
    </group>
  )
}

// ─── Ground ───────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#d1fae5" roughness={1} />
    </mesh>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function HouseScene({ wallMat, roofType, floors, dayMode, showGrid, viewMode, rooms, selectedRoomId, onRoomSelect, autoRotate }: {
  wallMat: string; roofType: string; floors: number; dayMode: boolean; showGrid: boolean
  viewMode: ViewMode; rooms: RoomData[]; selectedRoomId: string | null
  onRoomSelect: (id: string) => void; autoRotate: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current && viewMode === 'exterior') {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  const wallColor = WALL_COLORS[wallMat] || '#9ca3af'
  const transparent = viewMode === 'interior' || viewMode === 'topdown'

  return (
    <group ref={groupRef}>
      <ambientLight intensity={dayMode ? 0.7 : 0.2} />
      <directionalLight
        position={dayMode ? [10, 15, 8] : [-4, 10, -4]}
        intensity={dayMode ? 1.0 : 0.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color={dayMode ? '#fff8f0' : '#4466bb'}
      />
      {!dayMode && <pointLight position={[0, 5, 0]} intensity={0.6} color="#ff9944" />}
      {dayMode && <hemisphereLight args={['#87ceeb', '#a7f3d0', 0.4]} />}

      <ExteriorWalls wallColor={wallColor} transparent={transparent} floors={floors} />
      <Roof type={roofType} floors={floors} visible={viewMode === 'exterior'} />
      <Ground />

      {rooms
        .filter((r) => r.floor < floors)
        .map((room) => (
          <RoomMesh
            key={room.id}
            room={room}
            selected={room.id === selectedRoomId}
            viewMode={viewMode}
            onSelect={onRoomSelect}
          />
        ))}

      {showGrid && (
        <Grid
          args={[30, 30]}
          position={[0, 0.01, 0]}
          cellSize={1}
          cellThickness={0.3}
          cellColor="#6C63FF"
          sectionColor="#4433bb"
          sectionSize={5}
          fadeDistance={20}
        />
      )}
    </group>
  )
}

// ─── Camera presets ───────────────────────────────────────────────────────────
function CameraRig({ viewMode }: { viewMode: ViewMode }) {
  const { camera } = useThree()
  const target = useMemo(() => {
    if (viewMode === 'topdown') return { pos: [0, 18, 0.01] as [number, number, number], look: [0, 0, 0] }
    if (viewMode === 'interior') return { pos: [0, 5, 8] as [number, number, number], look: [0, 2, 0] }
    return { pos: [10, 8, 12] as [number, number, number], look: [0, 3, 0] }
  }, [viewMode])

  useFrame(() => {
    const [tx, ty, tz] = target.pos
    camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.04)
  })
  return null
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ThreeDViewerPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [wallMat, setWallMat] = useState('concrete')
  const [roofType, setRoofType] = useState('flat')
  const [floors, setFloors] = useState(1)
  const [dayMode, setDayMode] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('exterior')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [contextLost, setContextLost] = useState(false)

  const rooms = useMemo(() => buildRooms(floors), [floors])
  const [roomOverrides, setRoomOverrides] = useState<Record<string, Partial<RoomData>>>({})

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null
    const base = rooms.find((r) => r.id === selectedRoomId)
    if (!base) return null
    return { ...base, ...(roomOverrides[selectedRoomId] || {}) }
  }, [selectedRoomId, rooms, roomOverrides])

  const resolvedRooms = useMemo(() =>
    rooms.map((r) => ({ ...r, ...(roomOverrides[r.id] || {}) })),
    [rooms, roomOverrides]
  )

  const updateRoom = useCallback((id: string, patch: Partial<RoomData>) => {
    setRoomOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedRoomId((prev) => prev === id ? null : id)
  }, [])

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
    enabled: !!projectId,
  })

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Top bar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <Button size="small" startIcon={<ArrowBack />} onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}>
          Back
        </Button>
        <Typography variant="h6" fontWeight={700}>
          <ViewInAr sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 20 }} />
          3D Viewer
        </Typography>
        {project && <Chip label={project.projectName} color="primary" size="small" />}
        <Box flex={1} />

        {/* View mode */}
        <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => { if (v) { setViewMode(v); setSelectedRoomId(null) } }}>
          <ToggleButton value="exterior" title="Exterior view"><HomeWork sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="interior" title="Interior edit mode"><KingBed sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="topdown" title="Top-down view"><ViewInAr sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>

        {/* Day/Night */}
        <ToggleButtonGroup size="small" value={dayMode ? 'day' : 'night'} exclusive onChange={(_, v) => v && setDayMode(v === 'day')}>
          <ToggleButton value="day"><WbSunny sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="night"><NightlightRound sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'interior' && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          Click on any room to select and edit it. Walls are transparent so you can see inside.
        </Alert>
      )}

      <Box display="flex" gap={2} flex={1} overflow="hidden">
        {/* Canvas */}
        <Box flex={1} sx={{
          borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
          bgcolor: dayMode ? '#dbeafe' : '#0a0c1a', position: 'relative',
        }}>
          {contextLost && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.7)', zIndex: 10, gap: 2 }}>
              <Typography color="white" variant="h6">WebGL context lost</Typography>
              <Button variant="contained" startIcon={<Refresh />} onClick={() => { setContextLost(false); window.location.reload() }}>
                Reload to recover
              </Button>
            </Box>
          )}
          <Canvas
            shadows
            camera={{ position: [10, 8, 12], fov: 50, near: 0.1, far: 200 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ powerPreference: 'default', antialias: false, alpha: false }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault()
                setContextLost(true)
              })
              gl.domElement.addEventListener('webglcontextrestored', () => setContextLost(false))
            }}
          >
            <Suspense fallback={null}>
              <HouseScene
                wallMat={wallMat}
                roofType={roofType}
                floors={floors}
                dayMode={dayMode}
                showGrid={showGrid}
                viewMode={viewMode}
                rooms={resolvedRooms}
                selectedRoomId={selectedRoomId}
                onRoomSelect={handleSelect}
                autoRotate={autoRotate}
              />
              <CameraRig viewMode={viewMode} />
            </Suspense>
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.08}
              minDistance={3}
              maxDistance={40}
              autoRotate={false}
            />
          </Canvas>
        </Box>

        {/* Right panel */}
        <Paper sx={{ width: 240, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* House settings */}
          <Typography variant="subtitle2" fontWeight={700}>House</Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Wall Material</InputLabel>
            <Select value={wallMat} label="Wall Material" onChange={(e) => setWallMat(e.target.value)}>
              {Object.keys(WALL_COLORS).map((m) => (
                <MenuItem key={m} value={m}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: WALL_COLORS[m], border: '1px solid #ccc' }} />
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Roof</InputLabel>
            <Select value={roofType} label="Roof" onChange={(e) => setRoofType(e.target.value)}>
              {['flat', 'gable', 'hip', 'mansard'].map((r) => (
                <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="caption" color="text.secondary">Floors: {floors}</Typography>
            <Slider value={floors} onChange={(_, v) => { setFloors(v as number); setSelectedRoomId(null) }} min={1} max={4} step={1} marks size="small" />
          </Box>

          <Stack direction="row" spacing={0.5}>
            <Button fullWidth size="small" variant={showGrid ? 'contained' : 'outlined'} onClick={() => setShowGrid((g) => !g)}>Grid</Button>
            <Button fullWidth size="small" variant={autoRotate ? 'contained' : 'outlined'} onClick={() => setAutoRotate((a) => !a)} disabled={viewMode !== 'exterior'}>Spin</Button>
          </Stack>

          <Divider />

          {/* Room editor */}
          {viewMode === 'interior' && (
            <>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedRoom ? selectedRoom.name : 'Click a room'}
              </Typography>

              {selectedRoom ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">WALL COLOR</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {['#f0f9ff', '#fff0f9', '#fffbeb', '#f0fdf4', '#f0f0ff', '#fff5f5', '#f8f8f8', '#fef3c7'].map((c) => (
                      <Box key={c} onClick={() => updateRoom(selectedRoom.id, { wallColor: c })}
                        sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: c, cursor: 'pointer', border: selectedRoom.wallColor === c ? '2px solid #6C63FF' : '1px solid #ccc', '&:hover': { transform: 'scale(1.2)' } }} />
                    ))}
                  </Stack>

                  <Typography variant="caption" color="text.secondary">FLOOR MATERIAL</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {(Object.keys(FLOOR_MAT_COLORS) as FloorMat[]).map((m) => (
                      <Chip key={m} label={m} size="small" clickable
                        color={selectedRoom.floorMat === m ? 'primary' : 'default'}
                        variant={selectedRoom.floorMat === m ? 'filled' : 'outlined'}
                        onClick={() => updateRoom(selectedRoom.id, { floorMat: m })}
                        sx={{ fontSize: '0.6rem', height: 22 }} />
                    ))}
                  </Stack>

                  <Typography variant="caption" color="text.secondary">FURNITURE</Typography>
                  <Stack spacing={0.5}>
                    {[
                      { key: 'bed', label: 'Bed', icon: <KingBed sx={{ fontSize: 14 }} /> },
                      { key: 'sofa', label: 'Sofa', icon: <Weekend sx={{ fontSize: 14 }} /> },
                      { key: 'diningTable', label: 'Dining Table', icon: <TableRestaurant sx={{ fontSize: 14 }} /> },
                      { key: 'counter', label: 'Kitchen Counter', icon: <Kitchen sx={{ fontSize: 14 }} /> },
                      { key: 'wardrobe', label: 'Wardrobe', icon: <HomeWork sx={{ fontSize: 14 }} /> },
                    ].map(({ key, label, icon }) => {
                      const hasFurniture = selectedRoom.furniture.includes(key)
                      return (
                        <Button key={key} size="small" variant={hasFurniture ? 'contained' : 'outlined'}
                          startIcon={icon}
                          onClick={() => {
                            const next = hasFurniture
                              ? selectedRoom.furniture.filter((f) => f !== key)
                              : [...selectedRoom.furniture, key]
                            updateRoom(selectedRoom.id, { furniture: next })
                          }}
                          sx={{ justifyContent: 'flex-start', fontSize: '0.7rem', py: 0.3 }}>
                          {label}
                        </Button>
                      )
                    })}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Select a room in the 3D view to edit its properties
                  </Typography>
                </Box>
              )}
            </>
          )}

          {viewMode === 'exterior' && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>CONTROLS</Typography>
              <Typography variant="caption" display="block">🖱 Drag — orbit</Typography>
              <Typography variant="caption" display="block">🖱 Scroll — zoom</Typography>
              <Typography variant="caption" display="block">🖱 Right drag — pan</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
