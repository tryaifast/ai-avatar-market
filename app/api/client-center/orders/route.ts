// ============================================
// Client Orders API
// GET /api/client-center/orders?status=xxx - 获取订单列表
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = createServiceClient();
    const clientId = auth.userId;

    // 查询参数
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // all, pending, active, completed
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 构建查询
    let query = db
      .from('tasks')
      .select(`
        id, title, description, status, price, pricing_type, type,
        created_at, updated_at, timeline_delivered_at, timeline_completed_at,
        avatar:avatar_id (id, name, avatar_url),
        creator:creator_id (id, name),
        ai_status, human_status, final_status
      `, { count: 'exact' })
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // 状态筛选
    if (status && status !== 'all') {
      switch (status) {
        case 'pending':
          query = query.eq('status', 'pending');
          break;
        case 'active':
          query = query.in('status', ['ai_working', 'human_review', 'delivered']);
          break;
        case 'completed':
          query = query.eq('status', 'completed');
          break;
      }
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // 格式化订单数据
    const orders = (data || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      price: task.price,
      pricingType: task.pricing_type,
      type: task.type,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      deliveredAt: task.timeline_delivered_at,
      completedAt: task.timeline_completed_at,
      avatar: task.avatar,
      creator: task.creator,
      progress: getOrderProgress(task),
    }));

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('[ClientCenter] Orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// 计算订单进度
function getOrderProgress(task: any): number {
  switch (task.status) {
    case 'pending': return 10;
    case 'ai_working': return 40;
    case 'human_review': return 70;
    case 'delivered': return 90;
    case 'completed': return 100;
    default: return 0;
  }
}
