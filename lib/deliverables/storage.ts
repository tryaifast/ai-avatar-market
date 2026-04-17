// lib/deliverables/storage.ts
import { createServiceClient } from '@/lib/supabase/client';

const db = createServiceClient();

export interface DeliverableFile {
  id: string;
  taskId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  deliverableType: string;
  downloadUrl: string;
  expiresAt: Date;
}

export class DeliverableStorage {
  async save(taskId: string, buffer: Buffer, filename: string, mimeType: string, type: string): Promise<DeliverableFile> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const path = `${taskId}/${Date.now()}_${filename}`;
    
    await db.storage.from('deliverables').upload(path, buffer);
    
    const { data, error } = await db.from('task_deliverables').insert({
      task_id: taskId,
      filename,
      file_path: path,
      file_size: buffer.length,
      mime_type: mimeType,
      deliverable_type: type,
      expires_at: expiresAt.toISOString()
    }).select().single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      taskId: data.task_id,
      filename: data.filename,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      deliverableType: data.deliverable_type,
      downloadUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deliverables/${path}`,
      expiresAt: new Date(data.expires_at)
    };
  }

  async list(taskId: string): Promise<DeliverableFile[]> {
    const { data, error } = await db.from('task_deliverables').select('*').eq('task_id', taskId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(this.toDeliverableFile);
  }

  private toDeliverableFile(data: any): DeliverableFile {
    return {
      id: data.id,
      taskId: data.task_id,
      filename: data.filename,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      deliverableType: data.deliverable_type,
      downloadUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deliverables/${data.file_path}`,
      expiresAt: new Date(data.expires_at)
    };
  }
}

export const deliverableStorage = new DeliverableStorage();
