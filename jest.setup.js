require('@testing-library/jest-dom')

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

// Polyfill Request/Response for Next.js API tests
global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body || null
  }
  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'))
  }
}

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  json() {
    return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body)
  }
  static json(data, init = {}) {
    return new Response(JSON.stringify(data), { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } })
  }
}

// Console error suppression for expected errors
const originalConsoleError = console.error
console.error = (...args) => {
  // Suppress React act() warnings
  if (args[0]?.includes?.('Warning: An update to')) return
  if (args[0]?.includes?.('act(')) return
  originalConsoleError(...args)
}
