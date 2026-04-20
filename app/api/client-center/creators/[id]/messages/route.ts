// ============================================
// Creator Contact Messages API
// GET /api/client-center/creators/[id]/messages - 获取与某个创作者的消息记录
// POST /api/client-center/creators/[id]/messages - 发送消息给创作者
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { verifyAuth } from '@/lib/auth';

// GET - 获取与创作者的消息记录
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = createServiceClient();
    const clientId = auth.userId;
    const creatorId = params.id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // 获取消息列表（按时间正序，方便显示）
    const { data: messages, error } = await (db as any)
      .from('client_creator_messages')
      .select(`
        id, content, sender_type, is_read, created_at,
        related_avatar_id, related_task_id,
        client:client_id (id, name, avatar),
        creator:creator_id (id, name, avatar)
      `)
      .eq('client_id', clientId)
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      throw error;
    }

    // 标记为已读
    await (db as any)
      .from('client_creator_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('creator_id', creatorId)
      .eq('sender_type', 'creator')
      .eq('is_read', false);

    // 获取创作者信息
    const { data: creator } = await db
      .from('users')
      .select('id, name, avatar, bio, profession, company')
      .eq('id', creatorId)
      .single();

    return NextResponse.json({
      success: true,
      messages: messages || [],
      creator: creator || null,
    });
  } catch (error: any) {
    console.error('[ClientCenter] Creator messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 发送消息
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const db = createServiceClient();
    const clientId = auth.userId;
    const creatorId = params.id;
    const { content, relatedAvatarId, relatedTaskId } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 });
    }

    const { data, error } = await (db as any)
      .from('client_creator_messages')
      .insert({
        client_id: clientId,
        creator_id: creatorId,
        sender_type: 'client',
        content: content.trim(),
        related_avatar_id: relatedAvatarId || null,
        related_task_id: relatedTaskId || null,
        is_read: false,
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
