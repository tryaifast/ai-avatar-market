// lib/deliverables/cleanup.ts
import { createServiceClient } from '@/lib/supabase/client';

const db = createServiceClient();

export class DeliverableCleanup {
  async cleanupExpired(): Promise<number> {
    const { data: expired } = await db.from('task_deliverables').select('id, file_path').lt('expires_at', new Date().toISOString());
    
    for (const item of expired || []) {
      await db.storage.from('deliverables').remove([item.file_path]);
      await db.from('task_deliverables').delete().eq('id', item.id);
    }
    
    console.log(`[Cleanup] Removed ${expired?.length || 0} expired deliverables`);
    return expired?.length || 0;
  }
}

export const deliverableCleanup = new DeliverableCleanup();
