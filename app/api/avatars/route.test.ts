import { GET, POST } from './route'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  DB: {
    Avatar: {
      getActive: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
    },
    User: {
      getById: jest.fn(),
      getAll: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyAuth: jest.fn(),
}))

import { DB } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

describe('Avatars API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/avatars', () => {
    it('should return list of active avatars', async () => {
      const mockAvatars = [
        { id: 'avatar_1', name: 'Avatar 1', creatorId: 'user_1' },
        { id: 'avatar_2', name: 'Avatar 2', creatorId: 'user_2' },
      ]
      const mockCreator = { id: 'user_1', name: 'Creator 1', avatar: '', identity: [] }

      ;(DB.Avatar.getActive as jest.Mock).mockReturnValue(mockAvatars)
      ;(DB.User.getById as jest.Mock).mockReturnValue(mockCreator)

      const request = new Request('http://localhost/api/avatars')
      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.avatars).toHaveLength(2)
      expect(DB.Avatar.getActive).toHaveBeenCalled()
    })

    it('should filter by query parameter', async () => {
      const mockAvatars = [{ id: 'avatar_1', name: 'Test Avatar', creatorId: 'user_1' }]

      ;(DB.Avatar.search as jest.Mock).mockReturnValue(mockAvatars)
      ;(DB.User.getById as jest.Mock).mockReturnValue({ id: 'user_1', name: 'Creator', avatar: '', identity: [] })

      const request = new Request('http://localhost/api/avatars?q=test')
      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(DB.Avatar.search).toHaveBeenCalledWith('test')
    })
  })

  describe('POST /api/avatars', () => {
    it('should create avatar when authenticated', async () => {
      const mockAuth = { userId: 'user_123', email: 'test@example.com' }
      const mockAvatar = {
        id: 'avatar_123',
        name: 'New Avatar',
        creatorId: 'user_123',
        status: 'active',
      }

      ;(verifyAuth as jest.Mock).mockResolvedValue(mockAuth)
      ;(DB.Avatar.create as jest.Mock).mockReturnValue(mockAvatar)

      const request = new Request('http://localhost/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Avatar',
          description: 'Test description',
          price: 99,
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.avatar.name).toBe('New Avatar')
      expect(DB.Avatar.create).toHaveBeenCalled()
    })

    it('should return 401 when not authenticated', async () => {
      ;(verifyAuth as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Avatar' }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(401)
    })
  })
})
