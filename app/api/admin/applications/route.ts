// 管理员入驻申请 API

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET /api/admin/applications - 获取所有入驻申请
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const applications = await DB.CreatorApplication.getAll();

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error: any) {
    console.error('Admin get applications error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
