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
