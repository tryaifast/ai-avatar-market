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
