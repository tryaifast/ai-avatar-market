// ============================================
// 用户留言反馈 API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// POST - 提交留言
export async function POST(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { type, content } = await req.json();

    if (!content || content.trim().length < 5) {
      return NextResponse.json({ error: '留言内容至少5个字' }, { status: 400 });
    }

    // 获取用户信息
    const user = await DB.User.getById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 创建留言
    const { data, error } = await DB.db
      .from('feedbacks')
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        type: type || 'general',
        content: content.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '留言提交成功',
      feedback: data,
    });
  } catch (error: any) {
    console.error('Submit feedback error:', error);
    return NextResponse.json(
      { error: error.message || '提交失败' },
      { status: 500 }
    );
  }
}

// GET - 获取自己的留言列表
export async function GET(req: NextRequest) {
  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data, error } = await DB.db
      .from('feedbacks')
      .select('*')
      .eq('user_id', currentUser.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      feedbacks: data || [],
    });
  } catch (error: any) {
    console.error('Get feedbacks error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}
