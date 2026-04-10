// ============================================
// Creator Applications API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';

// GET /api/creator-applications - 获取申请列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let applications;
    if (userId) {
      const app = await DB.CreatorApplication.getByUserId(userId);
      applications = app ? [app] : [];
    } else {
      applications = await DB.CreatorApplication.getAll();
    }

    // 按状态过滤
    if (status) {
      applications = applications.filter((app: any) => app.status === status);
    }

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error: any) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/creator-applications - 提交申请
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const application = await DB.CreatorApplication.create({
      ...data,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
