// app/api/admin/certifications/route.ts
// 管理后台 - 认证列表

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证管理员身份
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 查询所有认证记录
    const supabase = createServiceClient();
    const { data: certifications, error } = await (supabase
      .from('avatar_certifications') as any)
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
