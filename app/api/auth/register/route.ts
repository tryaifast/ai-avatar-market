// ============================================
// Register API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB } from '@/lib/db/supabase';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role = 'client' } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await DB.User.getByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await DB.User.create({
      email,
      password: hashedPassword,
      name,
      role,
      identity: [],
      bio: '',
    });

    // 生成 JWT token
    const token = generateToken({ userId: user.id!, email: user.email });

    // 返回用户信息（不包含密码）+ token
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    // 如果是 RLS 错误，返回更详细的信息帮助排查
    const isRLSError = error?.message?.includes('row-level security') || 
                       error?.code === '42501' ||
                       error?.message?.includes('policy');
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        debug: isRLSError ? {
          hint: 'RLS policy violation - service role key may not be configured correctly on Vercel',
          serviceKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...',
        } : undefined,
      },
      { status: 500 }
    );
  }
}
