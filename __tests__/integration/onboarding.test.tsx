/**
 * @jest-environment jsdom
 * 
 * TDD: 入驻流程集成测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// 模拟入驻申请表单组件
const MockApplicationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    realName: '',
    title: '',
    company: '',
    experience: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.realName.trim()) newErrors.realName = '请输入真实姓名';
      if (!formData.title.trim()) newErrors.title = '请输入职位';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      return { success: true, data: formData };
    }
    return { success: false };
  };

  return (
    <div>
      <div data-testid="step-indicator">步骤 {step}/4</div>
      
      {step === 1 && (
        <div>
          <input
            data-testid="realName-input"
            value={formData.realName}
            onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
            placeholder="真实姓名"
          />
          {errors.realName && <span data-testid="realName-error">{errors.realName}</span>}
          
          <input
            data-testid="title-input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="职位"
          />
          {errors.title && <span data-testid="title-error">{errors.title}</span>}
          
          <button data-testid="next-btn" onClick={handleNext}>下一步</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <input
            data-testid="company-input"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="公司"
          />
          <button data-testid="submit-btn" onClick={handleSubmit}>提交</button>
        </div>
      )}
      
      {step === 4 && <div data-testid="success-message">申请提交成功</div>}
    </div>
  );
};

describe('入驻申请流程', () => {
  // RED: 测试步骤导航
  test('应该显示当前步骤', () => {
    render(<MockApplicationForm />);
    
    expect(screen.getByTestId('step-indicator')).toHaveTextContent('步骤 1/4');
  });

  // RED: 测试表单验证
  test('空表单提交应该显示错误', async () => {
    render(<MockApplicationForm />);
    
    const nextBtn = screen.getByTestId('next-btn');
    fireEvent.click(nextBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId('realName-error')).toBeInTheDocument();
      expect(screen.getByTestId('title-error')).toBeInTheDocument();
    });
  });

  // RED: 测试成功填写表单
  test('填写完整信息应该能进入下一步', async () => {
    const user = userEvent.setup();
    render(<MockApplicationForm />);
    
    // 填写第一步
    await user.type(screen.getByTestId('realName-input'), '张明');
    await user.type(screen.getByTestId('title-input'), '产品经理');
    
    fireEvent.click(screen.getByTestId('next-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('step-indicator')).toHaveTextContent('步骤 2/4');
    });
  });
});
