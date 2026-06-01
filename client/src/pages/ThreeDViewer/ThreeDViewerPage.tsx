// @ts-nocheck
import { Suspense, useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Html, Sky, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import {
  Box, Typography, Paper, Button, Stack, Chip, Divider, Slider,
  ToggleButtonGroup, ToggleButton, Tooltip, IconButton, Select,
  MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel,
  Accordion, AccordionSummary, AccordionDetails, Table, TableBody,
  TableCell, TableHead, TableRow, Alert, CircularProgress, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  LinearProgress, Tab, Tabs,
} from '@mui/material'
import {
  ArrowBack, WbSunny, NightlightRound, ViewInAr, Save, Build,
  ExpandMore, Calculate, HomeWork, Download, CheckCircle,
  Layers, Architecture, Forest, DirectionsCar, NavigateNext,
  NavigateBefore, Refresh, AutoAwesome, SquareFoot,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = 'exterior' | 'interior' | 'topdown'
type BuildStep = 0|1|2|3|4|5|6

interface HouseConfig {
  // Foundation
  foundationType: 'strip' | 'raft' | 'pile' | 'isolated'
  concreteGrade: 'M15' | 'M20' | 'M25' | 'M30' | 'M35'
  cementType: 'OPC43' | 'OPC53' | 'PPC' | 'PSC'
  aggregateSize: '10mm' | '20mm' | '40mm'
  // Walls
  brickType: 'clay' | 'AAC' | 'flyAsh' | 'CLC' | 'wirecut'
  wallThickness: '4.5in' | '9in' | '13.5in'
  rebarGrade: 'Fe415' | 'Fe500' | 'Fe550' | 'Fe600'
  rebarMainDia: '10mm' | '12mm' | '16mm' | '20mm'
  rebarDistDia: '8mm' | '10mm'
  // Roof
  roofType: 'flat' | 'gable' | 'hip' | 'mansard' | 'steelTruss'
  roofWaterproofing: 'none' | 'bitumen' | 'crystalline' | 'APP' | 'polyurethane'
  roofInsulation: 'none' | 'mineralWool' | 'XPS' | 'EPS'
  // Floors
  groundFloor: 'vitrified' | 'marble' | 'granite' | 'hardwood' | 'carpet' | 'polishedConcrete'
  upperFloor: 'vitrified' | 'marble' | 'granite' | 'hardwood' | 'carpet'
  // Ceiling
  ceilingType: 'plaster' | 'POP' | 'gypsum' | 'wooden' | 'exposed' | 'armstrong'
  ceilingHeight: '8ft' | '9ft' | '10ft' | '12ft'
  // Exterior
  gardenType: 'none' | 'lawn' | 'landscaped' | 'premium'
  boundaryWall: 'none' | 'brick' | 'stone' | 'RCC' | 'composite'
  parking: 'none' | '1car' | '2car' | '3car'
  pathway: 'none' | 'concrete' | 'tiles' | 'gravel' | 'naturalStone'
  hasPool: boolean
  outdoorLighting: boolean
  treesCount: number
}

const DEFAULT_CONFIG: HouseConfig = {
  foundationType: 'strip', concreteGrade: 'M20', cementType: 'OPC53', aggregateSize: '20mm',
  brickType: 'clay', wallThickness: '9in', rebarGrade: 'Fe500', rebarMainDia: '12mm', rebarDistDia: '8mm',
  roofType: 'flat', roofWaterproofing: 'bitumen', roofInsulation: 'none',
  groundFloor: 'vitrified', upperFloor: 'vitrified',
  ceilingType: 'POP', ceilingHeight: '10ft',
  gardenType: 'lawn', boundaryWall: 'brick', parking: '1car', pathway: 'tiles',
  hasPool: false, outdoorLighting: true, treesCount: 4,
}

// ─── Material visual properties ────────────────────────────────────────────────
const WALL_MAT_COLORS: Record<string, string> = {
  clay: '#c27b5c', AAC: '#d4cfc7', flyAsh: '#b8b8a8', CLC: '#d0cdc8', wirecut: '#bd7a5e',
}
const FLOOR_COLORS: Record<string, string> = {
  vitrified: '#e8e4de', marble: '#f5f2ee', granite: '#8a8a7a',
  hardwood: '#b07d56', carpet: '#8b6f9e', polishedConcrete: '#9ea8b3',
}
const CEIL_COLORS: Record<string, string> = {
  plaster: '#f5f5f0', POP: '#fafafa', gypsum: '#f8f6f2',
  wooden: '#c8956c', exposed: '#b0b8c0', armstrong: '#e8e8e0',
}

// ─── BOQ Calculator ────────────────────────────────────────────────────────────
interface BOQItem { category: string; item: string; qty: number; unit: string; rate: number; amount: number; note?: string }

const CEMENT_GRADES = { M15: 6, M20: 8, M25: 10, M30: 12, M35: 14 } // bags/m³
const CEMENT_PRICE: Record<string, number> = { OPC43: 380, OPC53: 420, PPC: 360, PSC: 350 } // ₹/bag
const BRICK_QTY: Record<string, number> = { clay: 500, AAC: 10, flyAsh: 480, CLC: 420, wirecut: 480 } // per m² (AAC is blocks)
const BRICK_PRICE: Record<string, number> = { clay: 8, AAC: 85, flyAsh: 7, CLC: 25, wirecut: 9 }
const FLOOR_PRICE: Record<string, number> = { vitrified: 80, marble: 350, granite: 280, hardwood: 220, carpet: 120, polishedConcrete: 60 }
const REBAR_PRICE: Record<string, number> = { Fe415: 62, Fe500: 68, Fe550: 74, Fe600: 80 } // ₹/kg
const CITY_MULT: Record<string, number> = { mumbai: 1.5, delhi: 1.4, bangalore: 1.35, hyderabad: 1.25, chennai: 1.2, pune: 1.2, kolkata: 1.1 }

function getCityMult(loc: string): number {
  const l = loc.toLowerCase()
  return Object.entries(CITY_MULT).find(([k]) => l.includes(k))?.[1] ?? 1.0
}

function calcBOQ(cfg: HouseConfig, plotW: number, plotL: number, floors: number, location: string): BOQItem[] {
  const cm = getCityMult(location)
  const plotArea = plotW * plotL                            // sq ft
  const plotAreaM2 = plotArea * 0.0929                     // m²
  const perimeter = 2 * (plotW + plotL) * 0.3048           // m
  const wallAreaM2 = perimeter * (floors * 3.0) * 0.85     // m² minus openings
  const slabVolM3 = plotAreaM2 * 0.125 * floors            // 125mm slab
  const colVolM3 = (Math.ceil(plotW / 10) + 1) * (Math.ceil(plotL / 10) + 1) * 0.09 * 3 * floors
  const beamVolM3 = (perimeter / 5) * 50 * 0.23 * 0.45 * floors / 1000
  const totalRCCm3 = slabVolM3 + colVolM3 + beamVolM3
  const cementBagsSlab = Math.ceil(totalRCCm3 * CEMENT_GRADES[cfg.concreteGrade])
  const sandM3RCC = Math.ceil(totalRCCm3 * 0.44)
  const aggM3RCC = Math.ceil(totalRCCm3 * 0.88)
  const rebarKg = Math.ceil(totalRCCm3 * 95) // 95 kg/m³ avg
  const brickQty = Math.ceil(wallAreaM2 * (BRICK_QTY[cfg.brickType]))
  const mortarCement = Math.ceil(wallAreaM2 * 0.5)
  const mortarSand = Math.ceil(wallAreaM2 * 0.035)
  const plasterArea = wallAreaM2 * 2 * 1.1
  const plasterCement = Math.ceil(plasterArea * 0.35)
  const carpetAreaSqFt = plotArea * floors * 0.85
  const floorTiles = Math.ceil(carpetAreaSqFt * 1.1)
  const ceilAreaSqFt = carpetAreaSqFt
  const roofAreaM2 = plotAreaM2 * 1.05
  const cp = CEMENT_PRICE[cfg.cementType]

  const items: BOQItem[] = [
    // Foundation
    { category: 'Foundation', item: 'Excavation & earthwork', qty: Math.ceil(plotAreaM2 * 1.5), unit: 'm³', rate: Math.round(180 * cm), amount: 0 },
    { category: 'Foundation', item: 'PCC (1:4:8)', qty: Math.ceil(plotAreaM2 * 0.1), unit: 'm³', rate: Math.round(4500 * cm), amount: 0 },
    { category: 'Foundation', item: `Cement (${cfg.cementType}) – Foundation`, qty: Math.ceil(totalRCCm3 * 2), unit: 'bags', rate: Math.round(cp * cm), amount: 0, note: `${cfg.concreteGrade} grade` },
    // RCC
    { category: 'RCC Structure', item: `Cement (${cfg.cementType}) – Slab/Beam/Column`, qty: cementBagsSlab, unit: 'bags', rate: Math.round(cp * cm), amount: 0 },
    { category: 'RCC Structure', item: 'River Sand (M-Sand)', qty: sandM3RCC, unit: 'm³', rate: Math.round(1800 * cm), amount: 0 },
    { category: 'RCC Structure', item: `Aggregate ${cfg.aggregateSize}`, qty: aggM3RCC, unit: 'm³', rate: Math.round(1200 * cm), amount: 0 },
    { category: 'RCC Structure', item: `${cfg.rebarGrade} Steel (${cfg.rebarMainDia} main / ${cfg.rebarDistDia} dist.)`, qty: rebarKg, unit: 'kg', rate: Math.round(REBAR_PRICE[cfg.rebarGrade] * cm), amount: 0, note: 'Including binding wire & wastage' },
    // Masonry
    { category: 'Masonry Walls', item: `${cfg.brickType === 'AAC' ? 'AAC Blocks' : cfg.brickType.charAt(0).toUpperCase() + cfg.brickType.slice(1) + ' Bricks'} (${cfg.wallThickness} wall)`, qty: brickQty, unit: cfg.brickType === 'AAC' ? 'blocks' : 'nos', rate: Math.round(BRICK_PRICE[cfg.brickType] * cm), amount: 0 },
    { category: 'Masonry Walls', item: 'Cement for masonry mortar', qty: mortarCement, unit: 'bags', rate: Math.round(cp * cm), amount: 0 },
    { category: 'Masonry Walls', item: 'Sand for masonry mortar', qty: mortarSand, unit: 'm³', rate: Math.round(1800 * cm), amount: 0 },
    // Plaster
    { category: 'Plastering', item: 'Cement for plaster (inside+outside)', qty: plasterCement, unit: 'bags', rate: Math.round(cp * cm), amount: 0 },
    { category: 'Plastering', item: 'Sand for plaster', qty: Math.ceil(plasterArea * 0.025), unit: 'm³', rate: Math.round(1800 * cm), amount: 0 },
    // Roof
    { category: 'Roofing', item: 'RCC Roof slab concrete', qty: Math.ceil(roofAreaM2 * 0.125), unit: 'm³', rate: Math.round(5500 * cm), amount: 0 },
    { category: 'Roofing', item: `Waterproofing (${cfg.roofWaterproofing})`, qty: Math.ceil(roofAreaM2), unit: 'm²', rate: cfg.roofWaterproofing === 'none' ? 0 : Math.round({ bitumen: 180, crystalline: 280, APP: 350, polyurethane: 420 }[cfg.roofWaterproofing as string] ?? 0 * cm), amount: 0 },
    ...(cfg.roofInsulation !== 'none' ? [{ category: 'Roofing', item: `Roof insulation (${cfg.roofInsulation})`, qty: Math.ceil(roofAreaM2), unit: 'm²', rate: Math.round({ mineralWool: 220, XPS: 380, EPS: 160 }[cfg.roofInsulation] ?? 0 * cm), amount: 0 }] : []),
    // Flooring
    { category: 'Flooring', item: `${cfg.groundFloor.charAt(0).toUpperCase() + cfg.groundFloor.slice(1)} tiles (GF)`, qty: Math.ceil(carpetAreaSqFt / floors * 1.1), unit: 'sq ft', rate: Math.round(FLOOR_PRICE[cfg.groundFloor] * cm), amount: 0 },
    ...(floors > 1 ? [{ category: 'Flooring', item: `${cfg.upperFloor.charAt(0).toUpperCase() + cfg.upperFloor.slice(1)} tiles (Upper)`, qty: Math.ceil(carpetAreaSqFt / floors * (floors - 1) * 1.1), unit: 'sq ft', rate: Math.round(FLOOR_PRICE[cfg.upperFloor] * cm), amount: 0 }] : []),
    // Ceiling
    { category: 'Ceiling', item: `${cfg.ceilingType.toUpperCase()} false ceiling (${cfg.ceilingHeight})`, qty: Math.ceil(ceilAreaSqFt), unit: 'sq ft', rate: Math.round({ plaster: 25, POP: 55, gypsum: 80, wooden: 150, exposed: 20, armstrong: 65 }[cfg.ceilingType] * cm), amount: 0 },
    // Exterior
    ...(cfg.gardenType !== 'none' ? [{ category: 'Exterior', item: `Garden / Landscape (${cfg.gardenType})`, qty: Math.ceil(plotArea * 0.3), unit: 'sq ft', rate: Math.round({ lawn: 15, landscaped: 45, premium: 120 }[cfg.gardenType] * cm), amount: 0 }] : []),
    ...(cfg.boundaryWall !== 'none' ? [{ category: 'Exterior', item: `Boundary wall (${cfg.boundaryWall})`, qty: Math.ceil(perimeter / 0.3048), unit: 'rft', rate: Math.round({ brick: 850, stone: 1200, RCC: 950, composite: 1400 }[cfg.boundaryWall] * cm), amount: 0 }] : []),
    ...(cfg.parking !== 'none' ? [{ category: 'Exterior', item: `Parking area (${cfg.parking})`, qty: cfg.parking === '1car' ? 180 : cfg.parking === '2car' ? 360 : 540, unit: 'sq ft', rate: Math.round(80 * cm), amount: 0 }] : []),
    ...(cfg.pathway !== 'none' ? [{ category: 'Exterior', item: `${cfg.pathway.charAt(0).toUpperCase() + cfg.pathway.slice(1)} pathway`, qty: Math.ceil(plotArea * 0.08), unit: 'sq ft', rate: Math.round({ concrete: 40, tiles: 60, gravel: 20, naturalStone: 110 }[cfg.pathway] * cm), amount: 0 }] : []),
    ...(cfg.hasPool ? [{ category: 'Exterior', item: 'Swimming pool (standard)', qty: 1, unit: 'lump sum', rate: Math.round(450000 * cm), amount: 0, note: '12×20ft pool with filtration' }] : []),
    ...(cfg.outdoorLighting ? [{ category: 'Exterior', item: 'Outdoor lighting & electrical', qty: 1, unit: 'lump sum', rate: Math.round(45000 * cm), amount: 0 }] : []),
    ...(cfg.treesCount > 0 ? [{ category: 'Exterior', item: 'Trees & plants (grown saplings)', qty: cfg.treesCount, unit: 'nos', rate: Math.round(1200 * cm), amount: 0 }] : []),
    // MEP
    { category: 'MEP', item: 'Electrical wiring & fixtures', qty: Math.ceil(carpetAreaSqFt), unit: 'sq ft', rate: Math.round(55 * cm), amount: 0 },
    { category: 'MEP', item: 'Plumbing (supply + drainage)', qty: Math.ceil(carpetAreaSqFt), unit: 'sq ft', rate: Math.round(40 * cm), amount: 0 },
    { category: 'MEP', item: 'Sanitary fixtures (standard)', qty: Math.ceil(floors * 1.5), unit: 'sets', rate: Math.round(22000 * cm), amount: 0 },
    // Finishes
    { category: 'Finishes', item: 'Interior paint (2 coats emulsion)', qty: Math.ceil(wallAreaM2 * 10.764), unit: 'sq ft', rate: Math.round(18 * cm), amount: 0 },
    { category: 'Finishes', item: 'Exterior texture / weather coat', qty: Math.ceil(wallAreaM2 * 0.5 * 10.764), unit: 'sq ft', rate: Math.round(28 * cm), amount: 0 },
    { category: 'Finishes', item: 'Doors & windows (standard set)', qty: Math.ceil(floors * 6), unit: 'nos', rate: Math.round(8500 * cm), amount: 0 },
  ]

  return items.map(i => ({ ...i, amount: Math.round(i.qty * i.rate) })).filter(i => i.amount > 0)
}

// ─── 3D Scene ─────────────────────────────────────────────────────────────────
function CameraController({ viewMode, orbitRef }: { viewMode: ViewMode; orbitRef: React.RefObject<any> }) {
  const { camera } = useThree()
  const tPos = useMemo(() => {
    if (viewMode === 'topdown') return new THREE.Vector3(0, 26, 0.01)
    if (viewMode === 'interior') return new THREE.Vector3(0, 5, 10)
    return new THREE.Vector3(12, 9, 14)
  }, [viewMode])
  const tTarget = useMemo(() => {
    if (viewMode === 'topdown') return new THREE.Vector3(0, 0, 0)
    if (viewMode === 'interior') return new THREE.Vector3(0, 2, 0)
    return new THREE.Vector3(0, 3, 0)
  }, [viewMode])
  useFrame(() => {
    camera.position.lerp(tPos, 0.04)
    if (orbitRef.current) { orbitRef.current.target.lerp(tTarget, 0.04); orbitRef.current.update() }
  })
  return null
}

function EmptyLot({ plotW, plotL, showGrid }: { plotW: number; plotL: number; showGrid: boolean }) {
  const w = plotW * 0.305; const d = plotL * 0.305
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#c8e6c0" roughness={0.95} />
      </mesh>
      {/* Plot boundary */}
      {[[-w/2, 0, 0, w, 0.1, 0.08], [w/2, 0, 0, 0.08, 0.1, d], [-w/2, 0, d/2, w, 0.1, 0.08], [0, 0, d/2, 0.08, 0.1, d]
      ].map((p, i) => (
        <mesh key={i} position={[p[0], p[1]+0.05, p[2]] as any}><boxGeometry args={[p[3], p[4], p[5]] as any} /><meshStandardMaterial color="#e67e22" /></mesh>
      ))}
      <Html position={[0, 0.5, d / 2 + 0.5]} center>
        <div style={{ background: 'rgba(230,126,34,0.9)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {plotW}ft × {plotL}ft Plot
        </div>
      </Html>
      {showGrid && <Grid args={[50, 50]} cellSize={0.305} cellColor="#88aa88" sectionSize={3.05} sectionColor="#448844" fadeDistance={30} />}
    </group>
  )
}

function HouseModel3D({ cfg, plotW, plotL, floors, dayMode, showGrid, viewMode, orbitRef, autoRotate }: {
  cfg: HouseConfig; plotW: number; plotL: number; floors: number; dayMode: boolean
  showGrid: boolean; viewMode: ViewMode; orbitRef: React.RefObject<any>; autoRotate: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const W = plotW * 0.24; const D = plotL * 0.24; const fh = parseFloat(cfg.ceilingHeight) * 0.3048
  const wallColor = WALL_MAT_COLORS[cfg.brickType] || '#c27b5c'
  const floorColor = FLOOR_COLORS[cfg.groundFloor] || '#e8e4de'
  const ceilColor = CEIL_COLORS[cfg.ceilingType] || '#f5f5f0'

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 }), [wallColor])
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1f2e', roughness: 0.8 }), [])
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.5 }), [floorColor])
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#a8d8f0', transparent: true, opacity: 0.55, roughness: 0, metalness: 0.1 }), [])
  const foundMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a8a82', roughness: 0.95 }), [])
  const concreteColMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b0b8c0', roughness: 0.8 }), [])

  useFrame((_, dt) => {
    if (autoRotate && viewMode === 'exterior' && groupRef.current) groupRef.current.rotation.y += dt * 0.3
  })

  const transparent = viewMode !== 'exterior'
  const tWallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85, transparent: true, opacity: 0.18, side: THREE.DoubleSide }), [wallColor])

  // Columns at corners + edge midpoints only (realistic residential placement)
  const colPositions: [number, number][] = [
    [-W/2, -D/2], [W/2, -D/2], [-W/2, D/2], [W/2, D/2],
    ...(W > 5 ? [[-W/2 + W/2, -D/2] as [number,number], [-W/2 + W/2, D/2] as [number,number]] : []),
    ...(D > 5 ? [[-W/2, -D/2 + D/2] as [number,number], [W/2, -D/2 + D/2] as [number,number]] : []),
  ]

  return (
    <group ref={groupRef}>
      {dayMode && <Sky sunPosition={[100, 40, 80]} turbidity={5} rayleigh={0.4} />}
      <ambientLight intensity={dayMode ? 0.6 : 0.15} />
      <directionalLight position={dayMode ? [15, 20, 10] : [-6, 14, -6]} intensity={dayMode ? 1.1 : 0.25} castShadow shadow-mapSize={[2048, 2048]} color={dayMode ? '#fff8f0' : '#4455aa'} />
      {dayMode && <hemisphereLight args={['#87ceeb', '#c8e8c0', 0.4]} />}
      {!dayMode && <pointLight position={[0, 4, 0]} intensity={0.8} color="#ffaa44" />}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={dayMode ? '#c8e6c0' : '#1a2030'} roughness={0.95} />
      </mesh>

      {/* Foundation */}
      <mesh position={[0, -0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.4, 0.24, D + 0.4]} />
        <primitive object={foundMat} />
      </mesh>

      {/* Floors */}
      {Array.from({ length: floors }).map((_, fl) => (
        <group key={fl} position={[0, fl * fh, 0]}>
          {/* Outer walls */}
          {(transparent ? tWallMat : wallMat) && [
            { p: [0, fh/2, -D/2] as [number,number,number], s: [W + 0.18, fh, 0.18] as [number,number,number] },
            { p: [0, fh/2, D/2] as [number,number,number], s: [W + 0.18, fh, 0.18] as [number,number,number] },
            { p: [-W/2, fh/2, 0] as [number,number,number], s: [0.18, fh, D] as [number,number,number] },
            { p: [W/2, fh/2, 0] as [number,number,number], s: [0.18, fh, D] as [number,number,number] },
          ].map((w, j) => (
            <mesh key={j} position={w.p} castShadow receiveShadow>
              <boxGeometry args={w.s} />
              <primitive object={transparent ? tWallMat : wallMat} />
            </mesh>
          ))}

          {/* Columns */}
          {colPositions.map(([cx, cz], ci) => (
            <mesh key={ci} position={[cx, fh/2, cz]} castShadow>
              <boxGeometry args={[0.3, fh, 0.3]} />
              <primitive object={concreteColMat} />
            </mesh>
          ))}

          {/* Floor slab */}
          <mesh position={[0, 0.06, 0]} receiveShadow>
            <boxGeometry args={[W, 0.12, D]} />
            <primitive object={floorMat} />
          </mesh>

          {/* Windows front */}
          {[-W/3, W/3].map((wx, wi) => (
            <group key={wi}>
              <mesh position={[wx, fh*0.6, D/2 + 0.01]} castShadow>
                <boxGeometry args={[0.9, 0.85, 0.06]} />
                <primitive object={glassMat} />
              </mesh>
              <mesh position={[wx, fh*0.6, D/2 + 0.02]}>
                <boxGeometry args={[0.92, 0.87, 0.02]} />
                <meshStandardMaterial color="#8B7355" roughness={0.6} wireframe />
              </mesh>
            </group>
          ))}
          {/* Side windows */}
          <mesh position={[W/2 + 0.01, fh*0.6, 0]} castShadow>
            <boxGeometry args={[0.06, 0.85, 0.9]} />
            <primitive object={glassMat} />
          </mesh>
          {/* Back windows */}
          <mesh position={[0, fh*0.6, -D/2 - 0.01]} castShadow>
            <boxGeometry args={[0.9, 0.85, 0.06]} />
            <primitive object={glassMat} />
          </mesh>
          {/* Door (ground floor only) */}
          {fl === 0 && (
            <>
              <mesh position={[0, fh*0.42, D/2 + 0.01]} castShadow>
                <boxGeometry args={[0.9, fh * 0.7, 0.06]} />
                <meshStandardMaterial color="#7c4a1e" roughness={0.5} />
              </mesh>
              <mesh position={[0.38, fh*0.42, D/2 + 0.04]}>
                <sphereGeometry args={[0.04]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Roof beam / ring beam */}
      <group position={[0, floors * fh, 0]}>
        <mesh><boxGeometry args={[W + 0.3, 0.24, D + 0.3]} /><primitive object={concreteColMat} /></mesh>
      </group>

      {/* Roof */}
      {(() => {
        const totalH = floors * fh
        const m = roofMat
        if (cfg.roofType === 'flat') return (
          <>
            <mesh position={[0, totalH + 0.13, 0]} castShadow><boxGeometry args={[W + 0.5, 0.26, D + 0.5]} /><primitive object={m} /></mesh>
            {/* Parapet */}
            {[
              { p: [0, totalH + 0.5, -D/2 - 0.26] as [number,number,number], s: [W + 0.5, 0.75, 0.18] as [number,number,number] },
              { p: [0, totalH + 0.5, D/2 + 0.26] as [number,number,number], s: [W + 0.5, 0.75, 0.18] as [number,number,number] },
              { p: [-W/2 - 0.26, totalH + 0.5, 0] as [number,number,number], s: [0.18, 0.75, D + 0.5] as [number,number,number] },
              { p: [W/2 + 0.26, totalH + 0.5, 0] as [number,number,number], s: [0.18, 0.75, D + 0.5] as [number,number,number] },
            ].map((w, j) => <mesh key={j} position={w.p} castShadow><boxGeometry args={w.s} /><primitive object={transparent ? tWallMat : wallMat} /></mesh>)}
          </>
        )
        if (cfg.roofType === 'gable') return <mesh position={[0, totalH + 0.8, 0]} rotation={[0, Math.PI/4, 0]} castShadow><cylinderGeometry args={[0, Math.max(W, D)/2 + 0.4, 1.6, 4]} /><primitive object={m} /></mesh>
        if (cfg.roofType === 'hip') return <mesh position={[0, totalH + 0.75, 0]} castShadow><coneGeometry args={[Math.max(W, D)/2 + 0.5, 1.8, 4]} /><primitive object={m} /></mesh>
        if (cfg.roofType === 'mansard') return <>
          <mesh position={[0, totalH + 0.5, 0]} castShadow><boxGeometry args={[W + 0.2, 1.0, D + 0.2]} /><primitive object={m} /></mesh>
          <mesh position={[0, totalH + 1.15, 0]} castShadow><coneGeometry args={[Math.min(W, D)/2, 0.9, 4]} /><primitive object={m} /></mesh>
        </>
        if (cfg.roofType === 'steelTruss') return <>
          <mesh position={[0, totalH + 0.1, 0]}><boxGeometry args={[W + 0.3, 0.08, D + 0.3]} /><meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} /></mesh>
          {[-W/3, 0, W/3].map((tx, ti) => <mesh key={ti} position={[tx, totalH + 0.6, 0]} castShadow><boxGeometry args={[0.06, 1.1, D + 0.3]} /><meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} /></mesh>)}
        </>
        return null
      })()}

      {/* Exterior: Garden */}
      {cfg.gardenType !== 'none' && (() => {
        const gx = W / 2 + 1.5; const gz = D / 2 + 1.5
        const grassColor = { lawn: '#4caf50', landscaped: '#388e3c', premium: '#2e7d32' }[cfg.gardenType]
        return (
          <group>
            <mesh position={[gx, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[2.5, D + 2]} /><meshStandardMaterial color={grassColor} roughness={0.98} /></mesh>
            <mesh position={[-gx, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[2.5, D + 2]} /><meshStandardMaterial color={grassColor} roughness={0.98} /></mesh>
            <mesh position={[0, 0.02, -(D/2 + 1.5)]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[W + 5, 2]} /><meshStandardMaterial color={grassColor} roughness={0.98} /></mesh>
            {/* Trees */}
            {Array.from({ length: cfg.treesCount }).map((_, ti) => {
              const angle = (ti / cfg.treesCount) * Math.PI * 2; const r = Math.max(gx, gz) + 0.5
              return (
                <group key={ti} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
                  <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.08, 0.12, 2, 6]} /><meshStandardMaterial color="#6d4c41" roughness={0.9} /></mesh>
                  <mesh position={[0, 2.8, 0]}><coneGeometry args={[0.7, 2.0, 7]} /><meshStandardMaterial color="#2e7d32" roughness={0.95} /></mesh>
                  <mesh position={[0, 2.0, 0]}><coneGeometry args={[0.9, 1.5, 7]} /><meshStandardMaterial color="#388e3c" roughness={0.95} /></mesh>
                </group>
              )
            })}
          </group>
        )
      })()}

      {/* Exterior: Boundary wall */}
      {cfg.boundaryWall !== 'none' && (() => {
        const bw = W / 2 + 3; const bd = D / 2 + 3
        const bColor = { brick: '#b45309', stone: '#6b7280', RCC: '#9ca3af', composite: '#c0a060' }[cfg.boundaryWall] ?? '#b45309'
        return [
          { p: [0, 0.5, -bd] as [number,number,number], s: [bw * 2 + 0.3, 1.0, 0.2] as [number,number,number] },
          { p: [0, 0.5, bd] as [number,number,number], s: [bw * 2 + 0.3, 1.0, 0.2] as [number,number,number] },
          { p: [-bw, 0.5, 0] as [number,number,number], s: [0.2, 1.0, bd * 2] as [number,number,number] },
          { p: [bw, 0.5, 0] as [number,number,number], s: [0.2, 1.0, bd * 2] as [number,number,number] },
        ].map((w, j) => <mesh key={j} position={w.p} castShadow><boxGeometry args={w.s} /><meshStandardMaterial color={bColor} roughness={0.9} /></mesh>)
      })()}

      {/* Exterior: Parking */}
      {cfg.parking !== 'none' && (() => {
        const cars = parseInt(cfg.parking)
        return <mesh position={[-W/2 - 1.5, 0.01, D/2 + 2]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[cars * 2.8, 5.5]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.95} />
        </mesh>
      })()}

      {/* Exterior: Pathway */}
      {cfg.pathway !== 'none' && (
        <mesh position={[0, 0.02, D/2 + 2]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.2, 3.5]} />
          <meshStandardMaterial color={{ concrete: '#bdbdbd', tiles: '#d4cfc7', gravel: '#bcaaa4', naturalStone: '#a5a09a' }[cfg.pathway] ?? '#bdbdbd'} roughness={0.9} />
        </mesh>
      )}

      {/* Pool */}
      {cfg.hasPool && (
        <group position={[W/2 + 2.5, 0, -D/2 - 2]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[3.6, 0.3, 6.0]} /><meshStandardMaterial color="#29b6f6" transparent opacity={0.8} /></mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[3.6, 6]} /><meshPhysicalMaterial color="#29b6f6" transmission={0.9} roughness={0} /></mesh>
        </group>
      )}

      <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={25} blur={1.8} far={12} />
      {showGrid && <Grid args={[40, 40]} position={[0, 0.02, 0]} cellSize={0.305} cellColor="#aaaaaa" sectionSize={3.05} sectionColor="#888888" fadeDistance={20} />}
      <CameraController viewMode={viewMode} orbitRef={orbitRef} />
    </group>
  )
}

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = ['Foundation', 'Walls & Rebar', 'Roof', 'Floors', 'Ceiling', 'Exterior', 'BOQ & Cost']

// ─── Option row ───────────────────────────────────────────────────────────────
function OptionRow<T extends string>({ label, value, options, onChange, hint }: {
  label: string; value: T; options: { value: T; label: string; detail?: string }[]
  onChange: (v: T) => void; hint?: string
}) {
  return (
    <Box mb={1.5}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>{label}</Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {options.map(o => (
          <Tooltip key={o.value} title={o.detail || ''}>
            <Chip size="small" label={o.label} clickable
              color={value === o.value ? 'primary' : 'default'}
              variant={value === o.value ? 'filled' : 'outlined'}
              onClick={() => onChange(o.value)}
              sx={{ fontSize: '0.7rem', height: 24 }} />
          </Tooltip>
        ))}
      </Stack>
      {hint && <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: 'block', fontSize: '0.65rem' }}>{hint}</Typography>}
    </Box>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ThreeDViewerPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const orbitRef = useRef<any>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('exterior')
  const [dayMode, setDayMode] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [step, setStep] = useState<BuildStep>(0)
  const [cfg, setCfg] = useState<HouseConfig>(DEFAULT_CONFIG)
  const [buildStarted, setBuildStarted] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [boqTab, setBoqTab] = useState(0)
  const [saveLoading, setSaveLoading] = useState(false)
  const [costLoading, setCostLoading] = useState(false)
  const [serverCost, setServerCost] = useState<Record<string, number> | null>(null)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
    enabled: !!projectId,
  })

  const plotW = project?.plotWidth || 30
  const plotL = project?.plotLength || 40
  const floors = project?.floors || 1
  const location = project?.location || ''

  const boq = useMemo(() => calcBOQ(cfg, plotW, plotL, floors, location), [cfg, plotW, plotL, floors, location])
  const totalCost = useMemo(() => boq.reduce((s, i) => s + i.amount, 0), [boq])
  const byCategory = useMemo(() => {
    const map: Record<string, BOQItem[]> = {}
    boq.forEach(i => { if (!map[i.category]) map[i.category] = []; map[i.category].push(i) })
    return map
  }, [boq])

  const set = useCallback(<K extends keyof HouseConfig>(k: K, v: HouseConfig[K]) =>
    setCfg(p => ({ ...p, [k]: v })), [])

  const fetchServerCost = async () => {
    setCostLoading(true)
    try {
      const res = await api.post('/cost-estimate', { plotWidth: plotW, plotLength: plotL, floors, houseStyle: project?.houseStyle || 'modern', location })
      setServerCost(res.data.estimate?.totals)
      toast.success('Server cost estimate fetched!')
    } catch { toast.error('Could not fetch server estimate') }
    finally { setCostLoading(false) }
  }

  const handleSave = async () => {
    setSaveLoading(true)
    try {
      const configStr = JSON.stringify({ houseConfig: cfg, boqTotal: totalCost })
      await api.put(`/projects/${projectId}`, { description: configStr.slice(0, 3999) })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('3D configuration saved to project!')
    } catch { toast.error('Save failed') }
    finally { setSaveLoading(false) }
  }

  const handleNext = () => { if (step < 6) setStep(s => (s + 1) as BuildStep) }
  const handlePrev = () => { if (step > 0) setStep(s => (s - 1) as BuildStep) }

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <IconButton size="small" onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}><ArrowBack fontSize="small" /></IconButton>
        <Architecture sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={700}>3D House Builder</Typography>
        {project && <Chip label={project.projectName} size="small" color="primary" variant="outlined" />}
        {buildStarted && <Chip label={`Step ${step + 1}/7: ${STEPS[step]}`} size="small" color="secondary" />}
        <Box flex={1} />

        <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}
          sx={{ '& .MuiToggleButton-root': { px: 1.2, fontSize: '0.72rem', fontWeight: 600 } }}>
          <ToggleButton value="exterior"><HomeWork sx={{ fontSize: 14, mr: 0.4 }} />Exterior</ToggleButton>
          <ToggleButton value="interior"><Layers sx={{ fontSize: 14, mr: 0.4 }} />Interior</ToggleButton>
          <ToggleButton value="topdown"><ViewInAr sx={{ fontSize: 14, mr: 0.4 }} />Top View</ToggleButton>
        </ToggleButtonGroup>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <ToggleButtonGroup size="small" value={dayMode ? 'day' : 'night'} exclusive onChange={(_, v) => v && setDayMode(v === 'day')}>
          <ToggleButton value="day"><WbSunny sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="night"><NightlightRound sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title={autoRotate ? 'Stop rotation' : 'Auto rotate'}>
          <IconButton size="small" color={autoRotate ? 'primary' : 'default'} onClick={() => setAutoRotate(a => !a)}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Button size="small" variant="contained" startIcon={saveLoading ? <CircularProgress size={13} color="inherit" /> : <Save fontSize="small" />}
          onClick={handleSave} disabled={saveLoading || !buildStarted}
          sx={{ fontSize: '0.72rem', py: 0.35, background: 'linear-gradient(135deg,#6C63FF,#8B85FF)' }}>
          Save
        </Button>
      </Box>

      <Box display="flex" flex={1} overflow="hidden">
        {/* Canvas */}
        <Box flex={1} sx={{ position: 'relative', bgcolor: dayMode ? '#c8dff0' : '#080c14', overflow: 'hidden' }}>
          {contextLost && (
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.85)', gap: 2 }}>
              <Typography color="white" variant="h6">WebGL context lost</Typography>
              <Button variant="contained" startIcon={<Refresh />} onClick={() => window.location.reload()}>Reload</Button>
            </Box>
          )}
          <Canvas shadows camera={{ position: [12, 9, 14], fov: 48, near: 0.1, far: 300 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ powerPreference: 'high-performance', antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); setContextLost(true) })
              gl.domElement.addEventListener('webglcontextrestored', () => setContextLost(false))
              gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap
            }}>
            <Suspense fallback={null}>
              {!buildStarted
                ? <EmptyLot plotW={plotW} plotL={plotL} showGrid={showGrid} />
                : <HouseModel3D cfg={cfg} plotW={plotW} plotL={plotL} floors={floors} dayMode={dayMode}
                    showGrid={showGrid} viewMode={viewMode} orbitRef={orbitRef} autoRotate={autoRotate} />
              }
            </Suspense>
            {buildStarted && <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.07} minDistance={2} maxDistance={60} />}
            {!buildStarted && <OrbitControls makeDefault enableDamping dampingFactor={0.07} />}
          </Canvas>

          {/* Bottom overlay */}
          <Box sx={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 0.5 }}>
            <Chip size="small" icon={<SquareFoot />} label={`${plotW}×${plotL}ft`} sx={{ fontSize: '0.7rem', height: 22, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }} />
            {buildStarted && <Chip size="small" label={fmt(totalCost)} sx={{ fontSize: '0.7rem', height: 22, bgcolor: 'rgba(108,99,255,0.8)', color: 'white' }} />}
          </Box>
        </Box>

        {/* Right panel */}
        <Paper square sx={{ width: 340, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!buildStarted ? (
            /* ── Start screen ── */
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
              <Architecture sx={{ fontSize: 56, color: 'primary.main', opacity: 0.7 }} />
              <Typography variant="h6" fontWeight={700} textAlign="center">Build From Scratch</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Configure every material — cement grade, brick type, rebar, floors, ceilings, and landscaping. Get a detailed BOQ with location-based costs.
              </Typography>
              {project && (
                <Box sx={{ width: '100%', p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary" display="block">PROJECT SPECS</Typography>
                  <Typography variant="body2">Plot: {plotW}ft × {plotL}ft = {plotW * plotL} sq ft</Typography>
                  <Typography variant="body2">Floors: {floors}</Typography>
                  <Typography variant="body2">Location: {location || 'Not set'}</Typography>
                  <Typography variant="body2">Style: {project.houseStyle || 'Modern'}</Typography>
                </Box>
              )}
              <Button variant="contained" size="large" fullWidth startIcon={<Build />}
                onClick={() => setBuildStarted(true)}
                sx={{ background: 'linear-gradient(135deg,#6C63FF,#8B85FF)', py: 1.2 }}>
                Start Building
              </Button>
              <Button variant="outlined" size="small" fullWidth onClick={() => setShowGrid(g => !g)}>
                {showGrid ? 'Hide Grid' : 'Show Plot Grid'}
              </Button>
            </Box>
          ) : (
            /* ── Builder ── */
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Stepper */}
              <Box sx={{ px: 1.5, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stepper activeStep={step} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.6rem', mt: 0.3 }, '& .MuiStepIcon-root': { fontSize: '1rem' } }}>
                  {STEPS.map((s, i) => (
                    <Step key={s} completed={i < step} sx={{ cursor: 'pointer', px: 0 }} onClick={() => setStep(i as BuildStep)}>
                      <StepLabel>{s}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Step content */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {step === 0 && (
                  <>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Foundation & Concrete</Typography>
                    <OptionRow label="Foundation Type" value={cfg.foundationType} onChange={v => set('foundationType', v)}
                      options={[{value:'strip',label:'Strip'},{value:'raft',label:'Raft Slab'},{value:'pile',label:'Pile',detail:'For soft soil'},{value:'isolated',label:'Isolated'}]} />
                    <OptionRow label="Concrete Grade" value={cfg.concreteGrade} onChange={v => set('concreteGrade', v)}
                      options={[{value:'M15',label:'M15',detail:'Plain concrete'},{value:'M20',label:'M20',detail:'Standard RCC'},{value:'M25',label:'M25',detail:'Heavy load'},{value:'M30',label:'M30',detail:'High rise'},{value:'M35',label:'M35',detail:'Bridges/special'}]}
                      hint="M20 is standard for residential" />
                    <OptionRow label="Cement Type" value={cfg.cementType} onChange={v => set('cementType', v)}
                      options={[{value:'OPC43',label:'OPC 43',detail:'Ordinary Portland Cement 43 grade'},{value:'OPC53',label:'OPC 53',detail:'High strength'},{value:'PPC',label:'PPC',detail:'Portland Pozzolana - better workability'},{value:'PSC',label:'PSC',detail:'Portland Slag - coastal areas'}]} />
                    <OptionRow label="Aggregate Size" value={cfg.aggregateSize} onChange={v => set('aggregateSize', v)}
                      options={[{value:'10mm',label:'10mm',detail:'Slabs & columns'},{value:'20mm',label:'20mm',detail:'Standard'},{value:'40mm',label:'40mm',detail:'Mass concrete'}]}
                      hint="20mm is most common" />
                  </>
                )}

                {step === 1 && (
                  <>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Masonry & Reinforcement</Typography>
                    <OptionRow label="Brick / Block Type" value={cfg.brickType} onChange={v => set('brickType', v)}
                      options={[{value:'clay',label:'Clay Brick',detail:'Traditional, good thermal mass'},{value:'AAC',label:'AAC Block',detail:'Lightweight, great insulation'},{value:'flyAsh',label:'Fly Ash',detail:'Eco-friendly, strong'},{value:'CLC',label:'CLC Block',detail:'Cellular lightweight'},{value:'wirecut',label:'Wire Cut',detail:'Machine made, uniform'}]} />
                    <OptionRow label="Wall Thickness" value={cfg.wallThickness} onChange={v => set('wallThickness', v)}
                      options={[{value:'4.5in',label:'4.5″',detail:'Partition walls'},{value:'9in',label:'9″',detail:'Standard load bearing'},{value:'13.5in',label:'13.5″',detail:'Heavy load'}]} />
                    <Divider sx={{ my: 1.5 }} /><Typography variant="caption" color="text.secondary" fontWeight={700}>REBAR (TMT STEEL)</Typography>
                    <OptionRow label="Rebar Grade" value={cfg.rebarGrade} onChange={v => set('rebarGrade', v)}
                      options={[{value:'Fe415',label:'Fe415',detail:'Min yield 415 MPa'},{value:'Fe500',label:'Fe500',detail:'Standard residential'},{value:'Fe550',label:'Fe550',detail:'High rise'},{value:'Fe600',label:'Fe600',detail:'Max strength'}]}
                      hint="Fe500 is the standard choice" />
                    <OptionRow label="Main Bars (dia)" value={cfg.rebarMainDia} onChange={v => set('rebarMainDia', v)}
                      options={[{value:'10mm',label:'10mm'},{value:'12mm',label:'12mm',detail:'Standard'},{value:'16mm',label:'16mm',detail:'Heavy beams'},{value:'20mm',label:'20mm',detail:'Columns'}]} />
                    <OptionRow label="Distribution Bars" value={cfg.rebarDistDia} onChange={v => set('rebarDistDia', v)}
                      options={[{value:'8mm',label:'8mm',detail:'Standard stirrups'},{value:'10mm',label:'10mm',detail:'Heavy shear'}]} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Roof Configuration</Typography>
                    <OptionRow label="Roof Type" value={cfg.roofType} onChange={v => set('roofType', v)}
                      options={[{value:'flat',label:'RCC Flat',detail:'Most common in India'},{value:'gable',label:'Gable',detail:'Triangular peak'},{value:'hip',label:'Hip',detail:'4-sided slope'},{value:'mansard',label:'Mansard',detail:'Double slope'},{value:'steelTruss',label:'Steel Truss',detail:'Industrial / large span'}]} />
                    <OptionRow label="Waterproofing" value={cfg.roofWaterproofing} onChange={v => set('roofWaterproofing', v)}
                      options={[{value:'none',label:'None'},{value:'bitumen',label:'Bitumen',detail:'Cost effective'},{value:'crystalline',label:'Crystalline',detail:'Penetrating, long life'},{value:'APP',label:'APP Membrane',detail:'APP modified bitumen'},{value:'polyurethane',label:'PU Coat',detail:'Premium, seamless'}]}
                      hint="Bitumen is standard. Skip for sloped roofs." />
                    <OptionRow label="Thermal Insulation" value={cfg.roofInsulation} onChange={v => set('roofInsulation', v)}
                      options={[{value:'none',label:'None'},{value:'mineralWool',label:'Min. Wool',detail:'Good sound + thermal'},{value:'XPS',label:'XPS Board',detail:'High R-value'},{value:'EPS',label:'EPS Board',detail:'Cost effective foam'}]} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Floor Finishes</Typography>
                    <OptionRow label="Ground Floor Finish" value={cfg.groundFloor} onChange={v => set('groundFloor', v)}
                      options={[{value:'vitrified',label:'Vitrified Tiles',detail:'600×600 double charge'},{value:'marble',label:'Marble',detail:'Italian/Indian marble'},{value:'granite',label:'Granite',detail:'Black/multi-colour'},{value:'hardwood',label:'Hardwood',detail:'Engineered wood flooring'},{value:'carpet',label:'Carpet',detail:'Luxury carpet tiles'},{value:'polishedConcrete',label:'Polished Conc.',detail:'Industrial look'}]} />
                    <OptionRow label="Upper Floor Finish" value={cfg.upperFloor} onChange={v => set('upperFloor', v)}
                      options={[{value:'vitrified',label:'Vitrified'},{value:'marble',label:'Marble'},{value:'granite',label:'Granite'},{value:'hardwood',label:'Hardwood'},{value:'carpet',label:'Carpet'}]} />
                  </>
                )}

                {step === 4 && (
                  <>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Ceiling Design</Typography>
                    <OptionRow label="Ceiling Type" value={cfg.ceilingType} onChange={v => set('ceilingType', v)}
                      options={[{value:'plaster',label:'Direct Plaster',detail:'Standard smooth plaster'},{value:'POP',label:'POP False Ceiling',detail:'Plaster of Paris with cove'},{value:'gypsum',label:'Gypsum Board',detail:'Clean modern look'},{value:'wooden',label:'Wooden Batten',detail:'Premium warm look'},{value:'exposed',label:'Exposed Concrete',detail:'Industrial / loft'},{value:'armstrong',label:'Armstrong Tile',detail:'Office / commercial style'}]} />
                    <OptionRow label="Floor-to-Ceiling Height" value={cfg.ceilingHeight} onChange={v => set('ceilingHeight', v)}
                      options={[{value:'8ft',label:"8'",detail:'Minimal'},{value:'9ft',label:"9'",detail:'Standard'},{value:'10ft',label:"10'",detail:'Spacious'},{value:'12ft',label:"12'",detail:'Grand / double height'}]}
                      hint="10ft is most popular for modern homes" />
                  </>
                )}

                {step === 5 && (
                  <>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>Exterior & Landscaping</Typography>
                    <OptionRow label="Garden / Landscape" value={cfg.gardenType} onChange={v => set('gardenType', v)}
                      options={[{value:'none',label:'None'},{value:'lawn',label:'Simple Lawn'},{value:'landscaped',label:'Landscaped',detail:'Shrubs, bushes, shaped beds'},{value:'premium',label:'Premium',detail:'Designer landscape with water features'}]} />
                    <OptionRow label="Boundary Wall" value={cfg.boundaryWall} onChange={v => set('boundaryWall', v)}
                      options={[{value:'none',label:'None'},{value:'brick',label:'Brick'},{value:'stone',label:'Stone'},{value:'RCC',label:'RCC'},{value:'composite',label:'Composite',detail:'Stone+metal combo'}]} />
                    <OptionRow label="Parking" value={cfg.parking} onChange={v => set('parking', v)}
                      options={[{value:'none',label:'None'},{value:'1car',label:'1 Car'},{value:'2car',label:'2 Cars'},{value:'3car',label:'3 Cars'}]} />
                    <OptionRow label="Pathway" value={cfg.pathway} onChange={v => set('pathway', v)}
                      options={[{value:'none',label:'None'},{value:'concrete',label:'Concrete'},{value:'tiles',label:'Tiles'},{value:'gravel',label:'Gravel'},{value:'naturalStone',label:'Natural Stone'}]} />
                    <Box mb={1.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>Trees & Plants</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Button size="small" variant="outlined" sx={{ minWidth: 28, p: 0.3 }} onClick={() => set('treesCount', Math.max(0, cfg.treesCount - 1))}>−</Button>
                        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>{cfg.treesCount}</Typography>
                        <Button size="small" variant="outlined" sx={{ minWidth: 28, p: 0.3 }} onClick={() => set('treesCount', Math.min(12, cfg.treesCount + 1))}>+</Button>
                        <Typography variant="caption" color="text.secondary">trees</Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label="Swimming Pool" clickable
                        color={cfg.hasPool ? 'primary' : 'default'} variant={cfg.hasPool ? 'filled' : 'outlined'}
                        onClick={() => set('hasPool', !cfg.hasPool)} sx={{ fontSize: '0.7rem', height: 24 }} />
                      <Chip size="small" label="Outdoor Lighting" clickable
                        color={cfg.outdoorLighting ? 'primary' : 'default'} variant={cfg.outdoorLighting ? 'filled' : 'outlined'}
                        onClick={() => set('outdoorLighting', !cfg.outdoorLighting)} sx={{ fontSize: '0.7rem', height: 24 }} />
                    </Stack>
                  </>
                )}

                {step === 6 && (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight={700}>Bill of Quantities</Typography>
                      <Tooltip title="Fetch server-computed cost for this location">
                        <Button size="small" variant="outlined" startIcon={costLoading ? <CircularProgress size={12} color="inherit" /> : <Calculate />}
                          onClick={fetchServerCost} disabled={costLoading} sx={{ fontSize: '0.68rem', py: 0.2 }}>
                          Server Estimate
                        </Button>
                      </Tooltip>
                    </Box>

                    {/* Cost summary */}
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(255,101,132,0.1))', mb: 1.5 }}>
                      <Typography variant="h5" fontWeight={800} color="primary">{fmt(totalCost)}</Typography>
                      <Typography variant="caption" color="text.secondary">Estimated total · {location ? `${location} rates` : 'standard rates'}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {fmt(Math.round(totalCost / (plotW * plotL * floors)))} per sq ft built-up area
                      </Typography>
                    </Box>

                    {serverCost && (
                      <Alert severity="info" sx={{ mb: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                        Server estimate: {fmt(serverCost.grandTotal)} (grand total with contingency)
                      </Alert>
                    )}

                    <Tabs value={boqTab} onChange={(_, v) => setBoqTab(v)} variant="scrollable" scrollButtons="auto"
                      sx={{ mb: 1, '& .MuiTab-root': { fontSize: '0.65rem', minWidth: 60, px: 1, py: 0.5 } }}>
                      {Object.keys(byCategory).map((cat, i) => <Tab key={cat} label={cat} value={i} />)}
                    </Tabs>

                    {Object.entries(byCategory).map(([cat, items], ci) =>
                      boqTab === ci ? (
                        <Box key={cat}>
                          <Table size="small" sx={{ '& td, & th': { fontSize: '0.68rem', py: 0.4, px: 0.8 } }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Rate</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {items.map((row, ri) => (
                                <TableRow key={ri} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                  <TableCell>
                                    <Typography variant="caption" display="block">{row.item}</Typography>
                                    {row.note && <Typography variant="caption" color="text.disabled" display="block">{row.note}</Typography>}
                                  </TableCell>
                                  <TableCell align="right">{row.qty} {row.unit}</TableCell>
                                  <TableCell align="right">{fmt(row.rate)}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(row.amount)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{fmt(items.reduce((s, i) => s + i.amount, 0))}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>
                      ) : null
                    )}
                  </>
                )}
              </Box>

              {/* Navigation */}
              <Box sx={{ px: 2, py: 1.2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button size="small" startIcon={<NavigateBefore />} onClick={handlePrev} disabled={step === 0} variant="outlined" sx={{ fontSize: '0.72rem' }}>Back</Button>
                <Typography variant="caption" color="text.secondary">{step + 1} / {STEPS.length}</Typography>
                {step < 6
                  ? <Button size="small" endIcon={<NavigateNext />} onClick={handleNext} variant="contained" sx={{ fontSize: '0.72rem', background: 'linear-gradient(135deg,#6C63FF,#8B85FF)' }}>Next</Button>
                  : <Button size="small" startIcon={<CheckCircle />} onClick={handleSave} variant="contained" disabled={saveLoading} sx={{ fontSize: '0.72rem', background: 'linear-gradient(135deg,#4caf50,#388e3c)' }}>
                    {saveLoading ? 'Saving…' : 'Save Config'}
                  </Button>
                }
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
