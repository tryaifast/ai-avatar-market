import { POST } from './route'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  DB: {
    User: {
      getByEmail: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
  compare: jest.fn(() => Promise.resolve(true)),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_token'),
}))

import { DB } from '@/lib/db'
import bcrypt from 'bcryptjs'

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth (register)', () => {
    it('should register new user successfully', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'both',
        identity: [],
      }

      ;(DB.User.getByEmail as jest.Mock).mockReturnValue(null)
      ;(DB.User.create as jest.Mock).mockReturnValue(mockUser)

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.token).toBe('mock_token')
      expect(data.user.email).toBe('test@example.com')
      expect(DB.User.create).toHaveBeenCalled()
    })

    it('should return 400 for existing user', async () => {
      ;(DB.User.getByEmail as jest.Mock).mockReturnValue({ id: 'existing' })

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth (login)', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'both',
      }

      ;(DB.User.getByEmail as jest.Mock).mockReturnValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.token).toBe('mock_token')
      expect(data.user.email).toBe('test@example.com')
    })

    it('should return 400 for invalid credentials', async () => {
      ;(DB.User.getByEmail as jest.Mock).mockReturnValue(null)

      const request = new Request('http://localhost/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: 'wrong@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request as any)
      expect(response.status).toBe(400)
    })
  })
})
