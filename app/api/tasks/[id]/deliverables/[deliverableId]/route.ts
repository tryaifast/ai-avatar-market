import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

interface DeliverableRecord {
  id: string;
  task_id: string;
  filename: string;
  deliverable_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  download_count: number;
  expires_at: string;
  created_at: string;
}

// GET /api/tasks/[id]/deliverables/[deliverableId] - 下载交付物
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; deliverableId: string } }
) {
  try {
    const supabase = createServiceClient();
    const { id: taskId, deliverableId } = params;

    // 获取交付物记录
    const { data, error } = await supabase
      .from('task_deliverables')
      .select('*')
      .eq('id', deliverableId)
      .eq('task_id', taskId)
      .single();

    const deliverable = data as unknown as DeliverableRecord;

    if (error || !deliverable) {
      return NextResponse.json({ error: '交付物不存在' }, { status: 404 });
    }

    // 检查是否过期
    if (new Date(deliverable.expires_at) < new Date()) {
      return NextResponse.json({ error: '交付物已过期' }, { status: 410 });
    }

    // 从 Supabase Storage 下载文件
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('deliverables')
      .download(deliverable.file_path);

    if (downloadError || !fileData) {
      console.error('[deliverables/download] Storage error:', downloadError);
      return NextResponse.json({ error: '文件下载失败' }, { status: 500 });
    }

    // 更新下载计数
    await (supabase
      .from('task_deliverables') as any)
      .update({ download_count: deliverable.download_count + 1 })
      .eq('id', deliverableId);

    // 返回文件
    const headers = new Headers();
    headers.set('Content-Type', deliverable.mime_type);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(deliverable.filename)}"`);
    headers.set('Content-Length', deliverable.file_size.toString());

    return new NextResponse(fileData, { headers });
  } catch (err: any) {
    console.error('[deliverables/download] Error:', err);
    return NextResponse.json({ error: err.message || '下载失败' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]/deliverables/[deliverableId] - 删除交付物
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; deliverableId: string } }
) {
  try {
    const supabase = createServiceClient();
    const { id: taskId, deliverableId } = params;

    // 获取交付物记录
    const { data } = await supabase
      .from('task_deliverables')
      .select('file_path')
      .eq('id', deliverableId)
      .eq('task_id', taskId)
      .single();

    const deliverable = data as unknown as { file_path: string };

    if (deliverable?.file_path) {
      // 删除 Storage 文件
      await supabase.storage.from('deliverables').remove([deliverable.file_path]);
    }

    // 删除数据库记录
    await supabase.from('task_deliverables').delete().eq('id', deliverableId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[deliverables/delete] Error:', err);
    return NextResponse.json({ error: err.message || '删除失败' }, { status: 500 });
  }
}
