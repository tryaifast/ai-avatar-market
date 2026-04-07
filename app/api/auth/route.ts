import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 注册
export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json();

    if (action === 'register') {
      // 检查用户是否已存在
      const existingUser = DB.User.getByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: '用户已存在' },
          { status: 400 }
        );
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = DB.User.create({
        email,
        name,
        password: hashedPassword,
        role: 'both',
        identity: [],
      });

      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    if (action === 'login') {
      // 查找用户
      const user = DB.User.getByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 400 }
        );
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: '密码错误' },
          { status: 400 }
        );
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    return NextResponse.json(
      { error: '无效的操作' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
