// ============================================
// Avatars API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';

// GET /api/avatars - 获取分身列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const creatorId = searchParams.get('creatorId') || '';

    let avatars;
    if (creatorId) {
      // 按创作者获取（包含所有状态，创作者中心用）
      avatars = await DB.Avatar.getByCreator(creatorId);
    } else if (query) {
      avatars = await DB.Avatar.search(query);
    } else {
      // 获取所有激活的分身（市场展示用）
      avatars = await DB.Avatar.getActive();
    }

    return NextResponse.json({
      success: true,
      avatars,
    });
  } catch (error: any) {
    console.error('Get avatars error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/avatars - 创建新分身
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const avatar = await DB.Avatar.create(data);

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error: any) {
    console.error('Create avatar error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
