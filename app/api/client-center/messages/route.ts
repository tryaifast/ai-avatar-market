// ============================================
// Client Messages API
// GET /api/client-center/messages?type=system|creator - 获取消息列表
// POST /api/client-center/messages - 发送消息给创作者
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { verifyAuth } from '@/lib/auth';

// GET - 获取消息列表
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = createServiceClient();
    const clientId = auth.userId;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // all, system, creator
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let messages: any[] = [];
    let total = 0;

    // 获取系统通知
    if (type === 'all' || type === 'system') {
      const { data: notifications, count: notifCount } = await (db as any)
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const systemMessages = (notifications || []).map((n: any) => ({
        id: n.id,
        type: 'system',
        title: n.title,
        content: n.content,
        isRead: n.is_read,
        createdAt: n.created_at,
        data: n.data,
      }));

      messages = [...messages, ...systemMessages];
      total += notifCount || 0;
    }

    // 获取创作者消息
    if (type === 'all' || type === 'creator') {
      const { data: creatorMsgs, count: msgCount } = await (db as any)
        .from('client_creator_messages')
        .select(`
          id, content, sender_type, is_read, created_at, related_avatar_id, related_task_id,
          creator:creator_id (id, name, avatar)
        `, { count: 'exact' })
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const formattedMsgs = (creatorMsgs || []).map((m: any) => ({
        id: m.id,
        type: 'creator',
        content: m.content,
        senderType: m.sender_type, // 'client' or 'creator'
        isRead: m.is_read,
        createdAt: m.created_at,
        creator: m.creator,
        relatedAvatarId: m.related_avatar_id,
        relatedTaskId: m.related_task_id,
      }));

      messages = [...messages, ...formattedMsgs];
      total += msgCount || 0;
    }

    // 按时间排序
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error: any) {
    console.error('[ClientCenter] Messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 发送消息给创作者
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = createServiceClient();
    const clientId = auth.userId;
    const { creatorId, content, relatedAvatarId, relatedTaskId } = await req.json();

    if (!creatorId || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const { data, error } = await (db as any)
      .from('client_creator_messages')
      .insert({
        client_id: clientId,
        creator_id: creatorId,
        sender_type: 'client',
        content,
        related_avatar_id: relatedAvatarId || null,
        related_task_id: relatedTaskId || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: data });
  } catch (error: any) {
    console.error('[ClientCenter] Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
