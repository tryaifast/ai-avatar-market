// ============================================
// Creator Applications API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET /api/creator-applications - 获取申请列表
export async function GET(req: NextRequest) {
  try {
    // 验证认证
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let applications;
    if (userId) {
      const app = await DB.CreatorApplication.getByUserId(userId);
      applications = app ? [app] : [];
    } else {
      // 只有管理员能获取所有申请
      const user = await DB.User.getById(currentUser.userId);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
      }
      applications = await DB.CreatorApplication.getAll();
    }

    // 按状态过滤
    if (status) {
      applications = applications.filter((app: any) => app.status === status);
    }

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error: any) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/creator-applications - 提交申请
export async function POST(req: NextRequest) {
  try {
    // 验证认证
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const data = await req.json();

    // 将驼峰字段转为数据库下划线字段
    const application = await DB.CreatorApplication.create({
      user_id: data.userId || currentUser.userId,
      real_name: data.realName || data.name || '',
      id_number: data.idNumber || null,
      phone: data.phone || '',
      email: data.email || currentUser.email || '',
      profession: data.profession || '',
      experience_years: data.experienceYears || null,
      bio: data.bio || '',
      skills: data.skills || [],
      portfolio_urls: data.portfolioUrls || [],
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    // 更新用户的入驻状态为 submitted
    await DB.User.update(currentUser.userId, {
      onboarding_status: 'submitted',
    } as any);

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
