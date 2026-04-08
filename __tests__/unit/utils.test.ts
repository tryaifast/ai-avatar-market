/**
 * @jest-environment jsdom
 * 
 * TDD: 工具函数测试
 */

// 支付金额计算
export const calculateTotalAmount = (baseAmount: number, serviceFeeRate: number = 0.1) => {
  const serviceFee = Math.round(baseAmount * serviceFeeRate);
  return {
    baseAmount,
    serviceFee,
    total: baseAmount + serviceFee,
  };
};

// 表单验证
export const validators = {
  email: (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  phone: (phone: string) => {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },
  
  required: (value: string) => {
    return value.trim().length > 0;
  },
  
  minLength: (value: string, min: number) => {
    return value.length >= min;
  },
  
  idCard: (idCard: string) => {
    const regex = /^\d{17}[\dXx]$/;
    return regex.test(idCard);
  },
};

// 日期格式化
export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

describe('支付金额计算', () => {
  // RED: 测试基础计算
  test('应该正确计算含服务费的总额', () => {
    const result = calculateTotalAmount(1000, 0.1);
    
    expect(result.baseAmount).toBe(1000);
    expect(result.serviceFee).toBe(100);
    expect(result.total).toBe(1100);
  });

  // RED: 测试小数处理
  test('应该正确四舍五入服务费', () => {
    const result = calculateTotalAmount(999, 0.1);
    
    expect(result.serviceFee).toBe(100); // 99.9 四舍五入为 100
    expect(result.total).toBe(1099);
  });

  // RED: 测试自定义费率
  test('应该支持自定义服务费率', () => {
    const result = calculateTotalAmount(1000, 0.05);
    
    expect(result.serviceFee).toBe(50);
    expect(result.total).toBe(1050);
  });
});

describe('表单验证', () => {
  // RED: 邮箱验证
  describe('email validator', () => {
    test('应该接受有效的邮箱', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co')).toBe(true);
    });

    test('应该拒绝无效的邮箱', () => {
      expect(validators.email('invalid')).toBe(false);
      expect(validators.email('@example.com')).toBe(false);
      expect(validators.email('test@')).toBe(false);
      expect(validators.email('')).toBe(false);
    });
  });

  // RED: 手机号验证
  describe('phone validator', () => {
    test('应该接受有效的手机号', () => {
      expect(validators.phone('13800138000')).toBe(true);
      expect(validators.phone('15912345678')).toBe(true);
    });

    test('应该拒绝无效的手机号', () => {
      expect(validators.phone('12345678901')).toBe(false); // 不以1开头
      expect(validators.phone('1380013800')).toBe(false); // 少一位
      expect(validators.phone('138001380000')).toBe(false); // 多一位
      expect(validators.phone('')).toBe(false);
    });
  });

  // RED: 必填验证
  describe('required validator', () => {
    test('应该接受非空值', () => {
      expect(validators.required('test')).toBe(true);
      expect(validators.required('a')).toBe(true);
    });

    test('应该拒绝空值', () => {
      expect(validators.required('')).toBe(false);
      expect(validators.required('   ')).toBe(false);
    });
  });

  // RED: 最小长度验证
  describe('minLength validator', () => {
    test('应该接受满足最小长度的值', () => {
      expect(validators.minLength('password', 6)).toBe(true);
      expect(validators.minLength('123456', 6)).toBe(true);
    });

    test('应该拒绝不满足最小长度的值', () => {
      expect(validators.minLength('123', 6)).toBe(false);
      expect(validators.minLength('', 1)).toBe(false);
    });
  });

  // RED: 身份证号验证
  describe('idCard validator', () => {
    test('应该接受有效的身份证号', () => {
      expect(validators.idCard('110101199001011234')).toBe(true);
      expect(validators.idCard('11010119900101123X')).toBe(true);
    });

    test('应该拒绝无效的身份证号', () => {
      expect(validators.idCard('12345678901234567')).toBe(false); // 少一位
      expect(validators.idCard('1234567890123456789')).toBe(false); // 多一位
      expect(validators.idCard('')).toBe(false);
    });
  });
});

describe('日期格式化', () => {
  // RED: 测试基本格式化
  test('应该正确格式化日期', () => {
    const date = new Date('2026-04-08');
    
    expect(formatDate(date)).toBe('2026-04-08');
    expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2026年04月08日');
  });

  // RED: 测试字符串输入
  test('应该接受日期字符串', () => {
    expect(formatDate('2026-04-08')).toBe('2026-04-08');
  });
});
