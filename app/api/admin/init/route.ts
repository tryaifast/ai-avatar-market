// ============================================
// Admin Initialization API
// 创建或更新管理员账号
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB } from '@/lib/db/supabase';

const INIT_SECRET = process.env.ADMIN_INIT_SECRET || 'init_admin_2024';

export async function POST(req: NextRequest) {
  try {
    const { secret, email, password, name } = await req.json();

    // 验证密钥
    if (secret !== INIT_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      );
    }

    // 验证必填字段
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await DB.User.getByEmail(email);

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // 更新现有用户为管理员
      await DB.User.update(existingUser.id, {
        ...existingUser,
        name,
        password: hashedPassword,
        role: 'admin',
      });

      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        user: {
          id: existingUser.id,
          email,
          name,
          role: 'admin',
        },
      });
    } else {
      // 创建新管理员用户
      const user = await DB.User.create({
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        identity: ['管理员'],
        bio: '系统管理员',
      });

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }
  } catch (error: any) {
    console.error('Admin init error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
