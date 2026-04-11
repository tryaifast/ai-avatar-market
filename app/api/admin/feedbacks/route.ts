// ============================================
// 管理后台留言管理 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// GET - 获取所有留言列表
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

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = DB.db.from('feedbacks').select('*').order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      feedbacks: data || [],
    });
  } catch (error: any) {
    console.error('Get all feedbacks error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// POST - 回复留言
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

    const { feedbackId, reply } = await req.json();

    if (!feedbackId || !reply || reply.trim().length < 1) {
      return NextResponse.json({ error: '请填写回复内容' }, { status: 400 });
    }

    // 更新留言状态
    const { data: feedback, error: updateError } = await (DB.db
      .from('feedbacks')
      .update({
        status: 'replied',
        admin_reply: reply.trim(),
        replied_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .select()
      .single() as any);

    if (updateError) throw updateError;

    // 给用户发送消息通知
    await DB.db.from('user_messages').insert({
      user_id: feedback.user_id,
      type: 'reply',
      title: '您的留言已收到回复',
      content: `管理员回复：${reply.trim()}`,
      related_feedback_id: feedbackId,
    });

    return NextResponse.json({
      success: true,
      message: '回复成功',
      feedback,
    });
  } catch (error: any) {
    console.error('Reply feedback error:', error);
    return NextResponse.json(
      { error: error.message || '回复失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除留言
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get('id');

    if (!feedbackId) {
      return NextResponse.json({ error: '缺少留言ID' }, { status: 400 });
    }

    const { error } = await DB.db.from('feedbacks').delete().eq('id', feedbackId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('Delete feedback error:', error);
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    );
  }
}
