import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthPayload {
  userId: string;
  email: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  try {
    // 尝试从 header 获取 token
    let token = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // 如果 header 没有，尝试从 cookie 获取（支持页面路由的 session）
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const tokenMatch = cookieHeader.match(/token=([^;]+)/);
        if (tokenMatch) {
          token = decodeURIComponent(tokenMatch[1]);
        }
      }
    }
    
    if (!token) {
      return null;
    }
    
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (error) {
    console.error('Verify auth error:', error);
    return null;
  }
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
