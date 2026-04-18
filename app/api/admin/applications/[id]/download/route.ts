// app/api/admin/applications/[id]/download/route.ts
// 管理后台 - 下载申请简历/作品集（下载后自动删除Storage文件）

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { DB } from '@/lib/db/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证管理员身份
    const currentUser = await verifyAuth(request);
    if (!currentUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const user = await DB.User.getById(currentUser.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    // 2. 获取参数
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'resume' | 'portfolio';
    const applicationId = params.id;

    if (!type || !['resume', 'portfolio'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // 3. 查询申请记录
    const { data: application, error: appError } = await (DB.db
      .from('creator_applications') as any)
      .select('id, resume_url, portfolio_url')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 4. 获取文件路径
    const fileUrl = type === 'resume' ? application.resume_url : application.portfolio_url;
    if (!fileUrl) {
      return NextResponse.json({ error: `No ${type} file found` }, { status: 404 });
    }

    // 5. 从 Storage 下载文件
    const supabase = DB.db;
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(fileUrl);

    if (downloadError || !fileData) {
      console.error('[admin/download] Failed to download:', downloadError);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // 6. 删除 Storage 中的文件（节省空间）
    const { error: deleteError } = await supabase.storage
      .from('resumes')
      .remove([fileUrl]);

    if (deleteError) {
      console.error('[admin/download] Failed to delete file from storage:', deleteError);
      // 不阻断下载，只记录错误
    }

    // 7. 清空数据库中的 URL 字段
    const updateField = type === 'resume' ? 'resume_url' : 'portfolio_url';
    await (DB.db.from('creator_applications') as any)
      .update({ [updateField]: null })
      .eq('id', applicationId);

    // 8. 返回文件
    const fileName = fileUrl.split('/').pop() || `${type}_${applicationId}`;
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('[admin/download] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
