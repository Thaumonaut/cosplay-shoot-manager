import { NextRequest } from 'next/server'

// Mock the auth helper
jest.mock('@/lib/auth', () => ({
  getUserIdFromRequest: jest.fn(),
  getUserTeamId: jest.fn(),
}))

// Mock the storage layer
jest.mock('@/lib/storage', () => ({
  storage: {
    getUserProfile: jest.fn(),
    createUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
  }
}))

describe('Authentication API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const { GET } = await import('@/app/api/auth/me/route')
      const { getUserIdFromRequest } = require('@/lib/auth')
      const { storage } = require('@/lib/storage')
      
      getUserIdFromRequest.mockReturnValue('user-123')
      storage.getUserProfile.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('user-123')
      expect(data.email).toBe('test@example.com')
    })

    it('should return 401 when not authenticated', async () => {
      const { GET } = await import('@/app/api/auth/me/route')
      const { getUserIdFromRequest } = require('@/lib/auth')
      getUserIdFromRequest.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should create profile if user exists but no profile found', async () => {
      const { GET } = await import('@/app/api/auth/me/route')
      const { getUserIdFromRequest } = require('@/lib/auth')
      const { storage } = require('@/lib/storage')
      
      getUserIdFromRequest.mockReturnValue('user-123')
      storage.getUserProfile.mockResolvedValue(null)
      storage.createUserProfile.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/me')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(storage.createUserProfile).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/set-session', () => {
    it('should set session cookie with valid token', async () => {
      const { POST } = await import('@/app/api/auth/set-session/route')
      const request = new NextRequest('http://localhost:3000/api/auth/set-session', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-jwt-token' })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      // Check if Set-Cookie header is present
      expect(response.headers.get('Set-Cookie')).toBeTruthy()
    })

    it('should return 400 with invalid request body', async () => {
      const { POST } = await import('@/app/api/auth/set-session/route')
      const request = new NextRequest('http://localhost:3000/api/auth/set-session', {
        method: 'POST',
        body: JSON.stringify({}) // Missing token
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})