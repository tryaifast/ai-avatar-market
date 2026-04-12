// 昵称查重 API

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';

// GET /api/auth/check-name?name=xxx - 检查昵称是否可用
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name')?.trim();

    if (!name) {
      return NextResponse.json({ error: '请提供昵称' }, { status: 400 });
    }

    if (name.length < 2 || name.length > 20) {
      return NextResponse.json({ available: false, reason: '昵称长度需在2-20个字符之间' });
    }

    const { data } = await (DB.db.from('users') as any)
      .select('id')
      .eq('name', name)
      .limit(1);

    if (data && data.length > 0) {
      return NextResponse.json({ available: false, reason: '该昵称已被使用' });
    }

    return NextResponse.json({ available: true });
  } catch (error: any) {
    console.error('Check name error:', error);
    return NextResponse.json(
      { error: error.message || '检查失败' },
      { status: 500 }
    );
  }
}
