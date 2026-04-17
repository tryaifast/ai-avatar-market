// app/api/tasks/[id]/deliverables/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { codeExtractor } from '@/lib/deliverables/extractor';
import { deliverableGenerator } from '@/lib/deliverables/generator';
import { deliverableStorage } from '@/lib/deliverables/storage';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content, format = 'auto' } = await req.json();
    if (!content) return NextResponse.json({ error: 'No content provided' }, { status: 400 });

    const results = [];

    // Extract code blocks and create ZIP
    if (format === 'auto' || format === 'zip') {
      const codeBlocks = codeExtractor.extract(content);
      if (codeBlocks.length > 0) {
        const zipBuffer = await deliverableGenerator.generateZip(codeBlocks, '# 交付物说明\n\n请查看压缩包内的代码文件和README。');
        const file = await deliverableStorage.save(params.id, zipBuffer, 'deliverables.zip', 'application/zip', 'archive');
        results.push({ type: 'zip', ...file });
      }
    }

    // Generate PDF from markdown content
    if (format === 'auto' || format === 'pdf') {
      const docContent = content.replace(/```[\s\S]*?```/g, '');
      if (docContent.trim()) {
        const pdfBuffer = await deliverableGenerator.markdownToPDF(docContent);
        const file = await deliverableStorage.save(params.id, pdfBuffer, 'document.pdf', 'application/pdf', 'document');
        results.push({ type: 'pdf', ...file });
      }
    }

    return NextResponse.json({ success: true, deliverables: results });

  } catch (error: any) {
    console.error('[Generate] Error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
