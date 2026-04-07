import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, created, assigned
    
    let tasks: any[] = [];
    
    if (type === 'created') {
      // 我创建的任务（作为客户）
      tasks = DB.Task.getByClient(auth.userId);
    } else if (type === 'assigned') {
      // 分配给我的任务（作为创作者）
      tasks = DB.Task.getByCreator(auth.userId);
    } else {
      // 所有相关任务
      const created = DB.Task.getByClient(auth.userId);
      const assigned = DB.Task.getByCreator(auth.userId);
      tasks = [...created, ...assigned];
    }
    
    // 获取关联信息
    const tasksWithDetails = tasks.map(task => {
      const avatar = DB.Avatar.getById(task.avatarId);
      const client = DB.User.getById(task.clientId);
      const creator = DB.User.getById(task.creatorId);
      
      return {
        ...task,
        avatar: avatar ? { id: avatar.id, name: avatar.name, avatar: avatar.avatar } : null,
        client: client ? { id: client.id, name: client.name } : null,
        creator: creator ? { id: creator.id, name: creator.name } : null,
      };
    });
    
    return NextResponse.json({ tasks: tasksWithDetails });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建任务
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { avatarId, title, description, price, pricingType } = data;
    
    // 获取分身信息
    const avatar = DB.Avatar.getById(avatarId);
    if (!avatar) {
      return NextResponse.json(
        { error: '分身不存在' },
        { status: 404 }
      );
    }
    
    // 创建任务
    const task = DB.Task.create({
      avatarId,
      creatorId: avatar.creatorId,
      clientId: auth.userId,
      title,
      description,
      price,
      pricingType,
      type: 'chat',
      status: 'pending',
      payment: {
        status: 'pending',
        platformFee: Math.floor(price * 0.2), // 20% 平台抽成
        creatorEarnings: Math.floor(price * 0.8), // 80% 创作者收益
      },
    });
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
