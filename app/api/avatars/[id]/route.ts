// ============================================
// Single Avatar API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';

// GET /api/avatars/:id - 获取单个分身
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const avatar = await DB.Avatar.getById(params.id);

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error: any) {
    console.error('Get avatar error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/avatars/:id - 更新分身
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    const avatar = await DB.Avatar.update(params.id, data);

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar,
    });
  } catch (error: any) {
    console.error('Update avatar error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
