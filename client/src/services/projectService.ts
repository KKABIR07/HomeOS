import api from './api'
import type { Project, CreateProjectPayload, UpdateProjectPayload, ArchitectProfile } from '../types/project'

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const projectService = {
  async getProjects(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    sort?: string
  }): Promise<PaginatedResponse<Project>> {
    const response = await api.get('/projects', { params })
    const { projects, total, page, pages } = response.data
    return {
      data: projects ?? [],
      total: total ?? 0,
      page: page ?? 1,
      limit: params?.limit ?? 10,
      totalPages: pages ?? 1,
    }
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<{ project: Project }>(`/projects/${id}`)
    return response.data.project
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const response = await api.post<{ project: Project }>('/projects', payload)
    return response.data.project
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const response = await api.put<{ project: Project }>(`/projects/${id}`, payload)
    return response.data.project
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`)
  },

  async uploadProjectImage(id: string, file: File, type: 'thumbnail' | 'cover'): Promise<Project> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)
    const response = await api.post<{ project: Project }>(`/projects/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.project
  },

  async getPublicProjects(params?: { page?: number; limit?: number; style?: string }): Promise<PaginatedResponse<Project>> {
    const response = await api.get<PaginatedResponse<Project>>('/projects/public', { params })
    return response.data
  },

  async duplicateProject(id: string): Promise<Project> {
    const response = await api.post<{ project: Project }>(`/projects/${id}/duplicate`)
    return response.data.project
  },

  async addCollaborator(projectId: string, email: string, role: string): Promise<Project> {
    const response = await api.post<{ project: Project }>(`/projects/${projectId}/collaborators`, {
      email,
      role,
    })
    return response.data.project
  },

  async getArchitects(params?: {
    page?: number
    limit?: number
    specialization?: string
    location?: string
    minRating?: number
  }): Promise<PaginatedResponse<ArchitectProfile>> {
    const response = await api.get<PaginatedResponse<ArchitectProfile>>('/architects', { params })
    return response.data
  },

  async getArchitect(id: string): Promise<ArchitectProfile> {
    const response = await api.get<{ architect: ArchitectProfile }>(`/architects/${id}`)
    return response.data.architect
  },
}
