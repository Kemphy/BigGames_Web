import { apiClient } from "./api"

export type EventType = "VIEW_ROOM" | "CLICK_ROOM" | "BOOK_ROOM" | "RATE_ROOM"

export interface RecommendedRoom {
  room_id: string
  name: string
  category: "PS4" | "PS5" | "PC" | "VIP" | "REGULAR"
  capacity: number
  base_price_per_hour: number // Changed from string to number to match API
  avg_rating: number | null
  review_count: number
  similarity_score: number
  final_score: number
  reason: string
  image_url?: string
  description?: string
}

export interface RecommendationResponse {
  recommendations: RecommendedRoom[]
  is_cold_start: boolean
  user_event_count: number
}

export interface UserEvent {
  room_id: string
  event_type: EventType
  rating_value?: number
}

class AIService {
  async getRecommendations(params?: {
    limit?: number
    start?: string
    end?: string
  }): Promise<RecommendationResponse> {
    return apiClient.get<RecommendationResponse>('/api/ai/recommendations', params)
  }

  async logEvent(event: UserEvent): Promise<void> {
    try {
      await apiClient.post('/api/ai/events', event)
    } catch (error) {
      // Fail silently - don't block UI for event tracking
      console.error('[AI] Failed to log event:', error)
    }
  }

  // Admin methods
  async generateRoomEmbedding(roomId: string): Promise<any> {
    return apiClient.post(`/api/ai/embeddings/generate/${roomId}`)
  }

  async generateAllEmbeddings(): Promise<any> {
    return apiClient.post('/api/ai/embeddings/generate-all')
  }
}

export const aiService = new AIService()
