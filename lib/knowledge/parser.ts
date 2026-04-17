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
