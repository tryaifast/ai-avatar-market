// ============================================
// 管理员用户管理 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET - 获取所有用户列表
export async function GET(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    // 获取所有用户
    const { data: users, error } = await (DB.db.from('users') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 格式化返回数据
    const formattedUsers = (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      onboardingStatus: u.onboarding_status,
      membershipType: u.membership_type || 'free',
      membershipExpiresAt: u.membership_expires_at,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || '获取用户列表失败' },
      { status: 500 }
    );
  }
}
