// ============================================
// Admin Change Password API
// 管理员修改自己或其他用户的密码
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 验证当前用户身份
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 检查是否为管理员
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId, newPassword, currentPassword } = await req.json();

    // 如果要修改自己的密码，需要验证当前密码
    if (userId === currentUser.id) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }

      // 获取用户完整信息（包含密码）
      const user = await DB.User.getById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // 验证当前密码
      const isValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // 验证新密码
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    const targetUser = await DB.User.getById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    await DB.User.update(userId, {
      ...targetUser,
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: userId === currentUser.id 
        ? 'Your password has been changed successfully'
        : 'User password has been changed successfully',
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
