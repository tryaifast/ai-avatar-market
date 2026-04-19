// app/api/certifications/list/route.ts
// 查询当前用户的所有认证记录

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { DB } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. 查询用户的所有认证记录
    const { data: certifications, error } = await (DB.db
      .from('avatar_certifications') as any)
      .select(`
        *,
        avatar:avatar_id (id, name)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[certifications/list] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      certifications: certifications || [],
    });

  } catch (error: any) {
    console.error('[certifications/list] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
