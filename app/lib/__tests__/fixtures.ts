import { User, Avatar, Order } from '@/app/lib/types'

export const mockUser: User = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed_password',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: new Date('2026-04-08'),
  updatedAt: new Date('2026-04-08'),
}

export const mockAvatar: Avatar = {
  id: 'avatar_123',
  name: 'Test Avatar',
  description: 'A test AI avatar',
  image: 'https://example.com/avatar.jpg',
  personality: 'Friendly and helpful',
  knowledge: ['general', 'tech'],
  price: 99,
  ownerId: 'user_123',
  isPublic: true,
  createdAt: new Date('2026-04-08'),
  updatedAt: new Date('2026-04-08'),
}

export const mockOrder: Order = {
  id: 'order_123',
  userId: 'user_123',
  avatarId: 'avatar_123',
  amount: 99,
  status: 'pending',
  createdAt: new Date('2026-04-08'),
  updatedAt: new Date('2026-04-08'),
}

export const mockJwtPayload = {
  userId: 'user_123',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}
