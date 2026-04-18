// app/api/certifications/[id]/route.ts
// 查询认证详情（状态页轮询用）

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/client';
import { CertificationGenerator } from '@/lib/certifications/generator';

// GET /api/certifications/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.userId;
    const certificationId = params.id;

    // 2. 查询认证记录
    const supabase = createServiceClient();
    const { data: cert, error } = await (supabase
      .from('avatar_certifications') as any)
      .select(`
        *,
        avatar:avatar_id (id, name, description)
      `)
      .eq('id', certificationId)
      .single();

    if (error || !cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    // 3. 验证所有权
    if (cert.creator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. 如果已支付但未生成证书，触发生成
    if (cert.status === 'paid') {
      const generator = new CertificationGenerator();
      try {
        await generator.ensureGenerated(cert.avatar_id, certificationId);
        // 重新查询以获取最新状态
        const { data: updatedCert } = await (supabase
          .from('avatar_certifications') as any)
          .select(`
            *,
            avatar:avatar_id (id, name, description)
          `)
          .eq('id', certificationId)
          .single();
        if (updatedCert) {
          return NextResponse.json({ success: true, certification: updatedCert });
        }
      } catch (genError) {
        console.error('[certification/get] Failed to generate:', genError);
      }
    }

    return NextResponse.json({ success: true, certification: cert });

  } catch (error: any) {
    console.error('[certification/get] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
