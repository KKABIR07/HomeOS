import api from './api'
import type { FloorPlan, FloorPlanElement } from '../types/floorplan'

export const floorplanService = {
  async getFloorPlans(projectId: string): Promise<FloorPlan[]> {
    const response = await api.get<{ floorPlans: FloorPlan[] }>(`/floorplans/project/${projectId}`)
    return response.data.floorPlans
  },

  async getFloorPlan(id: string): Promise<FloorPlan> {
    const response = await api.get<{ floorPlan: FloorPlan }>(`/floorplans/${id}`)
    return response.data.floorPlan
  },

  async createFloorPlan(projectId: string, data: Partial<FloorPlan>): Promise<FloorPlan> {
    const response = await api.post<{ floorPlan: FloorPlan }>('/floorplans', {
      projectId,
      ...data,
    })
    return response.data.floorPlan
  },

  async updateFloorPlan(id: string, data: Partial<FloorPlan>): Promise<FloorPlan> {
    const response = await api.put<{ floorPlan: FloorPlan }>(`/floorplans/${id}`, data)
    return response.data.floorPlan
  },

  async deleteFloorPlan(id: string): Promise<void> {
    await api.delete(`/floorplans/${id}`)
  },

  async addElement(floorPlanId: string, floor: number, element: Partial<FloorPlanElement>): Promise<FloorPlan> {
    const response = await api.post<{ floorPlan: FloorPlan }>(
      `/floorplans/${floorPlanId}/floors/${floor}/elements`,
      element,
    )
    return response.data.floorPlan
  },

  async updateElement(
    floorPlanId: string,
    floor: number,
    elementId: string,
    data: Partial<FloorPlanElement>,
  ): Promise<FloorPlan> {
    const response = await api.put<{ floorPlan: FloorPlan }>(
      `/floorplans/${floorPlanId}/floors/${floor}/elements/${elementId}`,
      data,
    )
    return response.data.floorPlan
  },

  async deleteElement(floorPlanId: string, floor: number, elementId: string): Promise<FloorPlan> {
    const response = await api.delete<{ floorPlan: FloorPlan }>(
      `/floorplans/${floorPlanId}/floors/${floor}/elements/${elementId}`,
    )
    return response.data.floorPlan
  },

  async exportFloorPlan(id: string, format: 'png' | 'pdf' | 'svg'): Promise<Blob> {
    const response = await api.get(`/floorplans/${id}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  async saveThumbnail(id: string, imageData: string): Promise<FloorPlan> {
    const response = await api.post<{ floorPlan: FloorPlan }>(`/floorplans/${id}/thumbnail`, {
      imageData,
    })
    return response.data.floorPlan
  },
}
