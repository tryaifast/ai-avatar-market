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
├── api/
│   ├── auth/
│   │   └── route.test.ts
│   └── avatars/
│       └── route.test.ts
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

### API测试示例

```typescript
import { POST } from './route'

describe('Auth API', () => {
  it('should create user', async () => {
    const request = new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'pass' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

## TDD流程

1. **RED**: 编写失败的测试
2. **GREEN**: 编写最简代码让测试通过
3. **REFACTOR**: 重构，保持测试通过

## Mock数据

测试使用 `app/lib/db/__mocks__/db.ts` 中的Mock数据库，避免依赖真实数据。
