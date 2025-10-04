// API client utilities for making authenticated requests to the Next.js API

export interface ApiError {
  error: string | string[]
  status?: number
}

export class ApiClientError extends Error {
  status: number
  details: any

  constructor(message: string, status: number, details?: any) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

export interface ApiClientConfig {
  baseUrl?: string
  token?: string
}

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api'
    if (config.token) {
      this.token = config.token
    }
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: {
      body?: any
      headers?: Record<string, string>
      params?: Record<string, string>
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin)
    
    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authentication header if token is available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    // Add body for non-GET requests
    if (options.body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url.toString(), fetchOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new ApiClientError(
          data.error || 'Request failed',
          response.status,
          data
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('POST', '/auth', {
      body: { email, password },
    })
  }

  async logout() {
    return this.request('POST', '/auth/signout')
  }

  // User endpoints
  async getUser() {
    return this.request('GET', '/user')
  }

  async getUserProfile() {
    return this.request('GET', '/user/profile')
  }

  async updateUserProfile(profile: any) {
    return this.request('POST', '/user/profile', { body: profile })
  }

  // Team endpoints
  async getTeam() {
    return this.request('GET', '/team')
  }

  async createTeam(name: string) {
    return this.request('POST', '/team', { body: { name } })
  }

  async updateTeam(name: string) {
    return this.request('PATCH', '/team', { body: { name } })
  }

  async deleteTeam() {
    return this.request('DELETE', '/team')
  }

  // Shoot endpoints
  async getShoots() {
    return this.request('GET', '/shoots')
  }

  async getShoot(id: string) {
    return this.request('GET', `/shoots/${id}`)
  }

  async createShoot(shoot: any) {
    return this.request('POST', '/shoots', { body: shoot })
  }

  async updateShoot(id: string, updates: any) {
    return this.request('PATCH', `/shoots/${id}`, { body: updates })
  }

  async deleteShoot(id: string) {
    return this.request('DELETE', `/shoots/${id}`)
  }

  // Shoot participants
  async getShootParticipants(shootId: string) {
    return this.request('GET', `/shoots/${shootId}/participants`)
  }

  async createShootParticipant(shootId: string, participant: any) {
    return this.request('POST', `/shoots/${shootId}/participants`, { body: participant })
  }

  async updateShootParticipant(shootId: string, participantId: string, updates: any) {
    return this.request('PATCH', `/shoots/${shootId}/participants/${participantId}`, { body: updates })
  }

  async deleteShootParticipant(shootId: string, participantId: string) {
    return this.request('DELETE', `/shoots/${shootId}/participants/${participantId}`)
  }

  // Shoot references
  async getShootReferences(shootId: string) {
    return this.request('GET', `/shoots/${shootId}/references`)
  }

  async createShootReference(shootId: string, reference: any) {
    return this.request('POST', `/shoots/${shootId}/references`, { body: reference })
  }

  async updateShootReference(shootId: string, referenceId: string, updates: any) {
    return this.request('PATCH', `/shoots/${shootId}/references/${referenceId}`, { body: updates })
  }

  async deleteShootReference(shootId: string, referenceId: string) {
    return this.request('DELETE', `/shoots/${shootId}/references/${referenceId}`)
  }

  // Resource management endpoints
  async getEquipment() {
    return this.request('GET', '/equipment')
  }

  async getCostumes() {
    return this.request('GET', '/costumes')
  }

  async getPlaces() {
    return this.request('GET', '/places')
  }

  async getPersonnel() {
    return this.request('GET', '/personnel')
  }
}

// Create a default instance
export const apiClient = new ApiClient()