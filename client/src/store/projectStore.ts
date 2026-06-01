import { create } from 'zustand'
import type { Project } from '../types/project'
import type { FloorPlan } from '../types/floorplan'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  currentFloorPlan: FloorPlan | null
  isLoading: boolean
  error: string | null
  totalProjects: number
  currentPage: number
  searchQuery: string
  statusFilter: string

  setProjects: (projects: Project[], total?: number) => void
  setCurrentProject: (project: Project | null) => void
  setCurrentFloorPlan: (floorPlan: FloorPlan | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPage: (page: number) => void
  setSearch: (query: string) => void
  setStatusFilter: (status: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  currentFloorPlan: null,
  isLoading: false,
  error: null,
  totalProjects: 0,
  currentPage: 1,
  searchQuery: '',
  statusFilter: '',

  setProjects: (projects: Project[], total?: number) =>
    set({ projects, totalProjects: total ?? projects.length }),

  setCurrentProject: (project: Project | null) => set({ currentProject: project }),

  setCurrentFloorPlan: (floorPlan: FloorPlan | null) => set({ currentFloorPlan: floorPlan }),

  addProject: (project: Project) =>
    set((state) => ({
      projects: [project, ...state.projects],
      totalProjects: state.totalProjects + 1,
    })),

  updateProject: (id: string, data: Partial<Project>) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id || p._id === id ? { ...p, ...data } : p,
      ),
      currentProject:
        state.currentProject?.id === id || state.currentProject?._id === id
          ? { ...state.currentProject, ...data }
          : state.currentProject,
    })),

  removeProject: (id: string) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id && p._id !== id),
      totalProjects: Math.max(0, state.totalProjects - 1),
    })),

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setPage: (currentPage: number) => set({ currentPage }),
  setSearch: (searchQuery: string) => set({ searchQuery }),
  setStatusFilter: (statusFilter: string) => set({ statusFilter }),
}))
