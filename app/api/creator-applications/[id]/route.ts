// ============================================
// Single Creator Application API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';

// PUT /api/creator-applications/:id - 审核申请
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, reviewNotes, reviewedBy } = await req.json();

    const application = await DB.CreatorApplication.update(params.id, {
      status,
      review_notes: reviewNotes,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // 如果审核通过，更新用户角色为creator
    if (status === 'approved') {
      await DB.User.update(application.user_id, {
        role: 'creator',
      });
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
