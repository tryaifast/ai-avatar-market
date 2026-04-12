// 管理员分身审核操作 API

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// PUT /api/admin/avatars/[id] - 审核分身（通过/拒绝）
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = params;
    const { status, rejectReason } = await req.json();

    if (!['approved', 'rejected', 'active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    // 审核通过自动改为 active，使分身在市场可见
    const finalStatus = status === 'approved' ? 'active' : status;

    const avatar = await DB.Avatar.update(id, {
      status: finalStatus,
    } as any);

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error: any) {
    console.error('Admin update avatar error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
