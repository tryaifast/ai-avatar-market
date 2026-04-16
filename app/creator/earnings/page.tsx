'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/store';
import { DollarSign, TrendingUp, Clock, Zap } from 'lucide-react';

function formatCurrency(fen: number): string {
  return '¥' + (fen / 100).toFixed(2);
}

export default function EarningsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await authFetch('/api/creator/earnings');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Fetch earnings error:', err);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-500">暂无收益数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold">收益中心</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            累计收益
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalEarnings)}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            待结算
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.pendingEarnings)}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Zap className="w-4 h-4" />
            API 成本
          </div>
          <p className="text-2xl font-bold text-gray-600">
            {formatCurrency(stats.totalApiCost)}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <DollarSign className="w-4 h-4" />
            完成任务
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.completedTasks || 0}
          </p>
        </div>
      </div>

      {/* 月度统计 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">月度收益</h2>
        {stats.monthlyStats && stats.monthlyStats.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="text-left py-2">月份</th>
                <th className="text-right py-2">任务数</th>
                <th className="text-right py-2">收益</th>
                <th className="text-right py-2">API成本</th>
                <th className="text-right py-2">净收益</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyStats.map((m: any) => (
                <tr key={m.month} className="border-b last:border-0">
                  <td className="py-3 text-sm">{m.month}</td>
                  <td className="text-right py-3 text-sm">{m.tasks}</td>
                  <td className="text-right py-3 text-sm font-medium text-blue-600">
                    {formatCurrency(m.earnings)}
                  </td>
                  <td className="text-right py-3 text-sm text-gray-500">
                    {formatCurrency(m.apiCost)}
                  </td>
                  <td className="text-right py-3 text-sm font-medium text-green-600">
                    {formatCurrency(m.earnings - m.apiCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-8">暂无月度数据</p>
        )}
      </div>

      {/* 说明 */}
      <div className="mt-6 card p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">收益说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 平台抽成 10%，创作者到手 90%</li>
          <li>• API 调用成本从创作者收益中扣除</li>
          <li>• 按 Token 计费模式下，不足百万 Tokens 按百万计算</li>
          <li>• 任务完成后收益自动到账</li>
        </ul>
      </div>
    </div>
  );
}
