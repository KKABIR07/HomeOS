import api from './api'
import type {
  AIGenerateFloorPlanPayload,
  AIGenerateFloorPlanResponse,
  AIChatMessage,
} from '../types/floorplan'

export const aiService = {
  async generateFloorPlan(payload: AIGenerateFloorPlanPayload): Promise<AIGenerateFloorPlanResponse> {
    const response = await api.post<AIGenerateFloorPlanResponse>('/ai/generate-floorplan', payload)
    return response.data
  },

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    projectId?: string,
  ): Promise<{ message: AIChatMessage }> {
    const response = await api.post<{ message: AIChatMessage }>('/ai/chat', {
      messages,
      projectId,
    })
    return response.data
  },

  async generateInteriorDesign(params: {
    projectId: string
    roomType: string
    style: string
    budget: number
  }): Promise<{ suggestions: string[]; imageUrl: string | null }> {
    const response = await api.post('/ai/interior-design', params)
    return response.data
  },

  async estimateCost(params: {
    plotArea: number
    floors: number
    houseType: string
    quality: 'basic' | 'standard' | 'premium'
    location?: string
  }): Promise<{
    materials: Record<string, number>
    labor: Record<string, number>
    total: number
    breakdown: Array<{ label: string; amount: number; percentage: number }>
  }> {
    const response = await api.post('/ai/estimate-cost', params)
    return response.data
  },

  async getDesignRecommendations(projectId: string): Promise<{
    recommendations: string[]
    improvements: string[]
  }> {
    const response = await api.get(`/ai/recommendations/${projectId}`)
    return response.data
  },

  async analyzeFloorPlan(floorPlanId: string): Promise<{
    score: number
    issues: string[]
    suggestions: string[]
  }> {
    const response = await api.post('/ai/analyze-floorplan', { floorPlanId })
    return response.data
  },
}
