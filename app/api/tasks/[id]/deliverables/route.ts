// app/api/tasks/[id]/deliverables/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { deliverableStorage } from '@/lib/deliverables/storage';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deliverables = await deliverableStorage.list(params.id);
    return NextResponse.json({ success: true, deliverables });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
