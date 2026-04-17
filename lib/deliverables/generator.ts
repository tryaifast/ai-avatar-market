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
