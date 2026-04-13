// ============================================
// 用户资料更新 API
// PUT /api/user/profile - 修改昵称/简介/身份/联系方式
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, identity, phone } = body;

    // 验证昵称：如果修改了昵称，检查是否重名
    if (name) {
      const currentUser = await DB.User.getById(auth.userId);
      if (currentUser && currentUser.name !== name) {
        const { data: nameCheck } = await (DB.db.from('users') as any)
          .select('id')
          .eq('name', name)
          .limit(1);
        if (nameCheck && nameCheck.length > 0) {
          return NextResponse.json({ error: '该昵称已被使用，请换一个' }, { status: 409 });
        }
      }
    }

    // 构建更新数据（只允许更新安全字段）
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (identity !== undefined) updates.identity = identity;

    // phone 字段需要映射到数据库的 phone 列
    const dbUpdates: any = { ...updates };
    if (phone !== undefined) dbUpdates.phone = phone;

    const updatedUser = await DB.User.update(auth.userId, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || '更新失败' },
      { status: 500 }
    );
  }
}
