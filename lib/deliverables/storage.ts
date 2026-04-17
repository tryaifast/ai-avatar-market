// lib/deliverables/storage.ts
import { createServiceClient } from '@/lib/supabase/client';

function getDb() { return createServiceClient(); }

interface DeliverableRow {
  id: string;
  task_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  deliverable_type: string;
  expires_at: string;
  created_at: string;
  download_count: number;
}

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
    const db = getDb();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const path = `${taskId}/${Date.now()}_${filename}`;
    
    await db.storage.from('deliverables').upload(path, buffer);
    
    const { data, error } = await (db.from('task_deliverables') as any).insert({
      task_id: taskId,
      filename,
      file_path: path,
      file_size: buffer.length,
      mime_type: mimeType,
      deliverable_type: type,
      expires_at: expiresAt.toISOString()
    }).select().single();
    
    if (error) throw error;
    
    const row = data as DeliverableRow;
    return {
      id: row.id,
      taskId: row.task_id,
      filename: row.filename,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      deliverableType: row.deliverable_type,
      downloadUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deliverables/${path}`,
      expiresAt: new Date(row.expires_at)
    };
  }

  async list(taskId: string): Promise<DeliverableFile[]> {
    const db = getDb();
    const { data, error } = await (db.from('task_deliverables') as any).select('*').eq('task_id', taskId).order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as DeliverableRow[]).map(this.toDeliverableFile);
  }

  private toDeliverableFile(data: DeliverableRow): DeliverableFile {
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
