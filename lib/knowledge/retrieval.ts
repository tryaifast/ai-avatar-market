// lib/knowledge/retrieval.ts
import { createServiceClient } from '@/lib/supabase/client';
import { EmbeddingService } from './embedding';

function getDb() { return createServiceClient(); }

export interface SearchOptions {
  matchCount?: number;
  similarityThreshold?: number;
}

export interface RetrievalResult {
  id: string;
  content: string;
  content_type: string;
  similarity: number;
}

export class KnowledgeRetrievalService {
  async search(avatarId: string, queryEmbedding: number[], options: SearchOptions = {}): Promise<RetrievalResult[]> {
    const { matchCount = 5, similarityThreshold = 0.7 } = options;

    const db = getDb();
    const { data, error } = await (db as any).rpc('match_knowledge', {
      p_avatar_id: avatarId,
      p_embedding: queryEmbedding,
      p_match_count: matchCount,
      p_similarity_threshold: similarityThreshold,
    });

    if (error) {
      console.error('[Retrieval] Error:', error);
      return [];
    }

    return (data || []) as RetrievalResult[];
  }

  async retrieveByText(avatarId: string, queryText: string, topK: number = 5, threshold: number = 0.7): Promise<RetrievalResult[]> {
    const embeddingService = EmbeddingService.getInstance();
    const queryEmbedding = await embeddingService.getEmbedding(queryText);
    return this.search(avatarId, queryEmbedding, { matchCount: topK, similarityThreshold: threshold });
  }

  async buildKnowledgePrompt(avatarId: string, taskDescription: string): Promise<string> {
    const results = await this.retrieveByText(avatarId, taskDescription, 3, 0.6);
    if (results.length === 0) return '';

    const knowledge = results.map((r, i) => `[知识${i + 1}]\n${r.content}`).join('\n\n---\n\n');
    return `【相关知识库】\n${knowledge}`;
  }
}
