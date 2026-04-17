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
