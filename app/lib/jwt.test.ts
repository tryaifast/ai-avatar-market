import { sign, verify } from './jwt'

describe('JWT', () => {
  const payload = { userId: 'user_123', email: 'test@example.com' }

  describe('sign', () => {
    it('should sign a payload and return token', () => {
      const token = sign(payload)
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include payload data in token', () => {
      const token = sign(payload)
      const decoded = verify(token)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
    })
  })

  describe('verify', () => {
    it('should verify valid token', () => {
      const token = sign(payload)
      const decoded = verify(token)
      expect(decoded).toMatchObject(payload)
    })

    it('should throw error for invalid token', () => {
      expect(() => verify('invalid.token.here')).toThrow()
    })
  })
})
