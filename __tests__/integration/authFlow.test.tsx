/**
 * @jest-environment jsdom
 * 
 * TDD: 认证流程集成测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// 模拟登录表单
const MockLoginForm = ({ onLogin }: { onLogin?: (data: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少6位';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    
    if (email === 'admin@example.com' && password === 'admin123') {
      onLogin?.({ success: true, user: { email, name: '管理员' } });
    } else {
      setErrors({ general: '邮箱或密码错误' });
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          data-testid="email-input"
        />
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          data-testid="password-input"
        />
        {errors.password && <span data-testid="password-error">{errors.password}</span>}
      </div>
      
      {errors.general && <div data-testid="general-error">{errors.general}</div>}
      
      <button type="submit" disabled={isLoading} data-testid="submit-btn">
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
};

// 模拟注册表单
const MockRegisterForm = ({ onRegister }: { onRegister?: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'client' as 'creator' | 'client',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = '请输入姓名';
    if (!formData.email) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSuccess(true);
      onRegister?.({ success: true, user: formData });
    }
  };

  if (isSuccess) {
    return <div data-testid="register-success">注册成功！</div>;
  }

  return (
    <form onSubmit={handleSubmit} data-testid="register-form">
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="姓名"
        data-testid="name-input"
      />
      {errors.name && <span data-testid="name-error">{errors.name}</span>}
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="邮箱"
        data-testid="email-input"
      />
      {errors.email && <span data-testid="email-error">{errors.email}</span>}
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="密码"
        data-testid="password-input"
      />
      {errors.password && <span data-testid="password-error">{errors.password}</span>}
      
      <input
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        placeholder="确认密码"
        data-testid="confirm-password-input"
      />
      {errors.confirmPassword && <span data-testid="confirm-password-error">{errors.confirmPassword}</span>}
      
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'creator' | 'client' })}
        data-testid="type-select"
      >
        <option value="client">需求方</option>
        <option value="creator">创作者</option>
      </select>
      
      <button type="submit" data-testid="submit-btn">注册</button>
    </form>
  );
};

describe('登录流程', () => {
  // RED: 测试表单验证
  test('空表单提交应该显示验证错误', async () => {
    render(<MockLoginForm />);
    
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('请输入邮箱');
      expect(screen.getByTestId('password-error')).toHaveTextContent('请输入密码');
    });
  });

  // RED: 测试邮箱格式验证
  test('无效邮箱应该显示错误', async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);
    
    await user.type(screen.getByTestId('email-input'), 'invalid-email');
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('邮箱格式不正确');
    });
  });

  // RED: 测试密码长度验证
  test('短密码应该显示错误', async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);
    
    await user.type(screen.getByTestId('password-input'), '123');
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('密码至少6位');
    });
  });

  // RED: 测试错误凭证
  test('错误凭证应该显示登录失败', async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);
    
    await user.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('general-error')).toHaveTextContent('邮箱或密码错误');
    });
  });

  // RED: 测试成功登录
  test('正确凭证应该成功登录', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn();
    render(<MockLoginForm onLogin={mockLogin} />);
    
    await user.type(screen.getByTestId('email-input'), 'admin@example.com');
    await user.type(screen.getByTestId('password-input'), 'admin123');
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
    });
    
    expect(mockLogin).toHaveBeenCalledWith({
      success: true,
      user: { email: 'admin@example.com', name: '管理员' },
    });
  });
});

describe('注册流程', () => {
  // RED: 测试表单验证
  test('空表单提交应该显示验证错误', async () => {
    render(<MockRegisterForm />);
    
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });
  });

  // RED: 测试密码不匹配
  test('密码不匹配应该显示错误', async () => {
    const user = userEvent.setup();
    render(<MockRegisterForm />);
    
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.type(screen.getByTestId('confirm-password-input'), 'different456');
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('confirm-password-error')).toHaveTextContent('两次密码不一致');
    });
  });

  // RED: 测试成功注册
  test('完整填写应该成功注册', async () => {
    const user = userEvent.setup();
    const mockRegister = jest.fn();
    render(<MockRegisterForm onRegister={mockRegister} />);
    
    await user.type(screen.getByTestId('name-input'), '新用户');
    await user.type(screen.getByTestId('email-input'), 'newuser@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.type(screen.getByTestId('confirm-password-input'), 'password123');
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('register-success')).toBeInTheDocument();
    });
    
    expect(mockRegister).toHaveBeenCalled();
  });
});
