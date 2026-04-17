# Phase 29-30: 知识库系统与交付物生成

**文档版本**: v1.0  
**日期**: 2026-04-17  
**状态**: 待审核  
**方案**: 平衡型（方案B）

---

## 1. 项目目标

让AI分身从"对话工具"升级为"交付工具"：
- 创作者上传专业知识库 → 分身拥有领域专业能力
- 用户雇佣后直接获得可执行的交付物 → 无需反复对话

---

## 2. 需求范围

### Phase 29: 知识库系统（4周）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 文件上传界面 | 创作者上传 md/pdf/code/txt | P0 |
| 文档解析 | PDF转文本、代码保留结构 | P0 |
| 向量化存储 | bge-small-zh + pgvector | P0 |
| 对话检索 | 任务启动时检索相关知识 | P0 |
| 知识库管理 | 查看/删除已上传文件 | P1 |

### Phase 30: 交付物生成（4周）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 代码提取 | 从AI回复识别代码块 | P0 |
| Markdown转PDF | 生成专业报告文档 | P0 |
| ZIP打包 | 多文件打包下载 | P0 |
| 交付物展示 | 界面展示可下载文件 | P0 |
| 24小时清理 | 自动删除过期文件 | P0 |

---

## 3. 技术架构

### 3.1 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        创作者端                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ 上传知识文件 │───▶│ 解析向量化  │───▶│ 知识库管理  │         │
│  │ (md/pdf等)  │    │ (bge-small) │    │ (查看/删除) │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI分身对话引擎                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  提示词组装模块                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ SOUL.md     │  │ 知识库检索  │  │ 任务描述           │ │ │
│  │  │ (人格设定)  │  │ (top-5相关) │  │ (用户输入)         │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  │                          │                                   │ │
│  │                          ▼                                   │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │              完整系统提示词 (6000 tokens)             │   │ │
│  │  │  【人格】+【知识】+【交付指令】+【任务描述】         │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Kimi API 调用层                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   交付物处理模块                            │ │
│  │  - 代码提取与格式化                                          │ │
│  │  - Markdown转PDF (puppeteer/playwright)                     │ │
│  │  - ZIP打包 (JSZip)                                          │ │
│  │  - 上传 Supabase Storage                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        用户端                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ 查看交付物  │───▶│ 下载文件    │───▶│ 24h后清理   │         │
│  │ (代码/PDF)  │    │ (ZIP/单文件)│    │ (自动删除)  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 数据模型

```sql
-- 知识库表
CREATE TABLE avatar_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    
    -- 文件信息
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,  -- bytes
    mime_type TEXT NOT NULL,
    
    -- 内容
    content TEXT NOT NULL,  -- 提取的纯文本
    content_type TEXT NOT NULL CHECK (content_type IN ('soul', 'memory', 'document', 'code', 'text')),
    
    -- 向量化 (768维 for bge-small-zh)
    embedding VECTOR(768),
    
    -- 元数据
    metadata JSONB DEFAULT '{}',
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 向量索引
CREATE INDEX idx_avatar_knowledge_embedding ON avatar_knowledge 
    USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_avatar_knowledge_avatar ON avatar_knowledge(avatar_id);

-- 交付物表
CREATE TABLE task_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- 文件信息
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,  -- Supabase Storage path
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    
    -- 交付物类型
    deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('code', 'document', 'data', 'archive', 'other')),
    
    -- 过期清理
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 下载统计
    download_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_deliverables_task ON task_deliverables(task_id);
CREATE INDEX idx_task_deliverables_expires ON task_deliverables(expires_at);
```

### 3.3 API 设计

#### 知识库 API

```typescript
// POST /api/avatars/[id]/knowledge/upload
// 上传知识文件
{
  file: File,  // multipart/form-data
  contentType: 'soul' | 'memory' | 'document' | 'code' | 'text'
}

// Response
{
  success: true,
  knowledge: {
    id: string,
    filename: string,
    contentType: string,
    fileSize: number,
    chunkCount: number  // 分块数量
  }
}

// GET /api/avatars/[id]/knowledge
// 获取知识库列表
{
  success: true,
  knowledge: Array<{
    id: string,
    filename: string,
    contentType: string,
    fileSize: number,
    createdAt: string
  }>
}

// DELETE /api/avatars/[id]/knowledge/[knowledgeId]
// 删除知识文件

// POST /api/avatars/[id]/knowledge/retrieve
// 检索相关知识（内部API，对话时使用）
{
  query: string,  // 任务描述
  topK: number    // 默认 5
}

// Response
{
  success: true,
  results: Array<{
    id: string,
    content: string,
    contentType: string,
    similarity: number  // 相似度分数
  }>
}
```

#### 交付物 API

```typescript
// POST /api/tasks/[id]/deliverables/generate
// 生成交付物（从AI回复中提取）
{
  content: string,  // AI回复的完整内容
  format: 'auto' | 'code' | 'pdf' | 'zip'  // auto=自动判断
}

// Response
{
  success: true,
  deliverables: Array<{
    id: string,
    filename: string,
    fileType: string,
    downloadUrl: string,
    expiresAt: string
  }>
}

// GET /api/tasks/[id]/deliverables
// 获取任务交付物列表

// GET /api/deliverables/[id]/download
// 下载交付物（返回重定向到Supabase签名URL）
```

---

## 4. 核心模块设计

### 4.1 文档解析服务

```typescript
// lib/knowledge/parser.ts

interface ParseResult {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    pageCount?: number;
    language?: string;
  };
}

class DocumentParser {
  // Markdown - 直接返回
  async parseMarkdown(buffer: Buffer): Promise<ParseResult> {
    const text = buffer.toString('utf-8');
    return { text, metadata: {} };
  }
  
  // PDF - 使用 pdf-parse
  async parsePDF(buffer: Buffer): Promise<ParseResult> {
    const pdf = await pdfParse(buffer);
    return {
      text: pdf.text,
      metadata: {
        title: pdf.info?.Title,
        author: pdf.info?.Author,
        pageCount: pdf.numpages
      }
    };
  }
  
  // 代码文件 - 保留结构
  async parseCode(buffer: Buffer, filename: string): Promise<ParseResult> {
    const text = buffer.toString('utf-8');
    const ext = path.extname(filename);
    return {
      text: `// File: ${filename}\n${text}`,
      metadata: { language: ext }
    };
  }
  
  // 纯文本
  async parseText(buffer: Buffer): Promise<ParseResult> {
    return { text: buffer.toString('utf-8'), metadata: {} };
  }
}
```

### 4.2 向量化服务

```typescript
// lib/knowledge/embedding.ts

import { pipeline } from '@xenova/transformers';

class EmbeddingService {
  private model: any = null;
  
  // 懒加载模型
  async init() {
    if (!this.model) {
      // bge-small-zh: 512 tokens, 768 dims, 性能优秀
      this.model = await pipeline(
        'feature-extraction',
        'Xenova/bge-small-zh-v1.5'
      );
    }
  }
  
  // 生成向量
  async embed(text: string): Promise<number[]> {
    await this.init();
    
    // 截断到512 tokens
    const truncated = this.truncate(text, 512);
    
    const output = await this.model(truncated, {
      pooling: 'mean',
      normalize: true
    });
    
    return Array.from(output.data);
  }
  
  // 长文本分块嵌入
  async embedChunks(text: string, chunkSize: number = 500): Promise<Array<{
    text: string;
    embedding: number[];
  }>> {
    const chunks = this.chunkText(text, chunkSize);
    const embeddings = await Promise.all(
      chunks.map(async (chunk) => ({
        text: chunk,
        embedding: await this.embed(chunk)
      }))
    );
    return embeddings;
  }
  
  private chunkText(text: string, size: number): string[] {
    // 按语义边界分块（段落优先）
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');
    let currentChunk = '';
    
    for (const para of paragraphs) {
      if ((currentChunk + para).length > size && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += '\n\n' + para;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }
}
```

### 4.3 知识检索服务

```typescript
// lib/knowledge/retrieval.ts

class KnowledgeRetrieval {
  async retrieve(
    avatarId: string,
    query: string,
    topK: number = 5
  ): Promise<RetrievalResult[]> {
    // 1. 查询向量化
    const embeddingService = new EmbeddingService();
    const queryVector = await embeddingService.embed(query);
    
    // 2. 向量相似度搜索
    const { data: results } = await supabase.rpc('match_knowledge', {
      p_avatar_id: avatarId,
      p_embedding: queryVector,
      p_match_count: topK,
      p_similarity_threshold: 0.7
    });
    
    return results || [];
  }
}

// Supabase RPC 函数
/*
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
*/
```

### 4.4 交付物生成服务

```typescript
// lib/deliverables/generator.ts

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

class DeliverableGenerator {
  // 从AI回复中提取代码块
  extractCodeBlocks(content: string): CodeBlock[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: CodeBlock[] = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'txt';
      const code = match[2].trim();
      
      // 尝试从代码中提取文件名注释
      const filenameMatch = code.match(/(?:File:|文件名:)\s*(.+)/i);
      const filename = filenameMatch 
        ? filenameMatch[1].trim() 
        : this.inferFilename(language, code);
      
      blocks.push({ language, code, filename });
    }
    
    return blocks;
  }
  
  // 生成ZIP包
  async createZipPackage(
    blocks: CodeBlock[],
    readme: string
  ): Promise<Buffer> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // 添加代码文件
    blocks.forEach((block, index) => {
      const filename = block.filename || `file_${index}.${block.language}`;
      zip.file(filename, block.code);
    });
    
    // 添加 README
    zip.file('README.md', readme);
    
    return zip.generateAsync({ type: 'nodebuffer' });
  }
  
  // Markdown转PDF
  async markdownToPDF(
    markdown: string,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');
    
    const browser = await puppeteer.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true
    });
    
    const page = await browser.newPage();
    
    // Markdown转HTML
    const html = this.markdownToHTML(markdown);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      ...options
    });
    
    await browser.close();
    return pdf;
  }
  
  private inferFilename(language: string, code: string): string {
    const extMap: Record<string, string> = {
      python: 'py', javascript: 'js', typescript: 'ts',
      java: 'java', go: 'go', rust: 'rs',
      sql: 'sql', html: 'html', css: 'css',
      json: 'json', yaml: 'yml', markdown: 'md'
    };
    
    return `main.${extMap[language] || 'txt'}`;
  }
}
```

### 4.5 存储清理服务

```typescript
// lib/deliverables/cleanup.ts

class DeliverableCleanup {
  // 设置过期时间（24小时）
  static getExpiryDate(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  // 清理过期文件（每小时运行）
  async cleanupExpired(): Promise<void> {
    const { data: expired } = await supabase
      .from('task_deliverables')
      .select('id, file_path')
      .lt('expires_at', new Date().toISOString());
    
    for (const item of expired || []) {
      // 删除 Storage 文件
      await supabase.storage
        .from('deliverables')
        .remove([item.file_path]);
      
      // 删除数据库记录
      await supabase
        .from('task_deliverables')
        .delete()
        .eq('id', item.id);
    }
    
    console.log(`Cleaned up ${expired?.length || 0} expired deliverables`);
  }
}
```

---

## 5. UI/UX 设计

### 5.1 创作者端：知识库管理

```
┌─────────────────────────────────────────────────────────────┐
│  创作者中心 > 我的分身 > [分身名称] > 知识库                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📤 上传知识文件                                         ││
│  │                                                          ││
│  │ 支持格式：Markdown (.md)  PDF (.pdf)  代码文件          ││
│  │          纯文本 (.txt)                                  ││
│  │                                                          ││
│  │ [点击上传] 或拖拽文件到此处                              ││
│  │                                                          ││
│  │ 文件类型：○ SOUL人格  ○ 经验记忆  ○ 专业文档  ○ 代码   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📚 已上传文件 (5)                                       ││
│  │                                                          ││
│  │ 文件名              类型      大小    状态      操作    ││
│  │ ─────────────────────────────────────────────────────  ││
│  │ SOUL.md            SOUL      2.3KB   ✓ 已索引  [删除]  ││
│  │ Python工具集.py    代码      12KB    ✓ 已索引  [删除]  ││
│  │ 数据分析方法论.pdf 文档      156KB   ✓ 已索引  [删除]  ││
│  │ ...                                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  💡 提示：上传的文件会被向量化处理，对话时会自动检索相关内容 │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 用户端：任务交付

```
┌─────────────────────────────────────────────────────────────┐
│  任务 #1234 - 已完成                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ 任务已完成                                              │
│                                                              │
│  分身已为你生成以下交付物：                                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📦 代码包 (spider.zip)                                  ││
│  │   ├─ taobao_spider.py          主要爬虫代码            ││
│  │   ├─ anti_detect.py            反爬模块                ││
│  │   ├─ requirements.txt          依赖配置                ││
│  │   └─ README.md                 使用说明                ││
│  │                                                          ││
│  │   [下载 ZIP]                                             ││
│  │   ⚠️ 24小时后自动清理，请及时下载                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📄 方案文档 (analysis.pdf)                              ││
│  │   反爬策略分析报告                                       ││
│  │                                                          ││
│  │   [下载 PDF]                                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  💬 交付说明：                                               │
│  已为你编写完整的淘宝爬虫方案，包含...                       │
│                                                              │
│  [确认收货] [有问题反馈]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 部署与依赖

### 6.1 新增依赖

```json
{
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "pdf-parse": "^1.1.1",
    "jszip": "^3.10.1",
    "@sparticuz/chromium": "^119.0.0",
    "puppeteer-core": "^21.6.0",
    "marked": "^12.0.0"
  }
}
```

### 6.2 环境变量

```bash
# 向量模型（本地，无需API Key）
# bge-small-zh 首次使用自动下载

# Supabase Storage（已配置）
# 使用现有 NEXT_PUBLIC_SUPABASE_URL

# Chromium（Vercel Serverless 需要）
CHROMIUM_PATH=/usr/bin/chromium-browser  # 生产环境
```

### 6.3 数据库迁移

```sql
-- 运行文件：supabase/migrations/phase29_knowledge_base.sql
-- 包含：
-- 1. CREATE TABLE avatar_knowledge
-- 2. CREATE TABLE task_deliverables  
-- 3. CREATE INDEX
-- 4. CREATE FUNCTION match_knowledge()
-- 5. RLS 策略
```

---

## 7. 测试策略

| 模块 | 测试内容 | 方式 |
|------|----------|------|
| 文档解析 | PDF/Markdown/代码解析正确性 | 单元测试 |
| 向量化 | embedding 维度正确、相似度合理 | 单元测试 |
| 知识检索 | 检索结果相关性 | 集成测试 |
| 交付物生成 | ZIP/PDF 生成完整性 | 集成测试 |
| 存储清理 | 过期文件自动删除 | 定时任务测试 |

---

## 8. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| bge-small-zh 模型加载慢 | 首次上传慢 | 模型预加载、缓存 |
| PDF 转 HTML 复杂 | 排版错乱 | 使用成熟库、简化样式 |
| Chromium 体积大 | Vercel 部署慢 | @sparticuz/chromium 精简版 |
| 向量搜索性能差 | 对话延迟高 | ivfflat 索引、topK 限制 |
| 存储成本超预期 | 运营亏损 | 24小时清理策略 |

---

## 9. 成功指标

| 指标 | 目标 | 验证方式 |
|------|------|----------|
| 文件上传成功率 | >95% | 监控日志 |
| 向量检索相关性 | >0.7 | 人工抽样 |
| 交付物生成成功率 | >90% | 监控日志 |
| 平均生成时间 | <5s | 性能测试 |
| 用户下载率 | >70% | 下载统计 |

---

## 10. 里程碑

| 周次 | 里程碑 | 产出 |
|------|--------|------|
| Week 1 | 基础设施 | 数据库表、文档解析、向量化 |
| Week 2 | 知识库完成 | 上传界面、检索集成、管理功能 |
| Week 3 | 交付物基础 | 代码提取、ZIP打包 |
| Week 4 | PDF生成 | Markdown转PDF |
| Week 5 | 集成测试 | 端到端流程、性能优化 |
| Week 6 | 上线 | 部署、监控、文档 |
| Week 7-8 | 优化迭代 | 根据反馈调整 |

---

**请审核这份设计文档，确认后我将使用 writing-plans skill 创建详细的实施计划。**
