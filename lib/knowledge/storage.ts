// lib/knowledge/storage.ts
import { createServiceClient } from '@/lib/supabase/client';
import { embeddingService } from './embedding';

const db = createServiceClient();

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
    const chunks = await embeddingService.embedChunks(parsedContent.text, 500);
    const mainEmbedding = chunks[0]?.embedding;
    
    const fileExt = file.originalName.split('.').pop() || 'txt';
    const storageName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

    await db.storage.from('knowledge-files').upload(`${avatarId}/${storageName}`, file.buffer);

    const { data, error } = await db.from('avatar_knowledge').insert({
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
    return this.toKnowledgeFile(data);
  }

  async list(avatarId: string): Promise<KnowledgeFile[]> {
    const { data, error } = await db.from('avatar_knowledge').select('*').eq('avatar_id', avatarId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(this.toKnowledgeFile);
  }

  async delete(avatarId: string, knowledgeId: string): Promise<void> {
    const { data: knowledge } = await db.from('avatar_knowledge').select('filename').eq('id', knowledgeId).eq('avatar_id', avatarId).single();
    if (!knowledge) throw new Error('Knowledge not found');

    await db.storage.from('knowledge-files').remove([`${avatarId}/${knowledge.filename}`]);
    await db.from('avatar_knowledge').delete().eq('id', knowledgeId);
  }

  private toKnowledgeFile(data: any): KnowledgeFile {
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
