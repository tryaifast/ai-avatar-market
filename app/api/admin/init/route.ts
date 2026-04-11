// ============================================
// Admin Initialization API
// 创建初始管理员账号（仅允许执行一次或验证后执行）
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB } from '@/lib/db/supabase';

// 简单的密钥验证，防止被滥用
const INIT_SECRET = 'init_admin_2024';

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

    // 检查是否已存在管理员
    const allUsers = await DB.User.getAll();
    const existingAdmin = allUsers.find(u => u.role === 'admin');
    
    if (existingAdmin && !email) {
      return NextResponse.json({
        message: 'Admin already exists',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
        }
      });
    }

    // 如果指定了邮箱，检查是否已存在
    if (email) {
      const existingUser = await DB.User.getByEmail(email);
      if (existingUser) {
        // 如果用户存在，更新为管理员
        const updated = await DB.User.update(existingUser.id, {
          ...existingUser,
          role: 'admin',
        });
        return NextResponse.json({
          success: true,
          message: 'User promoted to admin',
          admin: {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
          }
        });
      }

      // 创建新管理员
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await DB.User.create({
        email,
        password: hashedPassword,
        name: name || 'Admin',
        role: 'admin',
        identity: ['管理员'],
        bio: '系统管理员',
      });

      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      });
    }

    return NextResponse.json(
      { error: 'Email and password are required for creating admin' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Admin init error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
