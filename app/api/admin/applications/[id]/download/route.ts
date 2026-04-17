// app/api/admin/applications/[id]/download/route.ts
// 下载简历/作品集文件，下载后自动删除Storage节省空间

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/client';

// GET /api/admin/applications/[id]/download?type=resume|portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证管理员身份
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicationId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'resume' or 'portfolio'

    if (!type || !['resume', 'portfolio'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // 2. 获取申请记录
    const supabase = createServiceClient();
    const { data: application, error: appError } = await (supabase
      .from('creator_applications') as any)
      .select('resume_url, portfolio_url')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('[download] Application not found:', appError);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const fileUrl = type === 'resume' ? application.resume_url : application.portfolio_url;
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 3. 从Storage下载文件
    // fileUrl格式: https://.../storage/v1/object/public/resumes/filename.pdf
    // 需要提取 bucket 和 path
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('public');
    
    if (bucketIndex === -1 || bucketIndex + 2 >= pathParts.length) {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 });
    }

    const bucket = pathParts[bucketIndex + 1];
    const filePath = pathParts.slice(bucketIndex + 2).join('/');

    // 下载文件
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('[download] Storage download failed:', downloadError);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // 4. 删除Storage文件（节省空间）
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      console.warn('[download] Failed to delete file after download:', deleteError);
      // 不阻断下载流程，继续返回文件
    } else {
      console.log('[download] File deleted after download:', filePath);
    }

    // 5. 清空数据库中的URL字段
    const updateField = type === 'resume' ? 'resume_url' : 'portfolio_url';
    await (supabase
      .from('creator_applications') as any)
      .update({ [updateField]: null })
      .eq('id', applicationId);

    // 6. 返回文件
    const fileName = filePath.split('/').pop() || `${type}_${applicationId}`;
    const contentType = fileData.type || 'application/octet-stream';

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('[download] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
