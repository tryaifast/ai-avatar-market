// ============================================
// Single Creator Application API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// PUT /api/creator-applications/:id - 审核申请
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证认证
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { status, reviewNotes, reviewedBy } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const application = await DB.CreatorApplication.update(params.id, {
      status,
      review_notes: reviewNotes,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    } as any);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // 如果审核通过，更新用户角色为creator + onboarding_status
    if (status === 'approved' && application.user_id) {
      await DB.User.update(application.user_id, {
        role: 'creator',
        onboarding_status: 'approved',
      } as any);
    }

    if (status === 'rejected' && application.user_id) {
      await DB.User.update(application.user_id, {
        onboarding_status: 'rejected',
      } as any);
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
