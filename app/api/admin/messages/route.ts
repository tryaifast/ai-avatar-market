// ============================================
// 管理员消息推送 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET - 获取推送历史
export async function GET(req: NextRequest) {
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

    // 新表不在TS类型定义中，用as any绕过
    const { data, error } = await (DB.db.from('admin_broadcasts') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      broadcasts: data || [],
    });
  } catch (error: any) {
    console.error('Get broadcasts error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// POST - 推送消息
export async function POST(req: NextRequest) {
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

    const { title, content, targetType, targetUsers } = await req.json();

    if (!title || !content || title.trim().length < 1 || content.trim().length < 1) {
      return NextResponse.json({ error: '请填写标题和内容' }, { status: 400 });
    }

    // 创建广播记录（新表不在TS类型定义中，用as any绕过）
    const { data: broadcast, error: broadcastError } = await (DB.db.from('admin_broadcasts') as any)
      .insert({
        title: title.trim(),
        content: content.trim(),
        target_type: targetType || 'all',
        target_users: targetUsers || [],
        sent_by: currentUser.userId,
      })
      .select()
      .single();

    if (broadcastError) throw broadcastError;

    // 推送给目标用户
    if (targetType === 'specific_users' && targetUsers && targetUsers.length > 0) {
      // 推送给指定用户
      const messages = targetUsers.map((userId: string) => ({
        user_id: userId,
        type: 'admin_broadcast',
        title: title.trim(),
        content: content.trim(),
      }));

      const { error: msgError } = await (DB.db.from('user_messages') as any).insert(messages);
      if (msgError) throw msgError;
    } else {
      // 推送给所有用户
      const { data: allUsers, error: usersError } = await DB.db.from('users').select('id');
      if (usersError) throw usersError;

      if (allUsers && allUsers.length > 0) {
        const messages = allUsers.map((u: any) => ({
          user_id: u.id,
          type: 'admin_broadcast',
          title: title.trim(),
          content: content.trim(),
        }));

        // 分批插入，每批100条
        const batchSize = 100;
        for (let i = 0; i < messages.length; i += batchSize) {
          const batch = messages.slice(i, i + batchSize);
          const { error: msgError } = await (DB.db.from('user_messages') as any).insert(batch);
          if (msgError) throw msgError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '消息推送成功',
      broadcast,
    });
  } catch (error: any) {
    console.error('Send broadcast error:', error);
    return NextResponse.json(
      { error: error.message || '推送失败' },
      { status: 500 }
    );
  }
}
