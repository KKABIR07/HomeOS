import { Suspense, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Text, Box as DreiBox } from '@react-three/drei'
import * as THREE from 'three'
import {
  Box, Typography, Paper, Button, Stack, Chip,
  ToggleButtonGroup, ToggleButton, Slider, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { ArrowBack, WbSunny, NightlightRound, ViewInAr } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const HOUSE_STYLES = ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist']
const MATERIALS = ['concrete', 'brick', 'glass', 'wood', 'stone']
const ROOF_TYPES = ['flat', 'gable', 'hip', 'mansard']

const MATERIAL_COLORS: Record<string, string> = {
  concrete: '#9ca3af', brick: '#b45309', glass: '#93c5fd',
  wood: '#92400e', stone: '#6b7280',
}

function HouseModel({ style, material, roofType, floors }: { style: string; material: string; roofType: string; floors: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  const matColor = MATERIAL_COLORS[material] || '#9ca3af'

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.001
  })

  const wallMaterial = new THREE.MeshStandardMaterial({ color: matColor, roughness: 0.6, metalness: 0.1 })
  const roofMaterial = new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.8 })
  const windowMaterial = new THREE.MeshStandardMaterial({ color: '#93c5fd', transparent: true, opacity: 0.7, roughness: 0, metalness: 0.1 })
  const doorMaterial = new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.7 })
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.9 })

  const floorHeight = 2.8
  const totalHeight = floors * floorHeight

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 5]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>

      {/* Floors */}
      {Array.from({ length: floors }).map((_, i) => (
        <group key={i} position={[0, i * floorHeight, 0]}>
          {/* Main walls */}
          <mesh position={[0, floorHeight / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[6, floorHeight, 5]} />
            <meshStandardMaterial {...wallMaterial} />
          </mesh>
          {/* Front wall hollow - just overlay */}
          {/* Windows front */}
          <mesh position={[-1.5, floorHeight / 2 + 0.3, 2.51]} castShadow>
            <boxGeometry args={[1, 0.8, 0.05]} />
            <meshStandardMaterial {...windowMaterial} />
          </mesh>
          <mesh position={[1.5, floorHeight / 2 + 0.3, 2.51]} castShadow>
            <boxGeometry args={[1, 0.8, 0.05]} />
            <meshStandardMaterial {...windowMaterial} />
          </mesh>
          {/* Side windows */}
          <mesh position={[3.01, floorHeight / 2 + 0.3, 0]} castShadow>
            <boxGeometry args={[0.05, 0.8, 1]} />
            <meshStandardMaterial {...windowMaterial} />
          </mesh>
        </group>
      ))}

      {/* Door */}
      <mesh position={[0, 0.9, 2.52]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.05]} />
        <meshStandardMaterial {...doorMaterial} />
      </mesh>

      {/* Roof */}
      {roofType === 'flat' && (
        <mesh position={[0, totalHeight + 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 0.2, 5.4]} />
          <meshStandardMaterial {...roofMaterial} />
        </mesh>
      )}
      {roofType === 'gable' && (
        <mesh position={[0, totalHeight + 0.6, 0]} castShadow receiveShadow rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0, 3.5, 1.5, 4, 1]} />
          <meshStandardMaterial {...roofMaterial} />
        </mesh>
      )}
      {roofType === 'hip' && (
        <mesh position={[0, totalHeight + 0.5, 0]} castShadow receiveShadow>
          <coneGeometry args={[4, 1.5, 4]} />
          <meshStandardMaterial {...roofMaterial} />
        </mesh>
      )}
      {roofType === 'mansard' && (
        <>
          <mesh position={[0, totalHeight + 0.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.5, 1, 4.5]} />
            <meshStandardMaterial {...roofMaterial} />
          </mesh>
          <mesh position={[0, totalHeight + 1.1, 0]} castShadow receiveShadow>
            <coneGeometry args={[3, 0.8, 4]} />
            <meshStandardMaterial {...roofMaterial} />
          </mesh>
        </>
      )}

      {/* Ground floor */}
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial {...floorMaterial} />
      </mesh>

      {/* Style text label */}
      <Text position={[0, -0.5, 3]} fontSize={0.3} color="#6C63FF" anchorX="center" anchorY="middle">
        {style.toUpperCase()} • {floors}F
      </Text>
    </group>
  )
}

function Scene({ settings }: { settings: { style: string; material: string; roofType: string; floors: number; dayMode: boolean; showGrid: boolean } }) {
  return (
    <>
      <ambientLight intensity={settings.dayMode ? 0.6 : 0.15} />
      <directionalLight
        position={settings.dayMode ? [10, 15, 10] : [-5, 8, -5]}
        intensity={settings.dayMode ? 1.2 : 0.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color={settings.dayMode ? '#fff5e6' : '#4466ff'}
      />
      {!settings.dayMode && <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffaa44" />}
      <Environment preset={settings.dayMode ? 'city' : 'night'} />
      <HouseModel style={settings.style} material={settings.material} roofType={settings.roofType} floors={settings.floors} />
      {settings.showGrid && <Grid args={[20, 20]} cellSize={1} cellThickness={0.5} cellColor="#6C63FF" sectionColor="#4433bb" sectionSize={5} fadeDistance={25} />}
    </>
  )
}

export default function ThreeDViewerPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()

  const [style, setStyle] = useState('modern')
  const [material, setMaterial] = useState('concrete')
  const [roofType, setRoofType] = useState('flat')
  const [floors, setFloors] = useState(1)
  const [dayMode, setDayMode] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
    enabled: !!projectId,
  })

  const handleFloors = (_: Event, val: number | number[]) => setFloors(val as number)

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}>Back</Button>
        <Typography variant="h5" fontWeight={700}><ViewInAr sx={{ mr: 1, verticalAlign: 'middle' }} />3D House Viewer</Typography>
        {project && <Chip label={project.projectName} color="primary" size="small" />}
        <Box flex={1} />
        <ToggleButtonGroup size="small" value={dayMode ? 'day' : 'night'} exclusive onChange={(_, v) => v && setDayMode(v === 'day')}>
          <ToggleButton value="day"><WbSunny fontSize="small" /></ToggleButton>
          <ToggleButton value="night"><NightlightRound fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box display="flex" gap={2} flex={1} overflow="hidden">
        {/* 3D Canvas */}
        <Box flex={1} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: dayMode ? '#e0e7ef' : '#0a0c1a' }}>
          <Canvas shadows camera={{ position: [10, 8, 12], fov: 50 }} style={{ width: '100%', height: '100%' }}>
            <Suspense fallback={null}>
              <Scene settings={{ style, material, roofType, floors, dayMode, showGrid }} />
            </Suspense>
            <OrbitControls makeDefault enableDamping dampingFactor={0.05} autoRotate={autoRotate} autoRotateSpeed={1} />
          </Canvas>
        </Box>

        {/* Controls Panel */}
        <Paper sx={{ width: 240, p: 2.5, overflow: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>House Settings</Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Style</InputLabel>
            <Select value={style} label="Style" onChange={(e) => setStyle(e.target.value)}>
              {HOUSE_STYLES.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Material</InputLabel>
            <Select value={material} label="Material" onChange={(e) => setMaterial(e.target.value)}>
              {MATERIALS.map((m) => <MenuItem key={m} value={m}><Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: MATERIAL_COLORS[m] }} />{m.charAt(0).toUpperCase() + m.slice(1)}</Box></MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Roof Type</InputLabel>
            <Select value={roofType} label="Roof Type" onChange={(e) => setRoofType(e.target.value)}>
              {ROOF_TYPES.map((r) => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">Floors: {floors}</Typography>
          <Slider value={floors} onChange={handleFloors} min={1} max={5} marks step={1} sx={{ mb: 2 }} />

          <Stack spacing={1} mt={1}>
            <Button fullWidth size="small" variant={showGrid ? 'contained' : 'outlined'} onClick={() => setShowGrid((g) => !g)}>
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button fullWidth size="small" variant={autoRotate ? 'contained' : 'outlined'} onClick={() => setAutoRotate((a) => !a)}>
              {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
            </Button>
          </Stack>

          <Box mt={3}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>CONTROLS</Typography>
            <Typography variant="caption" display="block">🖱 Drag to orbit</Typography>
            <Typography variant="caption" display="block">🖱 Scroll to zoom</Typography>
            <Typography variant="caption" display="block">🖱 Right drag to pan</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
