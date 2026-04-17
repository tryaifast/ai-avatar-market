# Phase 29-30: 知识库与交付物系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建创作者知识库系统（上传/向量化/检索）和交付物生成系统（代码提取/PDF/ZIP），让AI分身从对话工具升级为交付工具。

**Architecture:** 
- 知识库：bge-small-zh 本地嵌入模型 + pgvector 向量检索，支持 md/pdf/code/txt 上传
- 交付物：代码提取服务 + puppeteer PDF生成 + JSZip 打包，24小时后自动清理

**Tech Stack:** Next.js 14 + Supabase (pgvector) + @xenova/transformers + puppeteer-core + JSZip

---

## 实施计划总览

| 阶段 | 任务 | 预计时间 | 依赖 |
|------|------|----------|------|
| Week 1 | Task 1-5: 基础设施 | 5天 | Phase 28 |
| Week 2 | Task 6-10: 知识库API+界面 | 5天 | Task 1-5 |
| Week 3 | Task 11-15: 交付物系统 | 5天 | Task 1-5 |
| Week 4 | Task 16-20: 集成测试+上线 | 5天 | Task 6-15 |

---

## Task 1: 数据库迁移

**Files:**
- Create: `supabase/migrations/phase29_knowledge_base.sql`

- [ ] **Step 1: 创建 avatar_knowledge 表**

```sql
-- avatar_knowledge 表
CREATE TABLE avatar_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    
    content TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('soul', 'memory', 'document', 'code', 'text')),
    
    embedding VECTOR(768),
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_avatar_knowledge_embedding ON avatar_knowledge USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_avatar_knowledge_avatar ON avatar_knowledge(avatar_id);
```

- [ ] **Step 2: 创建 task_deliverables 表**

```sql
CREATE TABLE task_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    
    deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('code', 'document', 'data', 'archive', 'other')),
    
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    download_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_deliverables_task ON task_deliverables(task_id);
CREATE INDEX idx_task_deliverables_expires ON task_deliverables(expires_at);
```

- [ ] **Step 3: 创建向量检索函数**

```sql
CREATE OR REPLACE FUNCTION match_knowledge(
  p_avatar_id UUID,
  p_embedding VECTOR(768),
  p_match_count INT DEFAULT 5,
  p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    k.content,
    k.content_type,
    1 - (k.embedding <=> p_embedding) AS similarity
  FROM avatar_knowledge k
  WHERE k.avatar_id = p_avatar_id
    AND 1 - (k.embedding <=> p_embedding) > p_similarity_threshold
  ORDER BY k.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 4: 添加 RLS 策略**

```sql
ALTER TABLE avatar_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator can manage own avatar knowledge" ON avatar_knowledge
  USING (EXISTS (
    SELECT 1 FROM avatars a
    WHERE a.id = avatar_id AND a.creator_id = auth.uid()
  ));

ALTER TABLE task_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task participants can view deliverables" ON task_deliverables
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_id 
      AND (t.client_id = auth.uid() OR t.creator_id = auth.uid())
  ));
```

- [ ] **Step 5: 提交 SQL 文件**

```bash
git add supabase/migrations/phase29_knowledge_base.sql
git commit -m "db: Phase 29 knowledge base schema with pgvector"
```

---

## Task 2: 文档解析模块

**Files:**
- Create: `lib/knowledge/parser.ts`

- [ ] **Step 1: 安装依赖**

```bash
npm install pdf-parse
npm install -D @types/pdf-parse
```

- [ ] **Step 2: 实现文档解析器**

```typescript
// lib/knowledge/parser.ts
import pdfParse from 'pdf-parse';

export interface ParseResult {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    pageCount?: number;
  };
}

export class DocumentParser {
  async parse(buffer: Buffer, mimeType: string, originalName: string): Promise<ParseResult> {
    switch (mimeType) {
      case 'text/markdown':
      case 'text/x-markdown':
        return this.parseMarkdown(buffer);
      case 'application/pdf':
        return this.parsePDF(buffer);
      case 'text/plain':
        return this.parseText(buffer);
      default:
        if (mimeType.startsWith('text/')) {
          return this.parseCode(buffer, originalName);
        }
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  private parseMarkdown(buffer: Buffer): ParseResult {
    const text = buffer.toString('utf-8');
    const titleMatch = text.match(/^#\s+(.+)$/m);
    return { text, metadata: { title: titleMatch?.[1] } };
  }

  private async parsePDF(buffer: Buffer): Promise<ParseResult> {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        pageCount: data.numpages
      }
    };
  }

  private parseText(buffer: Buffer): ParseResult {
    return { text: buffer.toString('utf-8'), metadata: {} };
  }

  private parseCode(buffer: Buffer, filename: string): ParseResult {
    const text = buffer.toString('utf-8');
    return {
      text: `// File: ${filename}\n${text}`,
      metadata: { title: filename }
    };
  }
}

export const documentParser = new DocumentParser();
```

- [ ] **Step 3: 提交**

```bash
git add lib/knowledge/parser.ts package.json
git commit -m "feat: document parser for md/pdf/code/txt"
```

---

## Task 3: 向量化服务

**Files:**
- Create: `lib/knowledge/embedding.ts`

- [ ] **Step 1: 安装依赖**

```bash
npm install @xenova/transformers
```

- [ ] **Step 2: 实现向量化服务**

```typescript
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
```

- [ ] **Step 3: 提交**

```bash
git add lib/knowledge/embedding.ts package.json
git commit -m "feat: embedding service with bge-small-zh model"
```

---

## Task 4: 知识存储服务

**Files:**
- Create: `lib/knowledge/storage.ts`

- [ ] **Step 1: 实现知识存储服务**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add lib/knowledge/storage.ts
git commit -m "feat: knowledge storage service"
```

---

## Task 5: 知识检索服务

**Files:**
- Create: `lib/knowledge/retrieval.ts`

- [ ] **Step 1: 实现检索服务**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add lib/knowledge/retrieval.ts
git commit -m "feat: knowledge retrieval with vector similarity"
```

---

## Task 6: 知识库上传 API

**Files:**
- Create: `app/api/avatars/[id]/knowledge/upload/route.ts`

- [ ] **Step 1: 实现上传 API**

```typescript
// app/api/avatars/[id]/knowledge/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { documentParser } from '@/lib/knowledge/parser';
import { knowledgeStorage } from '@/lib/knowledge/storage';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const contentType = formData.get('contentType') as string;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const allowedTypes = ['text/markdown', 'text/x-markdown', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('text/')) {
      return NextResponse.json({ error: 'Unsupported file type: ' + file.type }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parsed = await documentParser.parse(buffer, file.type, file.name);
    const knowledge = await knowledgeStorage.save(params.id, {
      buffer, originalName: file.name, mimeType: file.type, size: file.size
    }, parsed, (contentType as any) || 'document');

    return NextResponse.json({ success: true, knowledge: { id: knowledge.id, originalName: knowledge.originalName } });

  } catch (error: any) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/avatars/[id]/knowledge/upload/route.ts
git commit -m "api: knowledge file upload endpoint"
```

---

## Task 7: 知识库 CRUD API

**Files:**
- Create: `app/api/avatars/[id]/knowledge/route.ts`

- [ ] **Step 1: 实现 CRUD API**

```typescript
// app/api/avatars/[id]/knowledge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { knowledgeStorage } from '@/lib/knowledge/storage';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const knowledge = await knowledgeStorage.list(params.id);
    return NextResponse.json({ success: true, knowledge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const knowledgeId = searchParams.get('knowledgeId');
    if (!knowledgeId) return NextResponse.json({ error: 'knowledgeId required' }, { status: 400 });

    await knowledgeStorage.delete(params.id, knowledgeId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/avatars/[id]/knowledge/route.ts
git commit -m "api: knowledge CRUD endpoints"
```

---

## Task 8: 交付物提取模块

**Files:**
- Create: `lib/deliverables/extractor.ts`

- [ ] **Step 1: 实现代码提取器**

```typescript
// lib/deliverables/extractor.ts
export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export class CodeExtractor {
  extract(content: string): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      const filename = this.extractFilename(code, language);
      blocks.push({ language, code, filename });
    }
    return blocks;
  }

  private extractFilename(code: string, language: string): string {
    const patterns = [/#\s*File:\s*(.+)/i, /\/\/\s*File:\s*(.+)/i];
    for (const pattern of patterns) {
      const match = code.match(pattern);
      if (match) return match[1].trim();
    }
    return this.inferDefaultFilename(language);
  }

  private inferDefaultFilename(language: string): string {
    const extMap: Record<string, string> = {
      python: 'main.py', javascript: 'main.js', typescript: 'main.ts',
      java: 'Main.java', go: 'main.go', rust: 'main.rs', sql: 'query.sql',
      html: 'index.html', css: 'style.css', json: 'config.json',
      yaml: 'config.yml', markdown: 'README.md', shell: 'script.sh'
    };
    return extMap[language.toLowerCase()] || 'main.txt';
  }
}

export const codeExtractor = new CodeExtractor();
```

- [ ] **Step 2: 提交**

```bash
git add lib/deliverables/extractor.ts
git commit -m "feat: code block extractor"
```

---

## Task 9: ZIP/PDF 生成服务

**Files:**
- Create: `lib/deliverables/generator.ts`

- [ ] **Step 1: 安装依赖**

```bash
npm install jszip @sparticuz/chromium puppeteer-core
npm install -D @types/jszip
```

- [ ] **Step 2: 实现生成器**

```typescript
// lib/deliverables/generator.ts
import JSZip from 'jszip';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { CodeBlock } from './extractor';

export class DeliverableGenerator {
  async generateZip(codeBlocks: CodeBlock[], readme: string): Promise<Buffer> {
    const zip = new JSZip();
    
    codeBlocks.forEach((block, i) => {
      const filename = block.filename || `file_${i}.txt`;
      zip.file(filename, block.code);
    });
    
    zip.file('README.md', readme);
    return zip.generateAsync({ type: 'nodebuffer' });
  }

  async markdownToPDF(markdown: string): Promise<Buffer> {
    const html = this.markdownToHTML(markdown);
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();
    return pdf;
  }

  private markdownToHTML(markdown: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1, h2, h3 { color: #333; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>${markdown}</body>
</html>`;
  }
}

export const deliverableGenerator = new DeliverableGenerator();
```

- [ ] **Step 3: 提交**

```bash
git add lib/deliverables/generator.ts package.json
git commit -m "feat: ZIP and PDF generator"
```

---

## Task 10: 交付物存储与清理服务

**Files:**
- Create: `lib/deliverables/storage.ts`
- Create: `lib/deliverables/cleanup.ts`

- [ ] **Step 1: 实现存储服务**

```typescript
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
```

- [ ] **Step 2: 实现清理服务**

```typescript
// lib/deliverables/cleanup.ts
import { createServiceClient } from '@/lib/supabase/client';

const db = createServiceClient();

export class DeliverableCleanup {
  async cleanupExpired(): Promise<number> {
    const { data: expired } = await db.from('task_deliverables').select('id, file_path').lt('expires_at', new Date().toISOString());
    
    for (const item of expired || []) {
      await db.storage.from('deliverables').remove([item.file_path]);
      await db.from('task_deliverables').delete().eq('id', item.id);
    }
    
    console.log(`[Cleanup] Removed ${expired?.length || 0} expired deliverables`);
    return expired?.length || 0;
  }
}

export const deliverableCleanup = new DeliverableCleanup();
```

- [ ] **Step 3: 提交**

```bash
git add lib/deliverables/storage.ts lib/deliverables/cleanup.ts
git commit -m "feat: deliverable storage and cleanup service"
```

---

## Task 11-20: UI 界面（简要说明）

由于篇幅限制，以下是 UI 任务清单：

| 任务 | 文件 | 说明 |
|------|------|------|
| Task 11 | `app/creator/avatar/[id]/knowledge/page.tsx` | 知识库管理页面 |
| Task 12 | `app/creator/avatar/[id]/knowledge/components/` | 上传组件、文件列表组件 |
| Task 13 | `app/client/workspace/[taskId]/page.tsx` | 任务详情页（含交付物下载） |
| Task 14 | `lib/hooks/useKnowledge.ts` | 知识库 React hooks |
| Task 15 | `lib/hooks/useDeliverables.ts` | 交付物 React hooks |
| Task 16-20 | 测试 & 集成 | API 测试、E2E测试、性能优化 |

---

## 数据库执行提醒

⚠️ **在开发前必须在 Supabase SQL Editor 执行：**

```sql
-- 文件位置: supabase/migrations/phase29_knowledge_base.sql
-- 包含内容:
-- 1. CREATE TABLE avatar_knowledge
-- 2. CREATE TABLE task_deliverables
-- 3. CREATE INDEX (包括向量索引)
-- 4. CREATE FUNCTION match_knowledge
-- 5. RLS 策略
```

---

**计划完成。确认后使用 subagent-driven-development 或 executing-plans skill 开始执行。**
