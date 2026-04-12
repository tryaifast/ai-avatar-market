// 管理员分身审核 API

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET /api/admin/avatars - 获取所有分身（管理员）
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const avatars = await DB.Avatar.getAll();

    return NextResponse.json({
      success: true,
      avatars,
    });
  } catch (error: any) {
    console.error('Admin get avatars error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
