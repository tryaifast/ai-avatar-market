// app/api/admin/certifications/route.ts
// 管理后台 - 认证列表

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { DB } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证管理员身份
    const currentUser = await verifyAuth(request);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否为管理员
    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    // 2. 查询所有认证记录
    const { data: certifications, error } = await (DB.db.from('avatar_certifications') as any)
      .select(`
        *,
        avatar:avatar_id (id, name),
        creator:creator_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[admin/certifications] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      certifications: certifications || [],
    });

  } catch (error: any) {
    console.error('[admin/certifications] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
