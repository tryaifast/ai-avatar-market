import { User, Avatar, Order } from '@/app/lib/types'

// In-memory mock storage
const mockStorage = {
  users: new Map<string, User>(),
  avatars: new Map<string, Avatar>(),
  orders: new Map<string, Order>(),
}

// Reset function for tests
export function __resetMockDb() {
  mockStorage.users.clear()
  mockStorage.avatars.clear()
  mockStorage.orders.clear()
}

// Mock database client
export const mockDbClient = {
  // User operations
  createUser: jest.fn(async (data: Partial<User>) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const user = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User
    mockStorage.users.set(id, user)
    return user
  }),

  findUserByEmail: jest.fn(async (email: string) => {
    for (const user of mockStorage.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }),

  findUserById: jest.fn(async (id: string) => {
    return mockStorage.users.get(id) || null
  }),

  // Avatar operations
  createAvatar: jest.fn(async (data: Partial<Avatar>) => {
    const id = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const avatar = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Avatar
    mockStorage.avatars.set(id, avatar)
    return avatar
  }),

  findAvatarById: jest.fn(async (id: string) => {
    return mockStorage.avatars.get(id) || null
  }),

  findAvatarsByOwner: jest.fn(async (ownerId: string) => {
    return Array.from(mockStorage.avatars.values()).filter(
      (avatar) => avatar.ownerId === ownerId
    )
  }),

  updateAvatar: jest.fn(async (id: string, data: Partial<Avatar>) => {
    const avatar = mockStorage.avatars.get(id)
    if (!avatar) return null
    const updated = { ...avatar, ...data, updatedAt: new Date() }
    mockStorage.avatars.set(id, updated)
    return updated
  }),

  deleteAvatar: jest.fn(async (id: string) => {
    return mockStorage.avatars.delete(id)
  }),

  // Order operations
  createOrder: jest.fn(async (data: Partial<Order>) => {
    const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const order = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order
    mockStorage.orders.set(id, order)
    return order
  }),

  findOrderById: jest.fn(async (id: string) => {
    return mockStorage.orders.get(id) || null
  }),
}

export default mockDbClient
