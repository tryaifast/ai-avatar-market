// ============================================
// Avatars API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

import { AVATAR_LIMITS } from '@/lib/constants';

// GET /api/avatars - 获取分身列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const creatorId = searchParams.get('creatorId') || '';

    let avatars;
    if (creatorId) {
      // 按创作者获取（包含所有状态，创作者中心用）
      // 验证请求者是创作者本人
      const auth = await verifyAuth(req);
      if (!auth || auth.userId !== creatorId) {
        return NextResponse.json({ error: '无权访问' }, { status: 403 });
      }
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
    // 验证登录状态
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const data = await req.json();

    // 确保creatorId与登录用户一致，防止伪造
    if (data.creatorId && data.creatorId !== auth.userId) {
      return NextResponse.json({ error: '无权为他人创建分身' }, { status: 403 });
    }
    data.creatorId = auth.userId;

    // 检查分身名称是否重名（同一创建者下）
    if (data.name) {
      const { data: nameCheck } = await (DB.db.from('avatars') as any)
        .select('id')
        .eq('creator_id', auth.userId)
        .eq('name', data.name)
        .limit(1);
      if (nameCheck && nameCheck.length > 0) {
        return NextResponse.json(
          { error: '你已经有一个同名分身，请换一个名称' },
          { status: 409 }
        );
      }
    }

    // 检查分身数量限制
    const user = await DB.User.getById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const membershipType = (user as any).membershipType || 'free';
    const limit = AVATAR_LIMITS[membershipType] || 1;

    // 计算当前分身数量
    const existingAvatars = await DB.Avatar.getByCreator(auth.userId);
    const currentCount = existingAvatars.length;

    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: `分身数量已达上限（${limit}个）。免费用户可创建1个分身，升级会员可创建10个。`,
          limit,
          current: currentCount,
          membershipType,
        },
        { status: 403 }
      );
    }

    const avatar = await DB.Avatar.create({
      ...data,
      hourlyPrice: Math.round((data.hourlyPrice || 200) * 100),   // 元转分
      fixedPrice: Math.round((data.fixedPrice || 5000) * 100),   // 元转分
      tokenPrice: Math.round((data.tokenPrice || 5000) * 100),   // 元转分
    });

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
