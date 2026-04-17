// lib/knowledge/embedding.ts
// 向量化服务 - 使用火山方舟 Coding Plan Embedding API
// 模型: doubao-embedding-vision, 维度: 1024

export interface EmbeddingChunk {
  text: string;
  embedding: number[];
}

export class EmbeddingService {
  private static instance: EmbeddingService | null = null;
  private apiKey: string | null = null;
  // 火山方舟 Coding Plan 专属 endpoint
  private baseUrl = 'https://ark.cn-beijing.volces.com/api/coding/v3/embeddings';
  private modelName = 'doubao-embedding-vision';
  public readonly dimensions = 1024;  // 火山方舟 embedding 维度

  private constructor() {
    // 从环境变量读取 API Key（优先 ARK_API_KEY，兼容 DASHSCOPE_API_KEY）
    this.apiKey = process.env.ARK_API_KEY || process.env.DASHSCOPE_API_KEY || null;
  }

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      console.warn('[Embedding] No API key found, using simple hash fallback (dev only)');
      return this.simpleHashEmbedding(text);
    }

    try {
      // 火山方舟 API 兼容 OpenAI 格式
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          input: this.truncateToTokens(text, 512),
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('[Embedding] API error:', response.status, err);
        return this.simpleHashEmbedding(text);
      }

      const data = await response.json();
      // OpenAI 格式: data[0].embedding
      if (data.data?.[0]?.embedding) {
        const embedding = data.data[0].embedding;
        // 验证维度
        if (embedding.length !== this.dimensions) {
          console.warn(`[Embedding] Dimension mismatch: expected ${this.dimensions}, got ${embedding.length}`);
        }
        return embedding;
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

  // 简单的 hash 向量回退（开发环境用，维度匹配数据库）
  private simpleHashEmbedding(text: string): number[] {
    const dim = this.dimensions;  // 1024 维
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
