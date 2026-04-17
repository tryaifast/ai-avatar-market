// lib/knowledge/embedding.ts
import { pipeline, Pipeline } from '@xenova/transformers';

export interface EmbeddingChunk {
  text: string;
  embedding: number[];
}

export class EmbeddingService {
  private model: Pipeline | null = null;
  private modelName = 'Xenova/bge-small-zh-v1.5';

  async init(): Promise<void> {
    if (!this.model) {
      console.log('[Embedding] Loading model:', this.modelName);
      this.model = await pipeline('feature-extraction', this.modelName, {
        quantized: false
      });
      console.log('[Embedding] Model loaded');
    }
  }

  async embed(text: string): Promise<number[]> {
    await this.init();
    if (!this.model) throw new Error('Model not initialized');

    const truncated = this.truncateToTokens(text, 512);
    const output = await this.model(truncated, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  }

  async embedChunks(text: string, chunkSize: number = 500): Promise<EmbeddingChunk[]> {
    const chunks = this.chunkText(text, chunkSize);
    const results: EmbeddingChunk[] = [];

    for (const chunk of chunks) {
      const embedding = await this.embed(chunk);
      results.push({ text: chunk, embedding });
    }
    return results;
  }

  private truncateToTokens(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 1;
    return text.length <= maxChars ? text : text.slice(0, maxChars);
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    let currentChunk = '';

    for (const para of paragraphs) {
      const paraWithBreak = currentChunk ? '\n\n' + para : para;
      if ((currentChunk.length + paraWithBreak.length) > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += paraWithBreak;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.length > 0 ? chunks : [text.slice(0, chunkSize)];
  }
}

export const embeddingService = new EmbeddingService();
