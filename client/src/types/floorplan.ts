export type ElementType =
  | 'wall'
  | 'door'
  | 'window'
  | 'room'
  | 'column'
  | 'stair'
  | 'bathroom'
  | 'kitchen'
  | 'bedroom'
  | 'living_room'
  | 'dining_room'
  | 'garage'
  | 'balcony'

export type RoomType =
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living_room'
  | 'dining_room'
  | 'garage'
  | 'balcony'
  | 'study'
  | 'storage'
  | 'laundry'
  | 'hallway'

export interface Point {
  x: number
  y: number
}

export interface Dimensions {
  width: number
  height: number
}

export interface FloorPlanElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  label: string
  color: string
  properties: Record<string, unknown>
}

export interface WallElement extends FloorPlanElement {
  type: 'wall'
  thickness: number
  startPoint: Point
  endPoint: Point
}

export interface RoomElement extends FloorPlanElement {
  type: 'room'
  roomType: RoomType
  area: number
  color: string
}

export interface FloorLevel {
  level: number
  name: string
  elements: FloorPlanElement[]
  height: number
}

export interface FloorPlanMeasurements {
  totalArea: number
  carpetArea: number
  rooms: { name: string; area: number }[]
}

export interface FloorPlan {
  id: string
  _id?: string
  projectId: string
  project?: string
  name: string
  floor?: number
  scale: number
  unit: 'ft' | 'm'
  gridSize: number
  totalArea: number
  elements?: FloorPlanElement[]
  floors: FloorLevel[]
  dimensions?: { width: number; height: number; scale: number }
  measurements?: FloorPlanMeasurements
  thumbnail: string | null
  isAIGenerated: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export interface AIGenerateFloorPlanPayload {
  projectId: string
  plotSize: number
  floors: number
  bedrooms: number
  bathrooms: number
  budget: number
  style: string
  additionalRequirements?: string
}

export interface AIGenerateFloorPlanResponse {
  floorPlan: FloorPlan
  description: string
  suggestedImprovements: string[]
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
