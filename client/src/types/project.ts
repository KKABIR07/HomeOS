export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'archived'
export type HouseType = 'residential' | 'commercial' | 'industrial' | 'mixed'
export type DesignStyle =
  | 'modern'
  | 'contemporary'
  | 'traditional'
  | 'minimalist'
  | 'industrial'
  | 'mediterranean'
  | 'colonial'
  | 'craftsman'

export interface ProjectCollaborator {
  userId: string
  role: 'viewer' | 'editor' | 'owner'
  addedAt: string
}

export interface ProjectCostEstimate {
  materials: number
  labor: number
  permits: number
  total: number
  currency: string
}

export interface ProjectTags {
  label: string
  color: string
}

export interface ProjectBoundary {
  corners: [number, number][]
  area: number
  perimeter: number
}

export interface Project {
  id: string
  _id: string
  title: string
  projectName: string
  description: string
  status: ProjectStatus
  houseType: HouseType
  style: DesignStyle
  floors: number
  bedrooms: number
  bathrooms: number
  plotArea: number
  builtArea: number
  location: string
  budget: number
  currency: string
  thumbnail: string | null
  coverImage: string | null
  ownerId: string
  owner?: { _id: string; name: string; avatar?: string; email?: string }
  houseStyle?: string
  plotWidth?: number
  plotLength?: number
  shareToken?: string
  isShared?: boolean
  views?: number
  collaborators: ProjectCollaborator[]
  costEstimate: ProjectCostEstimate | null
  tags: ProjectTag[]
  isPublic: boolean
  isArchived: boolean
  completionPercentage: number
  createdAt: string
  updatedAt: string
  boundary?: ProjectBoundary | null
}

export interface ProjectTag {
  label: string
  color: string
}

export interface CreateProjectPayload {
  title: string
  description: string
  houseType: HouseType
  style: DesignStyle
  floors: number
  bedrooms: number
  bathrooms: number
  plotArea: number
  location: string
  budget: number
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  status?: ProjectStatus
  isPublic?: boolean
}

export interface ArchitectProfile {
  id: string
  userId: string
  name: string
  avatar: string | null
  specialization: string[]
  experience: number
  rating: number
  reviewCount: number
  projectCount: number
  location: string
  hourlyRate: number
  currency: string
  bio: string
  portfolio: PortfolioItem[]
  available: boolean
  skills: string[]
}

export interface PortfolioItem {
  id: string
  title: string
  image: string
  style: DesignStyle
  description: string
}
