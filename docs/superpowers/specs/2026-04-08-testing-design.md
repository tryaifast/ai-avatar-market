# AI Avatar Market 测试覆盖设计方案

> **Design for:** 全面测试覆盖  
> **Date:** 2026-04-08  
> **Framework:** Jest + React Testing Library  
> **Target:** 0% → 70%+ 测试覆盖率

---

## 1. 项目现状分析

### 1.1 当前问题
- **测试覆盖率：0%** - 完全没有测试文件
- **package.json** 缺少测试脚本
- **技术债务** - 现有代码未按TDD开发，存在测试盲区

### 1.2 项目结构
```
app/
├── api/              # API路由
│   ├── auth/         # 认证相关
│   ├── avatars/      # AI分身CRUD
│   ├── orders/       # 订单系统
│   └── users/        # 用户管理
├── components/       # React组件
├── hooks/            # 自定义hooks
├── lib/              # 工具函数
│   ├── db/           # 数据层
│   ├── jwt.ts        # JWT处理
│   └── utils.ts      # 工具函数
└── types/            # 类型定义
```

---

## 2. 测试架构设计

### 2.1 测试金字塔

```
        /\         E2E测试 (Playwright)
       /  \        - 关键用户流程
      /____\       占比: 10%
     /      \
    /________\     集成测试
   /          \    - API路由测试
  /____________\   - 组件集成测试
 /              \  占比: 30%
/________________\
                   单元测试
                   - 工具函数
                   - Hooks
                   - 纯组件
                   占比: 60%
```

### 2.2 文件命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 单元测试 | `*.test.ts` | `utils.test.ts` |
| 组件测试 | `*.test.tsx` | `AvatarCard.test.tsx` |
| API测试 | `route.test.ts` | `app/api/auth/route.test.ts` |
| Mock文件 | `__mocks__/*.ts` | `__mocks__/db.ts` |

### 2.3 目录结构

```
app/
├── api/
│   └── auth/
│       ├── route.ts
│       └── route.test.ts          # API测试（同级）
├── components/
│   └── AvatarCard.tsx
│   └── AvatarCard.test.tsx        # 组件测试（同级）
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts              # 工具测试（同级）
│   ├── jwt.ts
│   ├── jwt.test.ts
│   ├── db/
│   │   ├── index.ts
│   │   ├── index.test.ts
│   │   └── __mocks__/
│   │       └── db.ts              # Mock数据
│   └── __tests__/
│       └── setup.ts               # 测试配置
├── e2e/
│   └── auth.spec.ts               # E2E测试
└── jest.config.js                 # Jest配置
```

---

## 3. 测试框架配置

### 3.1 依赖清单

```bash
# 核心测试框架
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Next.js Jest配置
npm install --save-dev @next/jest

# 模拟工具
npm install --save-dev jest-mock

# TypeScript支持
npm install --save-dev @types/jest ts-jest

# E2E测试 (Playwright)
npm install --save-dev @playwright/test
```

### 3.2 Jest配置 (jest.config.js)

```javascript
const nextJest = require('@next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/app/lib/__tests__/setup.ts'],
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
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 3.3 测试环境配置 (app/lib/__tests__/setup.ts)

```typescript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock fetch globally
global.fetch = jest.fn()
```

---

## 4. 测试覆盖计划

### 4.1 第一阶段：基础设施 (2小时)

| 任务 | 文件 | 说明 |
|------|------|------|
| 1.1 | 安装依赖 | Jest + RTL + Playwright |
| 1.2 | `jest.config.js` | Jest配置文件 |
| 1.3 | `app/lib/__tests__/setup.ts` | 测试环境初始化 |
| 1.4 | `package.json` | 添加test脚本 |
| 1.5 | Mock数据层 | `app/lib/db/__mocks__/db.ts` |

### 4.2 第二阶段：工具函数单元测试 (2小时)

| 任务 | 目标文件 | 测试文件 | 测试点 |
|------|----------|----------|--------|
| 2.1 | `lib/utils.ts` | `utils.test.ts` | cn函数、日期格式化 |
| 2.2 | `lib/jwt.ts` | `jwt.test.ts` | sign/verify、错误处理 |
| 2.3 | `lib/db/index.ts` | `db/index.test.ts` | CRUD操作、错误处理 |

### 4.3 第三阶段：组件单元测试 (4小时)

| 任务 | 目标组件 | 测试文件 | 测试点 |
|------|----------|----------|--------|
| 3.1 | `Header.tsx` | `Header.test.tsx` | 渲染、导航、登录状态 |
| 3.2 | `AvatarCard.tsx` | `AvatarCard.test.tsx` | 渲染、点击、props传递 |
| 3.3 | `AuthProvider.tsx` | `AuthProvider.test.tsx` | Context、状态管理 |
| 3.4 | `LoginForm.tsx` | `LoginForm.test.tsx` | 表单验证、提交 |

### 4.4 第四阶段：API路由集成测试 (3小时)

| 任务 | 目标API | 测试文件 | 测试点 |
|------|---------|----------|--------|
| 4.1 | `api/auth/route.ts` | `auth/route.test.ts` | 注册、登录、JWT验证 |
| 4.2 | `api/avatars/route.ts` | `avatars/route.test.ts` | CRUD、权限检查 |
| 4.3 | `api/orders/route.ts` | `orders/route.test.ts` | 创建订单、支付状态 |

### 4.5 第五阶段：E2E测试 (2小时)

| 任务 | 测试文件 | 测试场景 |
|------|----------|----------|
| 5.1 | `e2e/auth.spec.ts` | 用户注册→登录→退出完整流程 |
| 5.2 | `e2e/avatar.spec.ts` | 创建分身→编辑→删除流程 |

---

## 5. 测试数据策略 (Mock-based)

### 5.1 数据库Mock (app/lib/db/__mocks__/db.ts)

```typescript
import { User, Avatar, Order } from '@/app/lib/types'

// Mock数据存储
const mockDb = {
  users: [] as User[],
  avatars: [] as Avatar[],
  orders: [] as Order[],
}

export const mockDbClient = {
  // 用户操作
  createUser: jest.fn(async (data: Partial<User>) => {
    const user = { ...data, id: `user_${Date.now()}` } as User
    mockDb.users.push(user)
    return user
  }),
  
  findUserByEmail: jest.fn(async (email: string) => {
    return mockDb.users.find(u => u.email === email) || null
  }),
  
  // 分身操作
  createAvatar: jest.fn(async (data: Partial<Avatar>) => {
    const avatar = { ...data, id: `avatar_${Date.now()}` } as Avatar
    mockDb.avatars.push(avatar)
    return avatar
  }),
  
  findAvatarById: jest.fn(async (id: string) => {
    return mockDb.avatars.find(a => a.id === id) || null
  }),
  
  // 重置Mock数据
  __reset: () => {
    mockDb.users = []
    mockDb.avatars = []
    mockDb.orders = []
  },
}
```

### 5.2 JWT Mock

```typescript
// 使用真实JWT但缩短有效期
export const mockJwt = {
  sign: (payload: object) => jwt.sign(payload, 'test-secret', { expiresIn: '1h' }),
  verify: (token: string) => jwt.verify(token, 'test-secret'),
}
```

---

## 6. 测试示例

### 6.1 工具函数测试示例

```typescript
// lib/utils.test.ts
import { cn, formatDate } from './utils'

describe('cn', () => {
  it('应该合并多个className', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })
  
  it('应该过滤掉falsy值', () => {
    expect(cn('class1', null, undefined, 'class2')).toBe('class1 class2')
  })
  
  it('应该处理条件class', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })
})

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = new Date('2026-04-08')
    expect(formatDate(date)).toBe('2026-04-08')
  })
})
```

### 6.2 组件测试示例

```typescript
// components/AvatarCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AvatarCard } from './AvatarCard'
import { mockAvatar } from '@/app/lib/__tests__/fixtures'

describe('AvatarCard', () => {
  it('应该渲染分身信息', () => {
    render(<AvatarCard avatar={mockAvatar} />)
    
    expect(screen.getByText(mockAvatar.name)).toBeInTheDocument()
    expect(screen.getByText(mockAvatar.description)).toBeInTheDocument()
  })
  
  it('点击卡片应该触发onClick', () => {
    const handleClick = jest.fn()
    render(<AvatarCard avatar={mockAvatar} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockAvatar.id)
  })
})
```

### 6.3 API测试示例

```typescript
// api/auth/route.test.ts
import { POST } from './route'
import { mockDbClient } from '@/app/lib/db/__mocks__/db'

jest.mock('@/app/lib/db', () => mockDbClient)

describe('Auth API', () => {
  beforeEach(() => {
    mockDbClient.__reset()
  })
  
  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.user.email).toBe('test@example.com')
      expect(data.token).toBeDefined()
    })
    
    it('应该拒绝已存在的邮箱', async () => {
      // 先创建一个用户
      await mockDbClient.createUser({
        email: 'test@example.com',
        password: 'hashed',
      })
      
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
      
      const response = await POST(request)
      expect(response.status).toBe(409)
    })
  })
})
```

---

## 7. 运行命令

```bash
# 运行所有测试
npm test

# 运行特定文件
npm test -- utils.test.ts

# 监视模式
npm test -- --watch

# 生成覆盖率报告
npm test -- --coverage

# 运行E2E测试
npm run test:e2e
```

---

## 8. 成功标准

| 指标 | 目标 | 验证方式 |
|------|------|----------|
| 测试覆盖率 | ≥60% | `npm test -- --coverage` |
| 单元测试数量 | ≥20个 | 统计 `*.test.ts` 文件 |
| API测试数量 | ≥3个路由 | `app/api/**/route.test.ts` |
| E2E测试数量 | ≥2个场景 | `e2e/*.spec.ts` |
| 所有测试通过 | 100% | `npm test` 无失败 |

---

## 9. 风险与应对

| 风险 | 可能性 | 应对措施 |
|------|--------|----------|
| 现有代码难以测试 | 高 | 优先测试独立函数，重构耦合代码 |
| Mock复杂度太高 | 中 | 简化Mock，只模拟必要行为 |
| 测试运行慢 | 低 | 使用并行执行，分离E2E测试 |

---

## 10. 后续计划

测试基础设施完成后，后续开发必须遵循TDD：
1. **RED**: 写失败的测试
2. **GREEN**: 写最简代码让测试通过
3. **REFACTOR**: 重构，保持测试通过

**设计完成，等待用户确认！**