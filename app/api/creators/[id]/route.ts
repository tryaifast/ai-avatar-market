// ============================================
// Creator Public Profile API
// GET /api/creators/[id] - 获取创作者公开信息
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createServiceClient();
    const creatorId = params.id;

    // 1. 查用户基本信息
    const { data: userData, error: userError } = await db
      .from('users')
      .select('id, name, avatar, bio, identity, created_at, credit_as_creator_rating, credit_as_creator_completed, credit_as_creator_review_count')
      .eq('id', creatorId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: '创作者不存在' }, { status: 404 });
    }

    const user = userData as any;

    // 2. 查入驻申请信息（bio, experiences, skills, profession, company, resume_url 等）
    const { data: appData } = await db
      .from('creator_applications')
      .select('bio, profession, company, experience_years, skills, experiences, resume_url, portfolio_url')
      .eq('user_id', creatorId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const application = appData as any;

    // 3. 查该创作者的所有 active 分身
    const { data: avatarsData } = await db
      .from('avatars')
      .select('id, name, description, avatar_url, personality_expertise, pricing_type, pricing_per_task_min, pricing_per_task_max, pricing_subscription_monthly, scope_can_do, scope_cannot_do, scope_response_time, stats_hired_count, stats_completed_tasks, stats_rating, stats_review_count')
      .eq('creator_id', creatorId)
      .eq('status', 'active');

    const avatars = (avatarsData || []) as any[];

    // 4. 组装返回数据
    const creator = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      // 优先用申请表中的 bio（更完整），其次用 users 表的
      bio: application?.bio || user.bio || '',
      identity: user.identity || [],
      profession: application?.profession || '',
      company: application?.company || '',
      experienceYears: application?.experience_years || null,
      skills: application?.skills || [],
      // 工作经历
      experiences: application?.experiences || [],
      // 简历和作品集
      resumeUrl: application?.resume_url || null,
      portfolioUrl: application?.portfolio_url || null,
      // 统计
      rating: user.credit_as_creator_rating || 0,
      completedTasks: user.credit_as_creator_completed || 0,
      reviewCount: user.credit_as_creator_review_count || 0,
      totalHires: avatars.reduce((sum: number, a: any) => sum + (a.stats_hired_count || 0), 0),
      joinDate: user.created_at,
      // 分身列表
      avatars: avatars.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        avatarUrl: a.avatar_url,
        expertise: a.personality_expertise || [],
        pricing: {
          type: a.pricing_type,
          min: a.pricing_per_task_min,
          max: a.pricing_per_task_max,
          monthly: a.pricing_subscription_monthly,
        },
        canDo: a.scope_can_do || [],
        cannotDo: a.scope_cannot_do || [],
        responseTime: a.scope_response_time || '平均2小时内',
        stats: {
          hiredCount: a.stats_hired_count || 0,
          completedTasks: a.stats_completed_tasks || 0,
          rating: a.stats_rating || 0,
          reviewCount: a.stats_review_count || 0,
        },
      })),
    };

    return NextResponse.json({ success: true, creator });
  } catch (error: any) {
    console.error('[CreatorProfile] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
