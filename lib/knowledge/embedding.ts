// lib/knowledge/embedding.ts
// 向量化服务 - 使用阿里云百炼 Embedding API（免费额度）
// 备用：@xenova/transformers 本地模式（仅开发环境）

export interface EmbeddingChunk {
  text: string;
  embedding: number[];
}

export class EmbeddingService {
  private static instance: EmbeddingService | null = null;
  private apiKey: string | null = null;
  private baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding';
  private modelName = 'text-embedding-v2';  // 阿里云免费 embedding 模型
  private dimensions = 1536;  // text-embedding-v2 输出维度

  private constructor() {
    // 从环境变量读取 API Key
    this.apiKey = process.env.DASHSCOPE_API_KEY || process.env.ALIYUN_API_KEY || null;
  }

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  async getEmbedding(text: string): Promise<number[]> {
    // 如果没有 API Key，使用简单的 hash 向量（仅开发环境）
    if (!this.apiKey) {
      console.warn('[Embedding] No API key found, using simple hash fallback (dev only)');
      return this.simpleHashEmbedding(text);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          input: {
            texts: [this.truncateToTokens(text, 512)],
          },
          parameters: {
            text_type: 'document',
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('[Embedding] API error:', response.status, err);
        return this.simpleHashEmbedding(text);
      }

      const data = await response.json();
      if (data.output?.embeddings?.[0]?.embedding) {
        return data.output.embeddings[0].embedding;
      }

      console.warn('[Embedding] Unexpected API response:', JSON.stringify(data).slice(0, 200));
      return this.simpleHashEmbedding(text);
    } catch (err: any) {
      console.error('[Embedding] API call failed:', err.message);
      return this.simpleHashEmbedding(text);
    }
  }

  async embedChunks(text: string, chunkSize: number = 500): Promise<EmbeddingChunk[]> {
    const chunks = this.chunkText(text, chunkSize);
    const results: EmbeddingChunk[] = [];

    for (const chunk of chunks) {
      const embedding = await this.getEmbedding(chunk);
      results.push({ text: chunk, embedding });
    }
    return results;
  }

  // 简单的 hash 向量回退（开发环境用，不保证语义质量）
  private simpleHashEmbedding(text: string): number[] {
    const dim = 768;  // pgvector 列维度
    const vec = new Array(dim).fill(0);

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      vec[i % dim] += Math.sin(charCode * (i + 1)) * 0.1;
    }

    // 归一化
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map(v => v / norm);
  }

  private truncateToTokens(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 2; // 中文约2字符/token
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
