// lib/deliverables/generator.ts
import JSZip from 'jszip';
import PDFDocument from 'pdfkit';
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
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, right: 50, bottom: 50, left: 50 },
        info: {
          Title: 'Deliverable Document',
          Creator: 'AI Avatar Market',
        },
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Render markdown as styled text (basic parsing)
      const lines = markdown.split('\n');
      for (const line of lines) {
        if (line.startsWith('# ')) {
          doc.font('Helvetica-Bold').fontSize(22).fillColor('#1a1a1a').text(line.slice(2));
          doc.moveDown(0.5);
        } else if (line.startsWith('## ')) {
          doc.font('Helvetica-Bold').fontSize(18).fillColor('#333').text(line.slice(3));
          doc.moveDown(0.4);
        } else if (line.startsWith('### ')) {
          doc.font('Helvetica-Bold').fontSize(14).fillColor('#444').text(line.slice(4));
          doc.moveDown(0.3);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          doc.font('Helvetica').fontSize(11).fillColor('#333').text(`  • ${line.slice(2)}`);
        } else if (line.startsWith('```')) {
          // Skip code fence markers
          doc.moveDown(0.3);
        } else if (line.trim() === '') {
          doc.moveDown(0.3);
        } else {
          doc.font('Helvetica').fontSize(11).fillColor('#333').text(line);
        }
      }

      doc.end();
    });
  }
}

export const deliverableGenerator = new DeliverableGenerator();
