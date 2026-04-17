// lib/knowledge/retrieval.ts
import { createServiceClient } from '@/lib/supabase/client';
import { embeddingService } from './embedding';

const db = createServiceClient();

export interface RetrievalResult {
  id: string;
  content: string;
  contentType: string;
  similarity: number;
}

export class KnowledgeRetrieval {
  async retrieve(avatarId: string, query: string, topK: number = 5, threshold: number = 0.7): Promise<RetrievalResult[]> {
    const queryEmbedding = await embeddingService.embed(query);
    
    const { data, error } = await db.rpc('match_knowledge', {
      p_avatar_id: avatarId,
      p_embedding: queryEmbedding,
      p_match_count: topK,
      p_similarity_threshold: threshold
    });
    
    if (error) {
      console.error('[Retrieval] Error:', error);
      return [];
    }
    
    return (data || []) as RetrievalResult[];
  }

  async buildKnowledgePrompt(avatarId: string, taskDescription: string): Promise<string> {
    const results = await this.retrieve(avatarId, taskDescription, 3, 0.6);
    if (results.length === 0) return '';
    
    const knowledge = results.map((r, i) => `[知识${i + 1}]\n${r.content}`).join('\n\n---\n\n');
    return `【相关知识库】\n${knowledge}`;
  }
}

export const knowledgeRetrieval = new KnowledgeRetrieval();
