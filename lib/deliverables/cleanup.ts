// lib/deliverables/cleanup.ts
import { createServiceClient } from '@/lib/supabase/client';

function getDb() { return createServiceClient(); }

interface ExpiredDeliverable {
  id: string;
  file_path: string;
}

export class DeliverableCleanup {
  async cleanupExpired(): Promise<number> {
    const db = getDb();
    const { data: expired } = await (db.from('task_deliverables') as any).select('id, file_path').lt('expires_at', new Date().toISOString());
    
    const items = (expired || []) as ExpiredDeliverable[];
    for (const item of items) {
      await db.storage.from('deliverables').remove([item.file_path]);
      await (db.from('task_deliverables') as any).delete().eq('id', item.id);
    }
    
    console.log(`[Cleanup] Removed ${items.length} expired deliverables`);
    return items.length;
  }
}

export const deliverableCleanup = new DeliverableCleanup();
