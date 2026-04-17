// lib/knowledge/parser.ts

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
    try {
      // 动态 import unpdf 避免 webpack import.meta 警告
      const { getDocumentProxy } = await import('unpdf');
      const data = new Uint8Array(buffer);
      const pdf = await getDocumentProxy(data);
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        pages.push(pageText);
      }

      return {
        text: pages.join('\n\n'),
        metadata: {
          pageCount: pdf.numPages,
        }
      };
    } catch (err: any) {
      // PDF 解析失败时返回空文本，不影响整体流程
      console.warn('[parser] PDF parse failed:', err.message);
      return { text: '', metadata: {} };
    }
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
