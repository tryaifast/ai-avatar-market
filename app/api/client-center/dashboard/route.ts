// ============================================
// Client Center Dashboard API
// GET /api/client-center/dashboard - 雇佣者中心首页数据
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

    // 1. 统计信息
    const { data: statsData } = await db
      .from('tasks')
      .select('status, price')
      .eq('client_id', clientId);

    const stats = {
      totalOrders: statsData?.length || 0,
      pendingOrders: statsData?.filter((t: any) => ['pending', 'ai_working', 'human_review'].includes(t.status)).length || 0,
      completedOrders: statsData?.filter((t: any) => t.status === 'completed').length || 0,
      totalSpent: statsData?.filter((t: any) => t.status === 'completed').reduce((sum: number, t: any) => sum + (t.price || 0), 0) || 0,
    };

    // 2. 进行中的订单（最近5个）
    const { data: activeOrders } = await db
      .from('tasks')
      .select(`
        id, title, status, price, created_at, updated_at,
        avatar:avatar_id (id, name, avatar_url),
        creator:creator_id (id, name)
      `)
      .eq('client_id', clientId)
      .in('status', ['pending', 'ai_working', 'human_review', 'delivered'])
      .order('updated_at', { ascending: false })
      .limit(5);

    // 3. 最近雇佣的分身（快捷入口）
    const { data: hiredAvatars } = await (db as any)
      .from('client_hired_avatars')
      .select(`
        id, last_hired_at, total_tasks, completed_tasks,
        avatar:avatar_id (id, name, avatar_url, description),
        creator:creator_id (id, name)
      `)
      .eq('client_id', clientId)
      .order('last_hired_at', { ascending: false })
      .limit(6);

    // 4. 未读消息数
    const { count: unreadCount } = await (db as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', clientId)
      .eq('is_read', false);

    const { count: unreadMessages } = await (db as any)
      .from('client_creator_messages')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('sender_type', 'creator')
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        activeOrders: activeOrders || [],
        hiredAvatars: hiredAvatars || [],
        unreadCount: (unreadCount || 0) + (unreadMessages || 0),
      },
    });
  } catch (error: any) {
    console.error('[ClientCenter] Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
