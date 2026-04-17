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
