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
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = params;
    const { status, reviewNotes } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const application = await DB.CreatorApplication.update(id, {
      status,
      reviewNotes,
      reviewedAt: new Date().toISOString(),
    } as any);

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
