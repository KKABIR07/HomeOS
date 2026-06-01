import { Suspense, useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, Html, Sky, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import {
  Box, Typography, Paper, Button, Stack, Chip, Divider, Slider,
  ToggleButtonGroup, ToggleButton, Tooltip, IconButton, Select,
  MenuItem, FormControl, InputLabel, Alert, Collapse,
} from '@mui/material'
import {
  ArrowBack, WbSunny, NightlightRound, ViewInAr, HomeWork,
  KingBed, Kitchen as KitchenIcon, Bathtub, Weekend, TableRestaurant,
  Refresh, MeetingRoom, Visibility, SquareFoot, Layers, Tune,
  ChevronRight, ChevronLeft,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = 'exterior' | 'interior' | 'topdown'
type FloorMat = 'tiles' | 'hardwood' | 'carpet' | 'marble' | 'concrete'
type WallMatType = 'concrete' | 'brick' | 'glass' | 'wood' | 'stone' | 'white-plaster'

interface RoomData {
  id: string; name: string; type: string; floor: number
  pos: [number, number, number]; size: [number, number, number]
  baseColor: string; wallColor: string; floorMat: FloorMat; furniture: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WALL_COLORS: Record<WallMatType, string> = {
  concrete: '#a0aab4', brick: '#c2714f', glass: '#a8d8f0',
  wood: '#a0714f', stone: '#7a7a6e', 'white-plaster': '#f5f0e8',
}
const WALL_ROUGHNESS: Record<WallMatType, number> = {
  concrete: 0.85, brick: 0.9, glass: 0.05, wood: 0.6, stone: 0.95, 'white-plaster': 0.7,
}
const FLOOR_COLORS: Record<FloorMat, string> = {
  tiles: '#dde1e7', hardwood: '#b07d56', carpet: '#8b6f9e',
  marble: '#f0ece4', concrete: '#9ea8b3',
}
const ROOM_BASE_COLORS: Record<string, string> = {
  living: '#cce5ff', kitchen: '#ccf0d8', bedroom: '#fef0cc',
  bathroom: '#d4d0f0', dining: '#fcd8ec', garage: '#e8eaed',
}

function buildRooms(floors: number): RoomData[] {
  const fh = 2.8; const rooms: RoomData[] = []
  rooms.push(
    { id: 'living', name: 'Living Room', type: 'living', floor: 0, pos: [-1.1, fh / 2, 0.7], size: [3.2, fh - 0.05, 2.4], baseColor: ROOM_BASE_COLORS.living, wallColor: '#e8f4fd', floorMat: 'tiles', furniture: ['sofa', 'coffee_table', 'tv'] },
    { id: 'kitchen', name: 'Kitchen', type: 'kitchen', floor: 0, pos: [1.5, fh / 2, 0.7], size: [2.0, fh - 0.05, 2.4], baseColor: ROOM_BASE_COLORS.kitchen, wallColor: '#edfaf1', floorMat: 'tiles', furniture: ['counter', 'island'] },
    { id: 'dining', name: 'Dining Room', type: 'dining', floor: 0, pos: [-1.1, fh / 2, -1.1], size: [3.2, fh - 0.05, 1.7], baseColor: ROOM_BASE_COLORS.dining, wallColor: '#fef0f8', floorMat: 'hardwood', furniture: ['diningTable'] },
    { id: 'bath0', name: 'Bathroom', type: 'bathroom', floor: 0, pos: [1.5, fh / 2, -1.1], size: [2.0, fh - 0.05, 1.7], baseColor: ROOM_BASE_COLORS.bathroom, wallColor: '#f0f0fe', floorMat: 'marble', furniture: [] },
  )
  for (let f = 1; f < floors; f++) {
    const y = f * fh + fh / 2
    rooms.push(
      { id: `master${f}`, name: 'Master Bedroom', type: 'bedroom', floor: f, pos: [-1.2, y, 0.5], size: [3.5, fh - 0.05, 2.9], baseColor: ROOM_BASE_COLORS.bedroom, wallColor: '#fffbee', floorMat: 'hardwood', furniture: ['bed', 'wardrobe', 'desk'] },
      { id: `bed2${f}`, name: 'Bedroom 2', type: 'bedroom', floor: f, pos: [1.4, y, 0.5], size: [2.0, fh - 0.05, 2.4], baseColor: ROOM_BASE_COLORS.bedroom, wallColor: '#fffbee', floorMat: 'carpet', furniture: ['bed'] },
      { id: `bath${f}`, name: 'Bathroom', type: 'bathroom', floor: f, pos: [1.4, y, -1.1], size: [2.0, fh - 0.05, 1.5], baseColor: ROOM_BASE_COLORS.bathroom, wallColor: '#f0f0fe', floorMat: 'marble', furniture: [] },
    )
  }
  return rooms
}

// ─── Furniture pieces ─────────────────────────────────────────────────────────
function Furniture({ type, roomPos, roomSize }: { type: string; roomPos: [number,number,number]; roomSize: [number,number,number] }) {
  const floor = roomPos[1] - roomSize[1] / 2
  const cx = roomPos[0]; const cz = roomPos[2]

  const pieces: { pos: [number,number,number]; size: [number,number,number]; color: string; rotation?: number }[] = []

  if (type === 'bed') {
    pieces.push(
      { pos: [cx - 0.3, floor + 0.25, cz - 0.6], size: [1.4, 0.5, 0.7], color: '#c4b5fd' }, // mattress
      { pos: [cx - 0.3, floor + 0.5, cz - 0.9], size: [1.4, 0.4, 0.1], color: '#7c3aed' },  // headboard
      { pos: [cx - 0.85, floor + 0.35, cz - 0.6], size: [0.1, 0.2, 0.7], color: '#5b21b6' }, // leg
      { pos: [cx + 0.25, floor + 0.35, cz - 0.6], size: [0.1, 0.2, 0.7], color: '#5b21b6' }, // leg
    )
  }
  if (type === 'sofa') {
    pieces.push(
      { pos: [cx, floor + 0.2, cz + 0.5], size: [2.2, 0.4, 0.7], color: '#6b7280' },
      { pos: [cx, floor + 0.45, cz + 0.82], size: [2.2, 0.5, 0.1], color: '#4b5563' },
      { pos: [cx - 1.0, floor + 0.45, cz + 0.5], size: [0.15, 0.5, 0.7], color: '#4b5563' },
      { pos: [cx + 1.0, floor + 0.45, cz + 0.5], size: [0.15, 0.5, 0.7], color: '#4b5563' },
    )
  }
  if (type === 'coffee_table') {
    pieces.push({ pos: [cx, floor + 0.18, cz - 0.1], size: [0.8, 0.04, 0.5], color: '#92400e' })
  }
  if (type === 'tv') {
    pieces.push(
      { pos: [cx - 0.6, floor + 0.7, cz - 1.1], size: [1.2, 0.7, 0.06], color: '#111827' },
      { pos: [cx - 0.6, floor + 0.35, cz - 1.1], size: [0.08, 0.3, 0.08], color: '#374151' },
    )
  }
  if (type === 'counter') {
    pieces.push(
      { pos: [cx + 0.5, floor + 0.45, cz - 0.8], size: [0.8, 0.9, 0.5], color: '#d1d5db' },
      { pos: [cx - 0.5, floor + 0.45, cz + 0.8], size: [1.6, 0.9, 0.5], color: '#d1d5db' },
    )
  }
  if (type === 'island') {
    pieces.push({ pos: [cx, floor + 0.45, cz - 0.1], size: [0.9, 0.9, 0.5], color: '#e5e7eb' })
  }
  if (type === 'diningTable') {
    pieces.push(
      { pos: [cx, floor + 0.36, cz], size: [1.4, 0.06, 0.8], color: '#92400e' },
      ...[[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].map(([dx, dz]) => ({
        pos: [cx + dx, floor + 0.18, cz + dz] as [number,number,number],
        size: [0.35, 0.8, 0.35] as [number,number,number], color: '#a16207',
      })),
    )
  }
  if (type === 'wardrobe') {
    pieces.push({ pos: [cx + 1.0, floor + 1.1, cz - 0.8], size: [0.9, 2.2, 0.5], color: '#d1d5db' })
  }
  if (type === 'desk') {
    pieces.push(
      { pos: [cx - 1.0, floor + 0.37, cz + 0.8], size: [1.0, 0.04, 0.55], color: '#d97706' },
      { pos: [cx - 1.4, floor + 0.18, cz + 0.8], size: [0.06, 0.7, 0.06], color: '#92400e' },
      { pos: [cx - 0.6, floor + 0.18, cz + 0.8], size: [0.06, 0.7, 0.06], color: '#92400e' },
    )
  }

  return (
    <group>
      {pieces.map((p, i) => (
        <mesh key={i} position={p.pos} castShadow>
          <boxGeometry args={p.size} />
          <meshStandardMaterial color={p.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Room mesh ────────────────────────────────────────────────────────────────
function RoomMesh({ room, selected, hovered, viewMode, onSelect, onHover }: {
  room: RoomData; selected: boolean; hovered: boolean; viewMode: ViewMode
  onSelect: (id: string) => void; onHover: (id: string | null) => void
}) {
  const floorColor = FLOOR_COLORS[room.floorMat]
  const wallMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: selected ? '#6C63FF' : hovered ? '#8b83ff' : room.baseColor,
    roughness: 0.25, metalness: 0,
    transparent: true, opacity: selected ? 0.82 : hovered ? 0.78 : 0.62,
    side: THREE.DoubleSide,
  }), [selected, hovered, room.baseColor])

  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: floorColor, roughness: 0.85,
  }), [floorColor])

  if (viewMode === 'exterior') return null

  return (
    <group>
      <mesh position={room.pos} castShadow receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(room.id) }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(room.id) }}
        onPointerOut={() => onHover(null)}>
        <boxGeometry args={room.size} />
        <primitive object={wallMat} />
      </mesh>

      {/* Floor */}
      <mesh position={[room.pos[0], room.pos[1] - room.size[1] / 2 + 0.02, room.pos[2]]} receiveShadow>
        <boxGeometry args={[room.size[0] - 0.04, 0.04, room.size[2] - 0.04]} />
        <primitive object={floorMat} />
      </mesh>

      {/* HTML label */}
      <Html position={[room.pos[0], room.pos[1] + room.size[1] / 2 + 0.3, room.pos[2]]} center distanceFactor={10}>
        <div style={{
          background: selected ? 'rgba(108,99,255,0.92)' : hovered ? 'rgba(60,60,60,0.88)' : 'rgba(20,20,20,0.72)',
          color: 'white', padding: '4px 10px', borderRadius: '6px',
          fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          border: selected ? '1px solid rgba(108,99,255,0.8)' : '1px solid rgba(255,255,255,0.15)',
          transition: 'background 0.2s',
        }}>
          {room.name}
          {selected && (
            <span style={{ marginLeft: 6, opacity: 0.8, fontSize: 9 }}>
              {room.size[0].toFixed(1)}×{room.size[2].toFixed(1)}m
            </span>
          )}
        </div>
      </Html>

      {/* Furniture */}
      {selected && room.furniture.map((f) => (
        <Furniture key={f} type={f} roomPos={room.pos} roomSize={room.size} />
      ))}

      {/* Selection glow floor marker */}
      {selected && (
        <mesh position={[room.pos[0], room.pos[1] - room.size[1] / 2 + 0.01, room.pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[room.size[0], room.size[2]]} />
          <meshStandardMaterial color="#6C63FF" emissive="#6C63FF" emissiveIntensity={0.15} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
}

// ─── Exterior walls ───────────────────────────────────────────────────────────
function ExteriorWalls({ wallMat, transparent, floors }: { wallMat: WallMatType; transparent: boolean; floors: number }) {
  const fh = 2.8
  const color = WALL_COLORS[wallMat]
  const roughness = WALL_ROUGHNESS[wallMat]

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color, roughness, metalness: wallMat === 'glass' ? 0.1 : 0,
    transparent: transparent || wallMat === 'glass',
    opacity: transparent ? 0.15 : wallMat === 'glass' ? 0.5 : 1,
    side: THREE.DoubleSide,
  }), [color, roughness, transparent, wallMat])

  const winMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#b8d8f0', roughness: 0, metalness: 0.1, transmission: 0.85,
    transparent: true, opacity: 0.6,
  }), [])

  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7c4a1e', roughness: 0.5 }), [])

  return (
    <group>
      {Array.from({ length: floors }).map((_, i) => (
        <group key={i} position={[0, i * fh, 0]}>
          {[
            { pos: [0, fh / 2, -2.5] as [number,number,number], size: [6, fh, 0.18] as [number,number,number] },
            { pos: [0, fh / 2, 2.5] as [number,number,number], size: [6, fh, 0.18] as [number,number,number] },
            { pos: [-3, fh / 2, 0] as [number,number,number], size: [0.18, fh, 5] as [number,number,number] },
            { pos: [3, fh / 2, 0] as [number,number,number], size: [0.18, fh, 5] as [number,number,number] },
          ].map((w, j) => (
            <mesh key={j} position={w.pos} castShadow receiveShadow>
              <boxGeometry args={w.size} />
              <primitive object={mat} />
            </mesh>
          ))}
          {/* Windows */}
          {[-1.5, 1.5].map((x) => (
            <mesh key={x} position={[x, fh * 0.65, 2.51]}>
              <boxGeometry args={[1.0, 0.9, 0.05]} />
              <primitive object={winMat} />
            </mesh>
          ))}
          <mesh position={[3.01, fh * 0.65, 0]}>
            <boxGeometry args={[0.05, 0.9, 1.1]} />
            <primitive object={winMat} />
          </mesh>
          {/* Window frames */}
          {[-1.5, 1.5].map((x) => (
            <mesh key={`f${x}`} position={[x, fh * 0.65, 2.52]}>
              <boxGeometry args={[1.05, 0.95, 0.03]} />
              <meshStandardMaterial color="#d1d5db" roughness={0.6} wireframe />
            </mesh>
          ))}
        </group>
      ))}
      {/* Door */}
      <mesh position={[0, 1.0, 2.51]} castShadow>
        <boxGeometry args={[0.85, 2.0, 0.06]} />
        <primitive object={doorMat} />
      </mesh>
      <mesh position={[0.36, 1.0, 2.54]}>
        <sphereGeometry args={[0.04]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Foundation */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[6.5, 0.24, 5.5]} />
        <meshStandardMaterial color="#787878" roughness={0.95} />
      </mesh>
    </group>
  )
}

// ─── Roof ─────────────────────────────────────────────────────────────────────
function Roof({ type, floors, visible }: { type: string; floors: number; visible: boolean }) {
  const totalH = floors * 2.8
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e2530', roughness: 0.85 }), [])
  if (!visible) return null
  return (
    <group>
      {type === 'flat' && (
        <>
          <mesh position={[0, totalH + 0.12, 0]} castShadow>
            <boxGeometry args={[6.5, 0.24, 5.5]} />
            <primitive object={mat} />
          </mesh>
          <mesh position={[0, totalH + 0.25, 0]}>
            <boxGeometry args={[6.6, 0.06, 5.6]} />
            <meshStandardMaterial color="#374151" roughness={0.9} />
          </mesh>
        </>
      )}
      {type === 'gable' && (
        <mesh position={[0, totalH + 0.85, 0]} rotation={[0, Math.PI / 4, 0]}>
          <cylinderGeometry args={[0, 4.0, 1.7, 4]} />
          <primitive object={mat} />
        </mesh>
      )}
      {type === 'hip' && (
        <mesh position={[0, totalH + 0.7, 0]}>
          <coneGeometry args={[4.2, 1.6, 4]} />
          <primitive object={mat} />
        </mesh>
      )}
      {type === 'mansard' && (
        <>
          <mesh position={[0, totalH + 0.55, 0]}><boxGeometry args={[5.6, 1.1, 4.6]} /><primitive object={mat} /></mesh>
          <mesh position={[0, totalH + 1.25, 0]}><coneGeometry args={[3.0, 1.0, 4]} /><primitive object={mat} /></mesh>
        </>
      )}
    </group>
  )
}

// ─── Camera controller — fixes orbit target lerp ──────────────────────────────
function CameraController({ viewMode, selectedRoom, orbitRef }: {
  viewMode: ViewMode; selectedRoom: RoomData | null; orbitRef: React.RefObject<any>
}) {
  const { camera } = useThree()

  const camPos = useMemo(() => {
    if (viewMode === 'topdown') return new THREE.Vector3(0, 24, 0.01)
    if (viewMode === 'interior') return new THREE.Vector3(0, 5.5, 10)
    return new THREE.Vector3(10, 8, 12)
  }, [viewMode])

  const camTarget = useMemo(() => {
    if (selectedRoom && viewMode === 'interior') {
      return new THREE.Vector3(selectedRoom.pos[0], selectedRoom.pos[1], selectedRoom.pos[2])
    }
    if (viewMode === 'topdown') return new THREE.Vector3(0, 0, 0)
    if (viewMode === 'interior') return new THREE.Vector3(0, 2, 0)
    return new THREE.Vector3(0, 3, 0)
  }, [viewMode, selectedRoom])

  useFrame(() => {
    camera.position.lerp(camPos, 0.045)
    if (orbitRef.current) {
      orbitRef.current.target.lerp(camTarget, 0.045)
      orbitRef.current.update()
    }
  })

  return null
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function HouseScene({ wallMat, roofType, floors, dayMode, showGrid, showShadows, viewMode, rooms,
  selectedRoomId, hoveredRoomId, onRoomSelect, onRoomHover, autoRotate, orbitRef }: {
  wallMat: WallMatType; roofType: string; floors: number; dayMode: boolean
  showGrid: boolean; showShadows: boolean; viewMode: ViewMode
  rooms: RoomData[]; selectedRoomId: string | null; hoveredRoomId: string | null
  onRoomSelect: (id: string) => void; onRoomHover: (id: string | null) => void
  autoRotate: boolean; orbitRef: React.RefObject<any>
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null

  useFrame((_, dt) => {
    if (autoRotate && groupRef.current && viewMode === 'exterior') {
      groupRef.current.rotation.y += dt * 0.35
    }
  })

  const transparent = viewMode !== 'exterior'

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={dayMode ? 0.55 : 0.12} />
      <directionalLight
        position={dayMode ? [12, 18, 8] : [-5, 12, -6]}
        intensity={dayMode ? 1.1 : 0.25}
        castShadow={showShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15} shadow-camera-right={15}
        shadow-camera-top={15} shadow-camera-bottom={-15}
        color={dayMode ? '#fff5e0' : '#4455aa'}
      />
      {dayMode && <hemisphereLight args={['#87ceeb', '#c8e8c8', 0.45]} />}
      {!dayMode && <pointLight position={[0, 4, 0]} intensity={0.7} color="#ff8833" distance={12} />}
      {!dayMode && <pointLight position={[-2, 2, 1]} intensity={0.4} color="#4488ff" distance={8} />}
      {dayMode && <Sky sunPosition={[100, 30, 100]} turbidity={6} rayleigh={0.5} />}

      {/* House */}
      <ExteriorWalls wallMat={wallMat} transparent={transparent} floors={floors} />
      <Roof type={roofType} floors={floors} visible={viewMode === 'exterior'} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={dayMode ? '#d4edda' : '#1a2030'} roughness={0.98} />
      </mesh>

      {/* Walkway */}
      <mesh position={[0, 0, 4.5]} receiveShadow>
        <boxGeometry args={[1.2, 0.04, 4]} />
        <meshStandardMaterial color="#c8c0b8" roughness={0.95} />
      </mesh>

      {/* Rooms */}
      {rooms.filter((r) => r.floor < floors).map((room) => (
        <RoomMesh key={room.id} room={room}
          selected={room.id === selectedRoomId}
          hovered={room.id === hoveredRoomId}
          viewMode={viewMode}
          onSelect={onRoomSelect}
          onHover={onRoomHover}
        />
      ))}

      {showShadows && <ContactShadows position={[0, -0.001, 0]} opacity={0.4} scale={20} blur={1.5} far={10} />}

      {showGrid && (
        <Grid args={[30, 30]} position={[0, 0.02, 0]}
          cellSize={1} cellThickness={0.4} cellColor={dayMode ? '#aaaaaa' : '#444466'}
          sectionSize={5} sectionThickness={1} sectionColor={dayMode ? '#888888' : '#6666aa'}
          fadeDistance={25} />
      )}

      <CameraController viewMode={viewMode} selectedRoom={selectedRoom} orbitRef={orbitRef} />
    </group>
  )
}

// ─── Room icon map ────────────────────────────────────────────────────────────
function RoomIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    living: <Weekend sx={{ fontSize: 14 }} />,
    kitchen: <KitchenIcon sx={{ fontSize: 14 }} />,
    bathroom: <Bathtub sx={{ fontSize: 14 }} />,
    bedroom: <KingBed sx={{ fontSize: 14 }} />,
    dining: <TableRestaurant sx={{ fontSize: 14 }} />,
  }
  return <>{icons[type] ?? <HomeWork sx={{ fontSize: 14 }} />}</>
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ThreeDViewerPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const orbitRef = useRef<any>(null)

  const [wallMat, setWallMat] = useState<WallMatType>('white-plaster')
  const [roofType, setRoofType] = useState('flat')
  const [floors, setFloors] = useState(1)
  const [dayMode, setDayMode] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [showShadows, setShowShadows] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('exterior')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const [contextLost, setContextLost] = useState(false)
  const [showMeasurements, setShowMeasurements] = useState(false)

  const rooms = useMemo(() => buildRooms(floors), [floors])
  const [roomOverrides, setRoomOverrides] = useState<Record<string, Partial<RoomData>>>({})

  const resolvedRooms = useMemo(() =>
    rooms.map((r) => ({ ...r, ...(roomOverrides[r.id] || {}) })),
    [rooms, roomOverrides]
  )
  const selectedRoom = useMemo(() =>
    resolvedRooms.find((r) => r.id === selectedRoomId) ?? null,
    [resolvedRooms, selectedRoomId]
  )

  const updateRoom = useCallback((id: string, patch: Partial<RoomData>) => {
    setRoomOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedRoomId((prev) => prev === id ? null : id)
  }, [])

  useEffect(() => {
    document.body.style.cursor = hoveredRoomId && viewMode !== 'exterior' ? 'pointer' : 'default'
    return () => { document.body.style.cursor = 'default' }
  }, [hoveredRoomId, viewMode])

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
    enabled: !!projectId,
  })

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    setSelectedRoomId(null)
    if (mode !== 'interior') setHoveredRoomId(null)
  }

  const floorRooms = resolvedRooms.filter((r) => r.floor < floors)

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tooltip title="Back to project">
          <IconButton size="small" onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}>
            <ArrowBack fontSize="small" />
          </IconButton>
        </Tooltip>
        <ViewInAr sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 1 }}>3D Viewer</Typography>
        {project && <Chip label={project.projectName} size="small" color="primary" variant="outlined" />}

        <Box flex={1} />

        {/* View mode pills */}
        <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && handleViewMode(v)}
          sx={{ '& .MuiToggleButton-root': { px: 1.5, fontSize: '0.75rem', fontWeight: 600 } }}>
          <ToggleButton value="exterior"><HomeWork sx={{ fontSize: 15, mr: 0.5 }} />Exterior</ToggleButton>
          <ToggleButton value="interior"><MeetingRoom sx={{ fontSize: 15, mr: 0.5 }} />Interior</ToggleButton>
          <ToggleButton value="topdown"><Layers sx={{ fontSize: 15, mr: 0.5 }} />Top View</ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Day / Night */}
        <ToggleButtonGroup size="small" value={dayMode ? 'day' : 'night'} exclusive onChange={(_, v) => v && setDayMode(v === 'day')}>
          <ToggleButton value="day"><WbSunny sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="night"><NightlightRound sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={panelOpen ? 'Hide panel' : 'Show panel'}>
          <IconButton size="small" onClick={() => setPanelOpen((p) => !p)}>
            {panelOpen ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {viewMode === 'interior' && (
        <Alert severity="info" icon={<MeetingRoom />} sx={{ py: 0, px: 2, borderRadius: 0, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
          Click any room to select · Edit wall color, floor & furniture in the panel
        </Alert>
      )}

      <Box display="flex" flex={1} overflow="hidden">
        {/* ── Canvas ──────────────────────────────────────────────────────── */}
        <Box flex={1} sx={{
          position: 'relative', overflow: 'hidden',
          bgcolor: dayMode ? '#c8dff0' : '#080c14',
        }}>
          {contextLost && (
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.82)', gap: 2 }}>
              <Typography color="white" variant="h6" fontWeight={700}>WebGL context lost</Typography>
              <Typography color="grey.400" variant="body2">GPU resources were reclaimed by the browser</Typography>
              <Button variant="contained" startIcon={<Refresh />} onClick={() => window.location.reload()}>Reload to recover</Button>
            </Box>
          )}

          <Canvas
            shadows={showShadows}
            camera={{ position: [10, 8, 12], fov: 48, near: 0.1, far: 300 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ powerPreference: 'high-performance', antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setContextLost(true) })
              gl.domElement.addEventListener('webglcontextrestored', () => setContextLost(false))
              gl.shadowMap.enabled = true
              gl.shadowMap.type = THREE.PCFSoftShadowMap
            }}
          >
            <Suspense fallback={null}>
              <HouseScene
                wallMat={wallMat} roofType={roofType} floors={floors} dayMode={dayMode}
                showGrid={showGrid} showShadows={showShadows} viewMode={viewMode}
                rooms={resolvedRooms} selectedRoomId={selectedRoomId} hoveredRoomId={hoveredRoomId}
                onRoomSelect={handleSelect} onRoomHover={setHoveredRoomId}
                autoRotate={autoRotate} orbitRef={orbitRef}
              />
            </Suspense>
            <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.07}
              minDistance={2} maxDistance={50}
              enablePan={true} panSpeed={0.8} rotateSpeed={0.6} zoomSpeed={1.2} />
          </Canvas>

          {/* Quick stats overlay */}
          {viewMode === 'interior' && (
            <Box sx={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 1 }}>
              <Chip size="small" label={`${floorRooms.length} rooms`} icon={<HomeWork sx={{ fontSize: 12 }} />} sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '& .MuiChip-icon': { color: '#a0c4ff' } }} />
              <Chip size="small" label={`${floors} floor${floors > 1 ? 's' : ''}`} icon={<Layers sx={{ fontSize: 12 }} />} sx={{ fontSize: '0.7rem', height: 24, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '& .MuiChip-icon': { color: '#a0c4ff' } }} />
            </Box>
          )}

          {/* Controls hint */}
          <Box sx={{ position: 'absolute', bottom: 12, right: panelOpen ? 252 : 12, display: 'flex', gap: 0.5, opacity: 0.6 }}>
            {[['Drag', 'Orbit'], ['Scroll', 'Zoom'], ['Shift+Drag', 'Pan']].map(([k, v]) => (
              <Box key={k} sx={{ bgcolor: 'rgba(0,0,0,0.55)', color: 'white', px: 1, py: 0.3, borderRadius: 1, fontSize: '0.65rem', fontFamily: 'mono' }}>
                <strong>{k}</strong> {v}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Side panel ──────────────────────────────────────────────────── */}
        <Collapse in={panelOpen} orientation="horizontal">
          <Paper square sx={{ width: 240, overflow: 'auto', height: '100%', borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>

              {/* House controls */}
              <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 1 }}>HOUSE</Typography>

              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1.5 }}>
                <InputLabel>Wall Material</InputLabel>
                <Select value={wallMat} label="Wall Material" onChange={(e) => setWallMat(e.target.value as WallMatType)}>
                  {(Object.keys(WALL_COLORS) as WallMatType[]).map((m) => (
                    <MenuItem key={m} value={m}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: WALL_COLORS[m], border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                        {m.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Roof Style</InputLabel>
                <Select value={roofType} label="Roof Style" onChange={(e) => setRoofType(e.target.value)}>
                  {['flat', 'gable', 'hip', 'mansard'].map((r) => (
                    <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="text.secondary">Floors: {floors}</Typography>
              <Slider value={floors} onChange={(_, v) => { setFloors(v as number); setSelectedRoomId(null) }}
                min={1} max={4} step={1} marks size="small" sx={{ mb: 1.5 }} />

              <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                <Tooltip title="Toggle grid"><Button size="small" fullWidth variant={showGrid ? 'contained' : 'outlined'} onClick={() => setShowGrid((g) => !g)} sx={{ fontSize: '0.7rem', py: 0.5 }}>Grid</Button></Tooltip>
                <Tooltip title="Soft shadows"><Button size="small" fullWidth variant={showShadows ? 'contained' : 'outlined'} onClick={() => setShowShadows((s) => !s)} sx={{ fontSize: '0.7rem', py: 0.5 }}>Shadows</Button></Tooltip>
                <Tooltip title={viewMode !== 'exterior' ? 'Only in exterior mode' : 'Auto rotate'}>
                  <span style={{ flex: 1 }}>
                    <Button size="small" fullWidth variant={autoRotate ? 'contained' : 'outlined'} disabled={viewMode !== 'exterior'} onClick={() => setAutoRotate((a) => !a)} sx={{ fontSize: '0.7rem', py: 0.5 }}>Spin</Button>
                  </span>
                </Tooltip>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* Room editor */}
              {viewMode === 'interior' && (
                <>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 1 }}>
                    {selectedRoom ? 'ROOM EDITOR' : 'ROOMS'}
                  </Typography>

                  {/* Room list when nothing selected */}
                  {!selectedRoom && (
                    <Stack spacing={0.5} mt={1}>
                      {floorRooms.map((r) => (
                        <Button key={r.id} size="small" variant="outlined" fullWidth
                          startIcon={<RoomIcon type={r.type} />}
                          onClick={() => handleSelect(r.id)}
                          sx={{ justifyContent: 'flex-start', fontSize: '0.75rem', py: 0.5,
                            borderColor: 'divider', textTransform: 'none',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(108,99,255,0.06)' } }}>
                          {r.name}
                          <Box flex={1} />
                          <Typography variant="caption" color="text.secondary">F{r.floor + 1}</Typography>
                        </Button>
                      ))}
                    </Stack>
                  )}

                  {/* Edit panel when room is selected */}
                  {selectedRoom && (
                    <Box mt={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Typography variant="subtitle2" fontWeight={700}>{selectedRoom.name}</Typography>
                        <Tooltip title="Deselect">
                          <IconButton size="small" onClick={() => setSelectedRoomId(null)}>
                            <ChevronRight sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box mb={1.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>WALL COLOR</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.6}>
                          {['#f8f8f8', '#fff5f5', '#f0f9ff', '#f0fff4', '#fffbeb', '#fdf4ff', '#f0f0fe', '#fff8f0', '#e8f5e9'].map((c) => (
                            <Tooltip key={c} title={c}>
                              <Box onClick={() => updateRoom(selectedRoom.id, { wallColor: c })}
                                sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: c, cursor: 'pointer',
                                  border: selectedRoom.wallColor === c ? '2.5px solid #6C63FF' : '1px solid rgba(0,0,0,0.12)',
                                  transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.25)' } }} />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>

                      <Box mb={1.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>FLOOR MATERIAL</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {(Object.keys(FLOOR_COLORS) as FloorMat[]).map((m) => (
                            <Tooltip key={m} title={m.charAt(0).toUpperCase() + m.slice(1)}>
                              <Box onClick={() => updateRoom(selectedRoom.id, { floorMat: m })}
                                sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: FLOOR_COLORS[m], cursor: 'pointer',
                                  border: selectedRoom.floorMat === m ? '2.5px solid #6C63FF' : '1px solid rgba(0,0,0,0.12)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.2)' } }}>
                                <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>
                                  {m.slice(0, 3).toUpperCase()}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>FURNITURE</Typography>
                        <Stack spacing={0.4}>
                          {[
                            { key: 'bed', label: 'Bed', icon: <KingBed sx={{ fontSize: 14 }} /> },
                            { key: 'sofa', label: 'Sofa', icon: <Weekend sx={{ fontSize: 14 }} /> },
                            { key: 'coffee_table', label: 'Coffee Table', icon: <TableRestaurant sx={{ fontSize: 14 }} /> },
                            { key: 'tv', label: 'TV Unit', icon: <Visibility sx={{ fontSize: 14 }} /> },
                            { key: 'diningTable', label: 'Dining Table', icon: <TableRestaurant sx={{ fontSize: 14 }} /> },
                            { key: 'counter', label: 'Kitchen Counter', icon: <KitchenIcon sx={{ fontSize: 14 }} /> },
                            { key: 'island', label: 'Kitchen Island', icon: <SquareFoot sx={{ fontSize: 14 }} /> },
                            { key: 'wardrobe', label: 'Wardrobe', icon: <HomeWork sx={{ fontSize: 14 }} /> },
                            { key: 'desk', label: 'Desk', icon: <Tune sx={{ fontSize: 14 }} /> },
                          ].map(({ key, label, icon }) => {
                            const active = selectedRoom.furniture.includes(key)
                            return (
                              <Button key={key} size="small" variant={active ? 'contained' : 'outlined'}
                                startIcon={icon}
                                onClick={() => {
                                  const next = active
                                    ? selectedRoom.furniture.filter((f) => f !== key)
                                    : [...selectedRoom.furniture, key]
                                  updateRoom(selectedRoom.id, { furniture: next })
                                }}
                                sx={{ justifyContent: 'flex-start', fontSize: '0.72rem', py: 0.35, textTransform: 'none', borderColor: active ? undefined : 'divider' }}>
                                {label}
                              </Button>
                            )
                          })}
                        </Stack>
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {viewMode === 'exterior' && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Switch to <strong>Interior</strong> mode to edit rooms, materials and furniture.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Collapse>
      </Box>
    </Box>
  )
}
