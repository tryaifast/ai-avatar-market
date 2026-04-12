// 管理员用户管理 API - 单个用户操作

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// PUT /api/admin/users/[id] - 封禁/解封用户
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const admin = await DB.User.getById(currentUser.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const userId = params.id;
    const body = await req.json();
    const { status } = body;

    // 验证 status 值
    if (!['banned', 'active'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值，只支持 banned/active' }, { status: 400 });
    }

    // 不能封禁自己
    if (userId === currentUser.userId) {
      return NextResponse.json({ error: '不能封禁自己' }, { status: 400 });
    }

    // 更新用户状态
    const { data, error } = await (DB.db.from('users') as any)
      .update({ onboarding_status: status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 如果封禁，同时下架该用户的所有分身
    if (status === 'banned') {
      await (DB.db.from('avatars') as any)
        .update({ status: 'banned' })
        .eq('creator_id', userId)
        .neq('status', 'banned');
    }

    // 如果解封，恢复该用户之前被下架的分身为 paused 状态
    if (status === 'active') {
      await (DB.db.from('avatars') as any)
        .update({ status: 'paused' })
        .eq('creator_id', userId)
        .eq('status', 'banned');
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        onboardingStatus: data.onboarding_status,
        createdAt: data.created_at,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || '更新用户失败' },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id] - 获取用户详情
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const admin = await DB.User.getById(currentUser.userId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const userId = params.id;

    // 获取用户信息
    const { data: userData, error: userError } = await (DB.db.from('users') as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 获取用户的分身
    const { data: avatars } = await (DB.db.from('avatars') as any)
      .select('*')
      .eq('creator_id', userId);

    // 获取用户的任务（作为客户端）
    const { data: clientTasks } = await (DB.db.from('tasks') as any)
      .select('*')
      .eq('client_id', userId);

    // 获取用户的入驻申请
    const { data: applications } = await (DB.db.from('creator_applications') as any)
      .select('*')
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        bio: userData.bio,
        identity: userData.identity || [],
        onboardingStatus: userData.onboarding_status,
        walletBalance: userData.wallet_balance || 0,
        creditScore: userData.credit_score || 80,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
      avatars: (avatars || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        createdAt: a.created_at,
      })),
      taskStats: {
        asClient: (clientTasks || []).length,
        completed: (clientTasks || []).filter((t: any) => t.status === 'completed').length,
      },
      applications: (applications || []).map((app: any) => ({
        id: app.id,
        status: app.status,
        profession: app.profession,
        createdAt: app.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get user detail error:', error);
    return NextResponse.json(
      { error: error.message || '获取用户详情失败' },
      { status: 500 }
    );
  }
}
