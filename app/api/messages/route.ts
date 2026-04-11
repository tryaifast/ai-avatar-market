// ============================================
// 用户消息收件箱 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET - 获取自己的消息列表
export async function GET(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data, error } = await DB.db
      .from('user_messages')
      .select('*')
      .eq('user_id', currentUser.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 统计未读数量
    const { count, error: countError } = await DB.db
      .from('user_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.userId)
      .eq('is_read', false);

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      messages: data || [],
      unreadCount: count || 0,
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// POST - 标记消息已读
export async function POST(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { messageId, markAll } = await req.json();

    if (markAll) {
      // 标记所有消息已读
      const { error } = await DB.db
        .from('user_messages')
        .update({ is_read: true })
        .eq('user_id', currentUser.userId)
        .eq('is_read', false);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: '全部已读',
      });
    }

    if (!messageId) {
      return NextResponse.json({ error: '缺少消息ID' }, { status: 400 });
    }

    // 标记单条消息已读
    const { error } = await DB.db
      .from('user_messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .eq('user_id', currentUser.userId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '已标记已读',
    });
  } catch (error: any) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: error.message || '操作失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除消息
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: '缺少消息ID' }, { status: 400 });
    }

    const { error } = await DB.db
      .from('user_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', currentUser.userId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    );
  }
}
