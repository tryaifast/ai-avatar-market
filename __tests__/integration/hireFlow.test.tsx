/**
 * @jest-environment jsdom
 * 
 * TDD: 雇佣流程集成测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// 雇佣流程类型
interface HirePlan {
  type: 'hourly' | 'fixed';
  hours?: number;
  duration?: string;
}

interface HireFormData {
  plan: HirePlan;
  requirements: string;
}

// 模拟雇佣流程组件
const MockHireFlow = ({ avatarPrice = { hourly: 200, fixed: 5000 } }) => {
  const [step, setStep] = useState<'select' | 'confirm' | 'payment' | 'success'>('select');
  const [plan, setPlan] = useState<HirePlan>({ type: 'hourly', hours: 2 });
  const [requirements, setRequirements] = useState('');

  const calculateTotal = () => {
    const baseAmount = plan.type === 'hourly' 
      ? avatarPrice.hourly * (plan.hours || 1)
      : avatarPrice.fixed;
    const serviceFee = Math.round(baseAmount * 0.1);
    return { baseAmount, serviceFee, total: baseAmount + serviceFee };
  };

  const handlePlanSelect = (type: 'hourly' | 'fixed') => {
    setPlan({ 
      type, 
      hours: type === 'hourly' ? 2 : undefined,
      duration: type === 'fixed' ? '1周' : undefined
    });
  };

  const handleConfirm = () => {
    if (requirements.trim()) {
      setStep('payment');
    }
  };

  const handlePayment = () => {
    setStep('success');
  };

  const { total } = calculateTotal();

  return (
    <div>
      {step === 'select' && (
        <div>
          <div data-testid="plan-selection">
            <label>
              <input
                type="radio"
                name="plan"
                checked={plan.type === 'hourly'}
                onChange={() => handlePlanSelect('hourly')}
                data-testid="hourly-radio"
              />
              按小时 ¥{avatarPrice.hourly}/小时
            </label>
            <label>
              <input
                type="radio"
                name="plan"
                checked={plan.type === 'fixed'}
                onChange={() => handlePlanSelect('fixed')}
                data-testid="fixed-radio"
              />
              按项目 ¥{avatarPrice.fixed}起
            </label>
          </div>
          
          {plan.type === 'hourly' && (
            <input
              type="number"
              value={plan.hours}
              onChange={(e) => setPlan({ ...plan, hours: parseInt(e.target.value) || 1 })}
              data-testid="hours-input"
              min={1}
            />
          )}
          
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            data-testid="requirements-input"
            placeholder="项目需求"
          />
          
          <button onClick={() => setStep('confirm')} data-testid="to-confirm-btn">
            下一步
          </button>
        </div>
      )}
      
      {step === 'confirm' && (
        <div data-testid="confirm-step">
          <div data-testid="total-amount">¥{total}</div>
          <div data-testid="plan-summary">
            {plan.type === 'hourly' ? `按小时: ${plan.hours}小时` : '按项目'}
          </div>
          <button onClick={handleConfirm} data-testid="confirm-btn">
            确认并支付
          </button>
        </div>
      )}
      
      {step === 'payment' && (
        <div data-testid="payment-step">
          <div>支付金额: ¥{total}</div>
          <button onClick={handlePayment} data-testid="pay-btn">
            立即支付
          </button>
        </div>
      )}
      
      {step === 'success' && (
        <div data-testid="success-step">
          支付成功！
        </div>
      )}
    </div>
  );
};

describe('雇佣流程', () => {
  // RED: 测试计划选择
  test('应该能够选择雇佣计划', async () => {
    render(<MockHireFlow />);
    
    const hourlyRadio = screen.getByTestId('hourly-radio');
    const fixedRadio = screen.getByTestId('fixed-radio');
    
    expect(hourlyRadio).toBeChecked();
    expect(fixedRadio).not.toBeChecked();
    
    fireEvent.click(fixedRadio);
    
    expect(fixedRadio).toBeChecked();
    expect(hourlyRadio).not.toBeChecked();
  });

  // RED: 测试金额计算 - 按小时
  test('按小时雇佣应该正确计算金额', async () => {
    render(<MockHireFlow avatarPrice={{ hourly: 200, fixed: 5000 }} />);
    
    const user = userEvent.setup();
    const hoursInput = screen.getByTestId('hours-input');
    
    // 输入3小时
    await user.clear(hoursInput);
    await user.type(hoursInput, '3');
    
    // 填写需求并进入确认页
    await user.type(screen.getByTestId('requirements-input'), '测试需求');
    fireEvent.click(screen.getByTestId('to-confirm-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('confirm-step')).toBeInTheDocument();
    });
    
    // 基础200*3=600，服务费60，总计660
    expect(screen.getByTestId('total-amount')).toHaveTextContent('¥660');
  });

  // RED: 测试金额计算 - 按项目
  test('按项目雇佣应该显示固定价格', async () => {
    render(<MockHireFlow avatarPrice={{ hourly: 200, fixed: 5000 }} />);
    
    const user = userEvent.setup();
    
    // 选择按项目
    fireEvent.click(screen.getByTestId('fixed-radio'));
    
    // 填写需求并进入确认页
    await user.type(screen.getByTestId('requirements-input'), '测试需求');
    fireEvent.click(screen.getByTestId('to-confirm-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('confirm-step')).toBeInTheDocument();
    });
    
    // 基础5000，服务费500，总计5500
    expect(screen.getByTestId('total-amount')).toHaveTextContent('¥5500');
  });

  // RED: 测试完整流程
  test('应该能够完成整个雇佣流程', async () => {
    render(<MockHireFlow />);
    
    const user = userEvent.setup();
    
    // 步骤1: 填写需求
    await user.type(screen.getByTestId('requirements-input'), '需要一个产品策略咨询');
    fireEvent.click(screen.getByTestId('to-confirm-btn'));
    
    // 步骤2: 确认
    await waitFor(() => {
      expect(screen.getByTestId('confirm-step')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('confirm-btn'));
    
    // 步骤3: 支付
    await waitFor(() => {
      expect(screen.getByTestId('payment-step')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('pay-btn'));
    
    // 步骤4: 成功
    await waitFor(() => {
      expect(screen.getByTestId('success-step')).toBeInTheDocument();
    });
  });
});
