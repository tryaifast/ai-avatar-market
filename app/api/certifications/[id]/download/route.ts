// app/api/certifications/[id]/download/route.ts
// 下载认证证书 PDF

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/client';

// GET /api/certifications/[id]/download
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
      .select('creator_id, certificate_url, status, certificate_no')
      .eq('id', certificationId)
      .single();

    if (error || !cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    // 3. 验证所有权
    if (cert.creator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. 检查是否已生成证书
    if (cert.status !== 'certified' || !cert.certificate_url) {
      return NextResponse.json({ error: 'Certificate not ready' }, { status: 400 });
    }

    // 5. 从 Storage 下载
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('deliverables')
      .download(cert.certificate_url);

    if (downloadError || !fileData) {
      console.error('[certification/download] Failed to download:', downloadError);
      return NextResponse.json({ error: 'Failed to download certificate' }, { status: 500 });
    }

    // 6. 返回文件
    const fileName = `AI分身知识产权认证证书_${cert.certificate_no}.pdf`;
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('[certification/download] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
