// 管理员入驻申请审核操作 API

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// PUT /api/admin/applications/[id] - 审核入驻申请
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
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { id } = params;
    const { status, reviewNotes } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const application = await DB.CreatorApplication.update(id, {
      status,
      review_notes: reviewNotes,
      reviewed_at: new Date().toISOString(),
    } as any);

    if (!application) {
      return NextResponse.json({ error: '申请不存在' }, { status: 404 });
    }

    // 审核通过：更新用户角色为 creator + onboarding_status 为 approved
    if (status === 'approved' && application.user_id) {
      await DB.User.update(application.user_id, {
        role: 'creator',
        onboarding_status: 'approved',
      } as any);
    }

    // 审核拒绝：更新 onboarding_status 为 rejected
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
    console.error('Admin update application error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
