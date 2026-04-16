// ============================================
// 创作者收益看板 API
// GET /api/creator/earnings - 获取创作者收益统计
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 获取所有已完成的任务
    const { data: tasks, error } = await (DB.db as any)
      .from('tasks')
      .select('*')
      .eq('creator_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 计算统计数据
    const completedTasks = (tasks || []).filter((t: any) => t.status === 'completed');
    const activeTasks = (tasks || []).filter((t: any) => 
      ['pending', 'ai_working', 'ai_completed', 'human_reviewing'].includes(t.status)
    );

    const totalEarnings = completedTasks.reduce((sum: number, t: any) => sum + (t.creator_earnings || 0), 0);
    const pendingEarnings = activeTasks.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
    const totalApiCost = completedTasks.reduce((sum: number, t: any) => sum + (t.api_cost || 0), 0);

    // 月度统计（最近6个月）
    const monthlyStats: Record<string, { earnings: number; tasks: number; apiCost: number }> = {};
    completedTasks.forEach((t: any) => {
      const month = t.completed_at?.substring(0, 7) || 'unknown';
      if (!monthlyStats[month]) {
        monthlyStats[month] = { earnings: 0, tasks: 0, apiCost: 0 };
      }
      monthlyStats[month].earnings += t.creator_earnings || 0;
      monthlyStats[month].tasks += 1;
      monthlyStats[month].apiCost += t.api_cost || 0;
    });

    const monthlyStatsArray = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        earnings: stats.earnings,
        tasks: stats.tasks,
        apiCost: stats.apiCost,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      totalEarnings,       // 累计收益（分）
      pendingEarnings,     // 进行中任务的待收金额（分）
      totalApiCost,        // 累计 API 成本（分）
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      monthlyStats: monthlyStatsArray,
    });
  } catch (error: any) {
    console.error('[creator/earnings] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取收益数据失败' },
      { status: 500 }
    );
  }
}
