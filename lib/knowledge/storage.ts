// lib/knowledge/storage.ts
import { createServiceClient } from '@/lib/supabase/client';
import { EmbeddingService } from './embedding';

// 延迟初始化，避免模块加载时 supabaseUrl 缺失
function getDb() { return createServiceClient(); }

interface KnowledgeRow {
  id: string;
  avatar_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  content: string;
  content_type: 'soul' | 'memory' | 'document' | 'code' | 'text';
  created_at: string;
  metadata: any;
}

export interface KnowledgeFile {
  id: string;
  avatarId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  content: string;
  contentType: 'soul' | 'memory' | 'document' | 'code' | 'text';
  createdAt: string;
}

export class KnowledgeStorage {
  async save(
    avatarId: string,
    file: { buffer: Buffer; originalName: string; mimeType: string; size: number },
    parsedContent: { text: string; metadata: any },
    contentType: 'soul' | 'memory' | 'document' | 'code' | 'text'
  ): Promise<KnowledgeFile> {
    const db = getDb();
    const embeddingService = EmbeddingService.getInstance();
    const chunks = await embeddingService.embedChunks(parsedContent.text, 500);
    const mainEmbedding = chunks[0]?.embedding;
    
    const fileExt = file.originalName.split('.').pop() || 'txt';
    const storageName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

    await db.storage.from('knowledge-files').upload(`${avatarId}/${storageName}`, file.buffer);

    const { data, error } = await (db.from('avatar_knowledge') as any).insert({
      avatar_id: avatarId,
      filename: storageName,
      original_name: file.originalName,
      file_size: file.size,
      mime_type: file.mimeType,
      content: parsedContent.text,
      content_type: contentType,
      embedding: mainEmbedding,
      metadata: { ...parsedContent.metadata, chunks: chunks.length }
    }).select().single();

    if (error) throw error;
    return this.toKnowledgeFile(data as KnowledgeRow);
  }

  async list(avatarId: string): Promise<KnowledgeFile[]> {
    const db = getDb();
    const { data, error } = await (db.from('avatar_knowledge') as any).select('*').eq('avatar_id', avatarId).order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as KnowledgeRow[]).map(this.toKnowledgeFile);
  }

  async delete(avatarId: string, knowledgeId: string): Promise<void> {
    const db = getDb();
    const { data: knowledge } = await (db.from('avatar_knowledge') as any).select('filename').eq('id', knowledgeId).eq('avatar_id', avatarId).single();
    if (!knowledge) throw new Error('Knowledge not found');

    const row = knowledge as KnowledgeRow;
    await db.storage.from('knowledge-files').remove([`${avatarId}/${row.filename}`]);
    await (db.from('avatar_knowledge') as any).delete().eq('id', knowledgeId);
  }

  private toKnowledgeFile(data: KnowledgeRow): KnowledgeFile {
    return {
      id: data.id,
      avatarId: data.avatar_id,
      filename: data.filename,
      originalName: data.original_name,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      content: data.content,
      contentType: data.content_type,
      createdAt: data.created_at
    };
  }
}

export const knowledgeStorage = new KnowledgeStorage();
