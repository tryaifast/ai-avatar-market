# AI Avatar Market 测试覆盖实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为AI Avatar Market项目添加完整的Jest + RTL测试覆盖，从0%提升至60%+

**Architecture:** 使用Jest + React Testing Library进行单元测试和集成测试，Mock数据层避免依赖真实数据库，按照TDD流程每个功能先写测试再实现

**Tech Stack:** Jest, React Testing Library, @next/jest, TypeScript, Playwright (E2E)

---

## 文件结构规划

### 新建文件
| 文件路径 | 用途 |
|----------|------|
| `jest.config.js` | Jest主配置 |
| `jest.setup.js` | 测试环境初始化 |
| `app/lib/__tests__/setup.ts` | 测试工具函数 |
| `app/lib/db/__mocks__/db.ts` | 数据库Mock |
| `app/lib/__tests__/fixtures.ts` | 测试数据fixtures |
| `app/lib/utils.test.ts` | 工具函数测试 |
| `app/lib/jwt.test.ts` | JWT测试 |
| `app/lib/db/index.test.ts` | 数据库层测试 |
| `app/components/Header.test.tsx` | Header组件测试 |
| `app/components/AvatarCard.test.tsx` | AvatarCard组件测试 |
| `app/api/auth/route.test.ts` | 认证API测试 |
| `app/api/avatars/route.test.ts` | 分身API测试 |

### 修改文件
| 文件路径 | 修改内容 |
|----------|----------|
| `package.json` | 添加test脚本和依赖 |
| `tsconfig.json` | 添加测试类型支持 |

---

## 第一阶段：测试基础设施 (Phase 1)

### Task 1.1: 添加测试依赖到package.json

**Files:**
- Modify: `D:\ai-avatar-market\package.json`

- [ ] **Step 1: 读取当前package.json**

```bash
cat D:\ai-avatar-market\package.json
```

- [ ] **Step 2: 添加测试脚本和devDependencies**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

修改`scripts`部分，添加`test`、`test:watch`、`test:e2e`三个脚本。

在`devDependencies`中添加上述依赖项（保留原有依赖）。

- [ ] **Step 3: 验证修改**

检查package.json中是否包含新的scripts和devDependencies。

- [ ] **Step 4: Commit**

```bash
cd D:\ai-avatar-market
git add package.json
git commit -m "chore: add jest and testing-library dependencies"
```

---

### Task 1.2: 创建Jest配置文件

**Files:**
- Create: `D:\ai-avatar-market\jest.config.js`

- [ ] **Step 1: 创建jest.config.js**

```javascript
const nextJest = require('@next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/layout.tsx',
    '!app/**/page.tsx',
    '!app/**/loading.tsx',
    '!app/**/error.tsx',
    '!app/**/route.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

- [ ] **Step 2: 验证配置语法**

```bash
cd D:\ai-avatar-market
node -c jest.config.js
```

Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add jest.config.js
git commit -m "chore: add jest configuration"
```

---

### Task 1.3: 创建测试环境初始化文件

**Files:**
- Create: `D:\ai-avatar-market\jest.setup.js`

- [ ] **Step 1: 创建jest.setup.js**

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: () => ({
    get: jest.fn(),
  }),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

// Global fetch mock
global.fetch = jest.fn()

// Console error suppression for expected errors
const originalConsoleError = console.error
console.error = (...args) => {
  // Suppress React act() warnings
  if (args[0]?.includes?.('Warning: An update to')) return
  if (args[0]?.includes?.('act(')) return
  originalConsoleError(...args)
}
```

- [ ] **Step 2: Commit**

```bash
git add jest.setup.js
git commit -m "chore: add jest setup file with mocks"
```

---

### Task 1.4: 创建测试Fixtures数据

**Files:**
- Create: `D:\ai-avatar-market\app\lib\__tests__\fixtures.ts`

- [ ] **Step 1: 创建fixtures.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/__tests__/fixtures.ts
git commit -m "chore: add test fixtures data"
```

---

### Task 1.5: 创建数据库Mock

**Files:**
- Create: `D:\ai-avatar-market\app\lib\db\__mocks__\db.ts`

- [ ] **Step 1: 创建Mock数据库**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/db/__mocks__/db.ts
git commit -m "chore: add mock database for testing"
```

---

### Task 1.6: 安装依赖并验证

**Files:**
- None (install dependencies)

- [ ] **Step 1: 安装依赖**

```bash
cd D:\ai-avatar-market
npm install
```

Expected: 安装成功，无错误

- [ ] **Step 2: 运行Jest帮助命令验证**

```bash
npx jest --help
```

Expected: 显示Jest帮助信息

- [ ] **Step 3: 创建测试文件验证**

创建 `D:\ai-avatar-market\app\lib\__tests__\sanity.test.ts`:

```typescript
describe('Test Infrastructure', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })

  it('should have jest-dom matchers', () => {
    expect(document.body).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: 运行测试**

```bash
npm test -- sanity.test.ts
```

Expected: 测试通过，显示 "PASS app/lib/__tests__/sanity.test.ts"

- [ ] **Step 5: 删除sanity测试并Commit**

```bash
rm app/lib/__tests__/sanity.test.ts
git add .
git commit -m "chore: verify test infrastructure working"
```

---

## 第二阶段：工具函数测试 (Phase 2)

### Task 2.1: 测试utils.ts - cn函数

**Files:**
- Create: `D:\ai-avatar-market\app\lib\utils.test.ts`

- [ ] **Step 1: 读取utils.ts内容**

```bash
cat D:\ai-avatar-market\app\lib\utils.ts
```

- [ ] **Step 2: 编写测试（预期失败）**

```typescript
import { cn } from './utils'

describe('cn', () => {
  it('should merge multiple class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should filter out falsy values', () => {
    expect(cn('class1', null, undefined, false, '', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
```

- [ ] **Step 3: 运行测试（应该失败）**

```bash
npm test -- utils.test.ts
```

Expected: 测试失败或找不到函数

- [ ] **Step 4: 检查并修正utils.ts**

如果`cn`函数不存在，需要创建它：

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 5: 运行测试（应该通过）**

```bash
npm test -- utils.test.ts
```

Expected: 所有测试通过

- [ ] **Step 6: Commit**

```bash
git add app/lib/utils.test.ts
git commit -m "test: add tests for cn utility function"
```

---

### Task 2.2: 测试JWT函数

**Files:**
- Create: `D:\ai-avatar-market\app\lib\jwt.test.ts`

- [ ] **Step 1: 读取jwt.ts内容**

```bash
cat D:\ai-avatar-market\app\lib\jwt.ts
```

- [ ] **Step 2: 编写JWT测试**

```typescript
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

    it('should throw error for expired token', () => {
      // Create expired token
      const expiredPayload = { ...payload, exp: Math.floor(Date.now() / 1000) - 1000 }
      const expiredToken = sign(expiredPayload)
      expect(() => verify(expiredToken)).toThrow()
    })
  })
})
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- jwt.test.ts
```

Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add app/lib/jwt.test.ts
git commit -m "test: add tests for JWT sign and verify functions"
```

---

## 第三阶段：组件测试 (Phase 3)

### Task 3.1: 测试Header组件

**Files:**
- Create: `D:\ai-avatar-market\app\components\Header.test.tsx`

- [ ] **Step 1: 读取Header组件**

```bash
cat D:\ai-avatar-market\app\components\Header.tsx
```

- [ ] **Step 2: 编写Header组件测试**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './Header'
import { useAuth } from '@/app/hooks/useAuth'

// Mock useAuth hook
jest.mock('@/app/hooks/useAuth')

describe('Header', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render logo and navigation', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('AI Avatar Market')).toBeInTheDocument()
    expect(screen.getByText('探索')).toBeInTheDocument()
    expect(screen.getByText('创建')).toBeInTheDocument()
  })

  it('should show login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<Header />)
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  it('should show user avatar when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', avatar: '/avatar.jpg' },
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    render(<Header />)
    expect(screen.getByAltText('Test User')).toBeInTheDocument()
  })

  it('should call logout when logout button clicked', () => {
    const mockLogout = jest.fn()
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', avatar: '/avatar.jpg' },
      isLoading: false,
      login: jest.fn(),
      logout: mockLogout,
    })

    render(<Header />)
    
    // Open user menu
    fireEvent.click(screen.getByAltText('Test User'))
    // Click logout
    fireEvent.click(screen.getByText('退出登录'))
    
    expect(mockLogout).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- Header.test.tsx
```

Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add app/components/Header.test.tsx
git commit -m "test: add tests for Header component"
```

---

### Task 3.2: 测试AvatarCard组件

**Files:**
- Create: `D:\ai-avatar-market\app\components\AvatarCard.test.tsx`

- [ ] **Step 1: 读取AvatarCard组件**

```bash
cat D:\ai-avatar-market\app\components\AvatarCard.tsx
```

- [ ] **Step 2: 编写AvatarCard组件测试**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { AvatarCard } from './AvatarCard'
import { mockAvatar } from '@/app/lib/__tests__/fixtures'

describe('AvatarCard', () => {
  it('should render avatar information', () => {
    render(<AvatarCard avatar={mockAvatar} />)
    
    expect(screen.getByText(mockAvatar.name)).toBeInTheDocument()
    expect(screen.getByText(mockAvatar.description)).toBeInTheDocument()
    expect(screen.getByText(`¥${mockAvatar.price}`)).toBeInTheDocument()
  })

  it('should render avatar image', () => {
    render(<AvatarCard avatar={mockAvatar} />)
    
    const image = screen.getByAltText(mockAvatar.name)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockAvatar.image)
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<AvatarCard avatar={mockAvatar} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockAvatar.id)
  })

  it('should show public badge when avatar is public', () => {
    render(<AvatarCard avatar={{ ...mockAvatar, isPublic: true }} />)
    expect(screen.getByText('公开')).toBeInTheDocument()
  })

  it('should show private badge when avatar is not public', () => {
    render(<AvatarCard avatar={{ ...mockAvatar, isPublic: false }} />)
    expect(screen.getByText('私有')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- AvatarCard.test.tsx
```

Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add app/components/AvatarCard.test.tsx
git commit -m "test: add tests for AvatarCard component"
```

---

## 第四阶段：API路由测试 (Phase 4)

### Task 4.1: 测试认证API

**Files:**
- Create: `D:\ai-avatar-market\app\api\auth\route.test.ts`

- [ ] **Step 1: 读取auth路由**

```bash
cat D:\ai-avatar-market\app\api\auth\route.ts
```

- [ ] **Step 2: 编写API测试**

```typescript
import { POST } from './route'
import { mockDbClient, __resetMockDb } from '@/app/lib/db/__mocks__/db'

// Mock the database
jest.mock('@/app/lib/db', () => mockDbClient)

describe('Auth API', () => {
  beforeEach(() => {
    __resetMockDb()
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.email).toBe('newuser@example.com')
      expect(data.user.name).toBe('New User')
      expect(data.token).toBeDefined()
      expect(data.user.password).toBeUndefined() // Password should not be returned
    })

    it('should return 409 for existing email', async () => {
      // First create a user
      await mockDbClient.createUser({
        email: 'existing@example.com',
        password: 'hashedpassword',
        name: 'Existing User',
      })

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
    })

    it('should return 400 for invalid data', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create user first
      await mockDbClient.createUser({
        email: 'user@example.com',
        password: await hashPassword('correctpassword'),
        name: 'Test User',
      })

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'correctpassword',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.email).toBe('user@example.com')
      expect(data.token).toBeDefined()
    })

    it('should return 401 for invalid credentials', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'wrongpassword',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })
  })
})
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- route.test.ts
```

Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/route.test.ts
git commit -m "test: add tests for auth API routes"
```

---

### Task 4.2: 测试Avatars API

**Files:**
- Create: `D:\ai-avatar-market\app\api\avatars\route.test.ts`

- [ ] **Step 1: 读取avatars路由**

```bash
cat D:\ai-avatar-market\app\api\avatars\route.ts
```

- [ ] **Step 2: 编写avatars API测试**

```typescript
import { GET, POST } from './route'
import { mockDbClient, __resetMockDb } from '@/app/lib/db/__mocks__/db'
import { mockAvatar, mockUser } from '@/app/lib/__tests__/fixtures'

jest.mock('@/app/lib/db', () => mockDbClient)

describe('Avatars API', () => {
  beforeEach(() => {
    __resetMockDb()
    jest.clearAllMocks()
  })

  describe('GET /api/avatars', () => {
    it('should return list of public avatars', async () => {
      // Create test avatars
      await mockDbClient.createAvatar({ ...mockAvatar, isPublic: true })
      await mockDbClient.createAvatar({ ...mockAvatar, name: 'Private Avatar', isPublic: false })

      const request = new Request('http://localhost/api/avatars')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.avatars)).toBe(true)
    })

    it('should filter by owner when query param provided', async () => {
      await mockDbClient.createAvatar({ ...mockAvatar, ownerId: 'user_123' })
      await mockDbClient.createAvatar({ ...mockAvatar, ownerId: 'user_456' })

      const request = new Request('http://localhost/api/avatars?ownerId=user_123')
      const response = await GET(request)
      const data = await response.json()

      expect(data.avatars.every((a: any) => a.ownerId === 'user_123')).toBe(true)
    })
  })

  describe('POST /api/avatars', () => {
    it('should create new avatar when authenticated', async () => {
      const request = new Request('http://localhost/api/avatars', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_token',
        },
        body: JSON.stringify({
          name: 'New Avatar',
          description: 'Test description',
          personality: 'Friendly',
          price: 99,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.avatar.name).toBe('New Avatar')
      expect(data.avatar.id).toBeDefined()
    })

    it('should return 401 when not authenticated', async () => {
      const request = new Request('http://localhost/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Avatar' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 for invalid data', async () => {
      const request = new Request('http://localhost/api/avatars', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_token',
        },
        body: JSON.stringify({
          // Missing required fields
          description: 'Test',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- app/api/avatars/route.test.ts
```

Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add app/api/avatars/route.test.ts
git commit -m "test: add tests for avatars API routes"
```

---

## 第五阶段：覆盖率验证 (Phase 5)

### Task 5.1: 运行完整测试套件

**Files:**
- All test files

- [ ] **Step 1: 运行所有测试**

```bash
cd D:\ai-avatar-market
npm test
```

Expected: 所有测试通过，显示覆盖率报告

- [ ] **Step 2: 验证覆盖率阈值**

检查覆盖率报告是否满足：
- Statements: ≥60%
- Branches: ≥60%
- Functions: ≥60%
- Lines: ≥60%

- [ ] **Step 3: 如果覆盖率不足，添加补充测试**

针对未覆盖的代码路径添加测试用例。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: achieve 60%+ test coverage"
```

---

### Task 5.2: 创建测试文档

**Files:**
- Create: `D:\ai-avatar-market\docs\TESTING.md`

- [ ] **Step 1: 创建测试文档**

```markdown
# 测试文档

## 运行测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm test -- --coverage

# 运行特定测试文件
npm test -- utils.test.ts

# 运行E2E测试
npm run test:e2e
```

## 测试结构

```
app/
├── lib/
│   ├── utils.test.ts
│   ├── jwt.test.ts
│   └── db/
│       └── __mocks__/
│           └── db.ts
├── components/
│   ├── Header.test.tsx
│   └── AvatarCard.test.tsx
└── api/
    ├── auth/
    │   └── route.test.ts
    └── avatars/
        └── route.test.ts
```

## 编写测试

### 单元测试示例

```typescript
import { cn } from './utils'

describe('cn', () => {
  it('should merge classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })
})
```

### 组件测试示例

```typescript
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('should render', () => {
    render(<Header />)
    expect(screen.getByText('AI Avatar Market')).toBeInTheDocument()
  })
})
```

### API测试示例

```typescript
import { POST } from './route'

describe('Auth API', () => {
  it('should create user', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'pass' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

## TDD流程

1. **RED**: 编写失败的测试
2. **GREEN**: 编写最简代码让测试通过
3. **REFACTOR**: 重构，保持测试通过

## Mock数据

测试使用 `app/lib/db/__mocks__/db.ts` 中的Mock数据库，避免依赖真实数据。
```

- [ ] **Step 2: Commit**

```bash
git add docs/TESTING.md
git commit -m "docs: add testing documentation"
```

---

## 任务清单总结

### Phase 1: 基础设施
- [ ] Task 1.1: 添加测试依赖
- [ ] Task 1.2: 创建Jest配置
- [ ] Task 1.3: 创建测试环境初始化
- [ ] Task 1.4: 创建Fixtures数据
- [ ] Task 1.5: 创建数据库Mock
- [ ] Task 1.6: 安装依赖并验证

### Phase 2: 工具函数测试
- [ ] Task 2.1: 测试utils.ts
- [ ] Task 2.2: 测试JWT函数

### Phase 3: 组件测试
- [ ] Task 3.1: 测试Header组件
- [ ] Task 3.2: 测试AvatarCard组件

### Phase 4: API测试
- [ ] Task 4.1: 测试认证API
- [ ] Task 4.2: 测试Avatars API

### Phase 5: 验证与文档
- [ ] Task 5.1: 运行完整测试套件
- [ ] Task 5.2: 创建测试文档

---

## 成功标准

- [ ] `npm test` 所有测试通过
- [ ] 代码覆盖率 ≥60%
- [ ] 至少15个测试用例
- [ ] 测试文档完整
- [ ] 所有测试使用Mock数据，不依赖真实数据库

---

## 注意事项

1. **TDD原则**: 每个任务严格按照RED-GREEN-REFACTOR流程
2. **提交频率**: 每个任务完成后立即提交
3. **测试隔离**: 每个测试独立运行，不依赖其他测试状态
4. **Mock使用**: 始终使用Mock数据库，避免副作用
