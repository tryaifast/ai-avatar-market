// ============================================
// Client Hired Avatars API
// GET /api/client-center/avatars - 获取用户雇佣过的分身列表
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

    const { data, error } = await (db as any)
      .from('client_hired_avatars')
      .select(`
        id, total_tasks, completed_tasks, total_spent, last_hired_at, is_favorite, nickname,
        avatar:avatar_id (
          id, name, description, avatar_url, status,
          pricing_type, pricing_per_task_min, pricing_per_task_max, pricing_subscription_monthly,
          scope_can_do, scope_cannot_do, scope_response_time,
          stats_hired_count, stats_rating
        ),
        creator:creator_id (id, name)
      `)
      .eq('client_id', clientId)
      .order('is_favorite', { ascending: false })
      .order('last_hired_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 格式化数据
    const avatars = (data || []).map((item: any) => ({
      id: item.id,
      totalTasks: item.total_tasks,
      completedTasks: item.completed_tasks,
      totalSpent: item.total_spent,
      lastHiredAt: item.last_hired_at,
      isFavorite: item.is_favorite,
      nickname: item.nickname,
      avatar: item.avatar,
      creator: item.creator,
    }));

    return NextResponse.json({
      success: true,
      avatars,
    });
  } catch (error: any) {
    console.error('[ClientCenter] Avatars error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/client-center/avatars - 添加/更新雇佣记录（当创建新订单时调用）
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = createServiceClient();
    const clientId = auth.userId;
    const { avatarId, creatorId } = await req.json();

    if (!avatarId || !creatorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 查询分身信息
    const { data: avatarData } = await db
      .from('avatars')
      .select('pricing_type, pricing_per_task_min, pricing_per_task_max')
      .eq('id', avatarId)
      .single();

    const avatar = avatarData as any;
    const estimatedPrice = avatar?.pricing_per_task_min || 0;

    // 插入或更新雇佣记录
    const { data, error } = await (db as any)
      .from('client_hired_avatars')
      .upsert({
        client_id: clientId,
        avatar_id: avatarId,
        creator_id: creatorId,
        total_tasks: 1, // 原子操作会在触发器中累加
        last_hired_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'client_id,avatar_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[ClientCenter] Upsert avatar error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
