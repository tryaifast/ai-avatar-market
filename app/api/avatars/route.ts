import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// 获取分身列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const identity = searchParams.get('identity') || '';
    
    // 获取活跃的分身列表
    let avatars = DB.Avatar.getActive();
    
    // 搜索过滤
    if (query) {
      avatars = DB.Avatar.search(query);
    }
    
    // 身份过滤
    if (identity) {
      const users = DB.User.getAll();
      const creatorIds = users
        .filter(u => u.identity.includes(identity as any))
        .map(u => u.id);
      avatars = avatars.filter(a => creatorIds.includes(a.creatorId));
    }
    
    // 获取创作者信息
    const avatarsWithCreator = avatars.map(avatar => {
      const creator = DB.User.getById(avatar.creatorId);
      return {
        ...avatar,
        creator: creator ? {
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar,
          identity: creator.identity,
        } : null,
      };
    });
    
    return NextResponse.json({ avatars: avatarsWithCreator });
  } catch (error) {
    console.error('Get avatars error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建分身
export async function POST(request: NextRequest) {
  try {
    // 验证用户
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // 创建分身
    const avatar = DB.Avatar.create({
      ...data,
      creatorId: auth.userId,
      status: 'active',
    });
    
    return NextResponse.json({ avatar });
  } catch (error) {
    console.error('Create avatar error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
